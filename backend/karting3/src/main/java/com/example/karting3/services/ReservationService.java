package com.example.karting3.services;

import com.example.karting3.entities.KartEntity;
import com.example.karting3.entities.ReservationEntity;
import com.example.karting3.entities.ReservationHourEntity;
import com.example.karting3.repositories.KartRepository;
import com.example.karting3.repositories.ReceiptRepository;
import com.example.karting3.repositories.ReservationHourRepository;
import com.example.karting3.repositories.ReservationRepository;
import com.example.karting3.dto.RackReservationDTO;
import com.example.karting3.dto.ReservationMiniDTO;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private KartRepository kartRepository;

    @Autowired
    private ReservationHourRepository reservationHourRepository;


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
                throw new RuntimeException("La reserva debe incluir al menos un cliente.");
            }

            // Obtenemos los karts disponibles
            List<KartEntity> disponibles = kartRepository.findAvailableKarts();

            // verificamos disponibilidad
            if (disponibles.size() < numberPeople) {
                throw new RuntimeException("No hay suficientes karts disponibles para esta reserva.");
            }

            if(!fechaValida(reservation.getDateReservation(), reservation.getStartHourReservation(), reservation.getFinalHourReservation())) {
                throw new RuntimeException("La fecha de la reserva debe ser de hoy en adelante para máximo el 31 de de diciembre de este año.");
            }

            //asignamos los karts disponibles
            List<Long> idsKartsAsignados = disponibles.subList(0, numberPeople)
                    .stream()
                    .map(KartEntity::getIdKart)
                    .collect(Collectors.toList());; // pq aun no se hace el receipt

            reservation.setKartIds(idsKartsAsignados);
            reservation.setStatusReservation("Pendiente");

            System.out.println("Creando la reserva ");
            System.out.println("Cliente titular: " + reservation.getHoldersReservation());
            System.out.println("Client IDs: " + reservation.getClientIds());
            System.out.println("Kart IDs: " + reservation.getKartIds());

            return reservationRepository.save(reservation);
        }
        catch(Exception e){
            System.err.println("Error al crear la Reserva");
            e.printStackTrace();
            throw e;
        }
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
