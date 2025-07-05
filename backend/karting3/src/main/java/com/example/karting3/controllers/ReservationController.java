package com.example.karting3.controllers;

import com.example.karting3.entities.ReservationEntity;
import com.example.karting3.services.ReservationService;
import com.example.karting3.dto.RackReservationDTO;
import com.example.karting3.dto.ReservationMiniDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservation")
@CrossOrigin("*")
public class ReservationController {
    @Autowired
    ReservationService reservationService;


    @GetMapping("/") //obtiene todas las reservas
    public ResponseEntity<List<ReservationEntity>> listAllReservations() {
        List<ReservationEntity> reservation = reservationService.getReservations();
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/minimal")
    public ResponseEntity<List<ReservationMiniDTO>> getMinimalReservations() {
        List<ReservationMiniDTO> reservations = reservationService.getMinimalReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/rack")
    public ResponseEntity<List<RackReservationDTO>> getAllForRack() {
        List<RackReservationDTO> data = reservationService.getAllForRack();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{idReservation}")
    public ResponseEntity<ReservationEntity> getReservationById(@PathVariable Long idReservation) {
        ReservationEntity reservation = reservationService.getReservationById(idReservation);
        return ResponseEntity.ok(reservation);
    }

    @PostMapping("/")
    public ResponseEntity<?> createReservation(@RequestBody ReservationEntity reservation) {
        try {
            System.out.println("Empezando a crear una nueva reserva...");
            ReservationEntity newReservation = reservationService.createReservation(reservation);
            System.out.println("Creando nueva reserva ***\n: ");
            return ResponseEntity.ok(newReservation);
        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado a la hora de crear la reserva");
        }
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Boolean>> findReservationBetweenDates(
            @RequestParam String fecha,
            @RequestParam String horaInicio,
            @RequestParam String horaFin
    ){
        System.out.println(("\n**************************"));
        System.out.println(("Recibiendo finReservationBetwenDates: ..."));
        System.out.println("fecha: "+fecha+"\nHoraInicio: "+horaInicio+"\nHoraFin:"+horaFin);
        LocalDate fechaReserva = LocalDate.parse(fecha);
        LocalTime inicio = LocalTime.parse(horaInicio);
        LocalTime fin = LocalTime.parse(horaFin);

        List<ReservationEntity> traslapes = reservationService.findReservationBetweenDates(fechaReserva, inicio, fin);

        boolean disponible;
        // depuramos
        if (!traslapes.isEmpty()) { // si hay traslapes
            disponible = false; //no esta disponible
            System.out.println("Reservas traslapadas encontradas:");
            for (ReservationEntity reserva : traslapes) {// las imprimimos
                System.out.println("ID: " + reserva.getIdReservation() +
                        ", Inicio: " + reserva.getStartHourReservation() +
                        ", Fin: " + reserva.getFinalHourReservation());
            }

        }else{
            disponible = true; // esta disponible
        }
        return ResponseEntity.ok(Map.of("disponible", disponible));

    }

    @DeleteMapping("/{idReservation}")
    public ResponseEntity<String> deleteReservation(@PathVariable Long idReservation) {
        try {
            reservationService.deleteReservationById(idReservation);
            return ResponseEntity.ok("Reserva eliminada");
        } catch ( Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la reserva");
        }
    }


}
