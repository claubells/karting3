package com.example.karting3.services;

import com.example.karting3.entities.KartEntity;
import com.example.karting3.entities.ReservationEntity;
import com.example.karting3.entities.ReservationHourEntity;
import com.example.karting3.exception.BusinessValidationException;
import com.example.karting3.repositories.KartRepository;
import com.example.karting3.repositories.ReceiptRepository;
import com.example.karting3.repositories.ReservationHourRepository;
import com.example.karting3.repositories.ReservationRepository;
import com.example.karting3.dto.RackReservationDTO;
import com.example.karting3.dto.ReservationMiniDTO;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReceiptRepository receiptRepository;
    private final KartRepository kartRepository;
    private final ReservationHourRepository reservationHourRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            ReceiptRepository receiptRepository,
            KartRepository kartRepository,
            ReservationHourRepository reservationHourRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.receiptRepository = receiptRepository;
        this.kartRepository = kartRepository;
        this.reservationHourRepository = reservationHourRepository;
    }

    public List<ReservationEntity> findReservationBetweenDates(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        return reservationRepository.findOverlappingReservations(fecha, horaInicio, horaFin);
    }

    public List<ReservationEntity> getReservations(){
        return reservationRepository.findAll();
    }

    public List<ReservationMiniDTO> getMinimalReservations() {
        return reservationRepository.findAll().stream()
                .map(r -> new ReservationMiniDTO(
                        r.getIdReservation(),
                        r.getDateReservation(),
                        r.getTurnsTimeReservation(),
                        r.getGroupSizeReservation()
                ))
                .toList();
    }

    public List<RackReservationDTO> getAllForRack() {
        List<ReservationEntity> entities = reservationRepository.findAll();

        return entities.stream().map(res -> new RackReservationDTO(
                res.getIdReservation(),
                res.getHoldersReservation(),
                res.getDateReservation(),
                res.getStartHourReservation().toString(),
                res.getFinalHourReservation().toString(),
                res.getTurnsTimeReservation(),
                res.getGroupSizeReservation(),
                res.getStatusReservation()
        )).collect(Collectors.toList());
    }

    public ReservationEntity getReservationById(Long reservationId){
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID: " + reservationId));
    }

    public ReservationEntity createReservation(ReservationEntity reservation) {

        try{
            // extraemos la cantidad de personas
            int numberPeople = reservation.getGroupSizeReservation();

            // Validar que vengan los clientes
            if (reservation.getClientIds() == null || reservation.getClientIds().isEmpty()) {
                throw new BusinessValidationException("La reserva debe incluir al menos un cliente.");
            }
            int vueltas = reservation.getTurnsTimeReservation();
            if(vueltas != 10 && vueltas != 15 && vueltas != 20){
                throw new BusinessValidationException("Número de vueltas invalido. La reserva debe tener 10, 15 o 20 vueltas/minutos.");
            }

            // Obtenemos los karts disponibles
            List<KartEntity> disponibles = kartRepository.findAvailableKarts();

            // verificamos disponibilidad
            if (disponibles.size() < numberPeople) {
                throw new BusinessValidationException("No hay suficientes karts disponibles para esta reserva.");
            }

            // Validación de solapamiento de horario
            if (isOtherReservationDate(reservation)) {
                throw new BusinessValidationException("Ya existe una reserva en ese horario.");
            }

            // Validación de horario correcto
            if (!isHourValid(reservation)) {
                throw new BusinessValidationException("El horario de la reserva no es acorde a los horarios de atención.");
            }

            if(!fechaValida(reservation.getDateReservation(), reservation.getStartHourReservation(), reservation.getFinalHourReservation())) {
                throw new BusinessValidationException("La fecha de la reserva debe ser de hoy en adelante para máximo el 31 de de diciembre de este año.");
            }

            //asignamos los karts disponibles
            List<Long> idsKartsAsignados = disponibles.subList(0, numberPeople)
                    .stream()
                    .map(KartEntity::getIdKart)
                    .collect(Collectors.toList()); // pq aun no se hace el receipt

            reservation.setKartIds(idsKartsAsignados);
            reservation.setStatusReservation("Pendiente");

            return reservationRepository.save(reservation);
        }
        catch(Exception e){
            System.err.println("Error al crear la Reserva");
            e.printStackTrace();
            throw e;
        }
    }

    private boolean isOtherReservationDate(ReservationEntity reservation) {
        // Obtener el inicio y fin de la nueva reserva
        LocalDate reservationDate = reservation.getDateReservation();
        LocalTime startHour = reservation.getStartHourReservation();
        LocalTime finalHour = reservation.getFinalHourReservation();

        // Obtener las reservas existentes para esa fecha
        List<ReservationEntity> existingReservations = reservationRepository.findByDateReservation(reservationDate);

        for (ReservationEntity existing : existingReservations) {
            // Si la nueva reserva se solapa con una existente, retornamos true
            if ((startHour.isBefore(existing.getFinalHourReservation()) && finalHour.isAfter(existing.getStartHourReservation())) ||
                    (startHour.equals(existing.getStartHourReservation()) || finalHour.equals(existing.getFinalHourReservation()))) {
                return true;
            }
        }
        return false;
    }

    public boolean isHourValid(ReservationEntity reservation){
        // Obtener el inicio y fin de la nueva reserva
        LocalDate reservationDate = reservation.getDateReservation();
        LocalTime startHour = reservation.getStartHourReservation();
        LocalTime finalHour = reservation.getFinalHourReservation();

        if(startHour.isAfter(finalHour)){
            throw new BusinessValidationException("La hora de inicio es posterior a la final.");
        }

        // Verificar la duración entre las horas de inicio y final, con el número de vueltas (en minutos)
        int turns = reservation.getTurnsTimeReservation();

        // Calcular la diferencia entre las horas en minutos
        long durationMinutes = java.time.Duration.between(startHour, finalHour).toMinutes();

        // Verificar que la duración sea igual a la cantidad de turnos * duración de cada turno (por ejemplo, 10 minutos por vuelta)
        if (durationMinutes - 20 != turns) {
            throw new BusinessValidationException("La hora inicial con la final no coinciden con la catidad del turno.");
        }
        // Obtener los horarios de atención desde la base de datos
        ReservationHourEntity reservationHour = reservationHourRepository.findFirstByOrderByIdAsc();

        // Obtener los horarios de atención semanal y especial (fin de semana)
        LocalTime weeklyStartHour = reservationHour.getWeeklyHourMin();
        LocalTime weeklyEndHour = reservationHour.getWeeklyHourMax();

        LocalTime specialStartHour = reservationHour.getSpecialHourMin();
        LocalTime specialEndHour = reservationHour.getSpecialHourMax();

        // Verificar si la reserva es en fin de semana (sabado o domingo)
        DayOfWeek dayOfWeek = reservationDate.getDayOfWeek();
        boolean isWeekend = (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY);

        // Si es fin de semana, verificamos con los horarios especiales
        if (isWeekend) {
            return isTimeWithinRange(startHour, specialStartHour, specialEndHour) && isTimeWithinRange(finalHour, specialStartHour, specialEndHour);
        } else {
            // Si no es fin de semana, verificamos con los horarios semanales
            return isTimeWithinRange(startHour, weeklyStartHour, weeklyEndHour) && isTimeWithinRange(finalHour, weeklyStartHour, weeklyEndHour);
        }
    }

    // Método para verificar si una hora está dentro de un rango
    private boolean isTimeWithinRange(LocalTime time, LocalTime start, LocalTime end) {
        return !time.isBefore(start) && !time.isAfter(end);
    }

    public Boolean fechaValida(LocalDate date, LocalTime startHour, LocalTime finalHour){
        return fechaEnRango(date) && horasValidas(date, startHour, finalHour);
    }

    private boolean fechaEnRango(LocalDate date) {
        LocalDate today = LocalDate.now();
        LocalDate maxDate = LocalDate.of(2025, 12, 31);
        return !date.isBefore(today) && !date.isAfter(maxDate);
    }

    private boolean horasValidas(LocalDate date, LocalTime startHour, LocalTime finalHour) {
        if (startHour == null || finalHour == null || !startHour.isBefore(finalHour)) return false;

        Optional<ReservationHourEntity> optional = reservationHourRepository.findById(1L);
        if (!optional.isPresent()) return false;

        ReservationHourEntity config = optional.get();

        boolean isWeekday = !EnumSet.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY).contains(date.getDayOfWeek());
        LocalTime minHour = isWeekday ? config.getWeeklyHourMin() : config.getSpecialHourMin();
        LocalTime maxHour = isWeekday ? config.getWeeklyHourMax() : config.getSpecialHourMax();

        return !startHour.isBefore(minHour) && !finalHour.isAfter(maxHour);
    }

    public void deleteReservationById(Long id) {
        //Borramos los receipt que tengan el id de la reserva
        receiptRepository.deleteByReservationId(id);
        System.out.println("\n Eliminando la reserva de ID: " + id+" *****\n");
        //borramos la reserva
        reservationRepository.deleteById(id);
    }

    public List<ReservationEntity> getPendientesReservations() {
        return reservationRepository.findByStatusReservation("Pendiente");
    }
}
