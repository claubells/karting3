package com.example.karting3.controllers;

import com.example.karting3.services.RackService;
import com.example.karting3.dto.RackReservationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rack")
@CrossOrigin("*")
public class RackController {

    @Autowired
    RackService rackService;

    @GetMapping("/reservations")
    public ResponseEntity<List<RackReservationDTO>> getRackReservations() {
        return ResponseEntity.ok(rackService.getAllReservations());
    }

}

