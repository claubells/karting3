package com.example.karting3.controllers;

import com.example.karting3.services.ReservationHourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/hours")
@CrossOrigin("*")
public class ReservationHourController {
    @Autowired
    private ReservationHourService reservationHourService;

    @GetMapping("/") //obtiene todas las horas de atención
    public ResponseEntity<Map<String, Map<String, String>>> getHours() {
        return ResponseEntity.ok(reservationHourService.getHoursReservations());
    }
}
