package com.example.karting3.Services;

import com.example.karting3.Entities.KartEntity;
import com.example.karting3.Entities.ReservationEntity;
import com.example.karting3.Repositories.KartRepository;
import com.example.karting3.Repositories.ReceiptRepository;
import com.example.karting3.Repositories.ReservationRepository;
import com.example.karting3.dto.RackReservationDTO;
import com.example.karting3.dto.ReservationMiniDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    KartRepository kartRepository;


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

            //asignamos los karts disponibles
            List<Long> idsKartsAsignados = disponibles.subList(0, numberPeople)
                    .stream()
                    .map(KartEntity::getIdKart)
                    .collect(Collectors.toList());; // pq aun no se hace el receipt

            reservation.setKartIds(idsKartsAsignados);
            reservation.setStatusReservation("pendiente");

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


    public void deleteReservationById(Long id) {
        //Borramos los receipt que tengan el id de la reserva
        receiptRepository.deleteByReservationId(id);
        System.out.println("\n Eliminando la reserva de ID: " + id+" *****\n");
        //borramos la reserva
        reservationRepository.deleteById(id);
    }


}
