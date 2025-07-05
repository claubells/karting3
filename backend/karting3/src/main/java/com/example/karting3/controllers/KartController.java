package com.example.karting3.controllers;

import com.example.karting3.entities.KartEntity;
import com.example.karting3.services.KartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kart")
@CrossOrigin("*")
public class KartController {
    @Autowired
    KartService kartService;

    @GetMapping("/") //obtiene los karts
    public ResponseEntity<List<KartEntity>> listAllKarts() {
        List<KartEntity> kart = kartService.getKarts();
        return ResponseEntity.ok(kart);
    }

    @GetMapping("/available/")
    public ResponseEntity<List<KartEntity>> findAvailableKarts() {
        List<KartEntity> kart = kartService.getAvailableKarts();
        return ResponseEntity.ok(kart);
    }
}
