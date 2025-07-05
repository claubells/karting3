package com.example.karting3.controllers;

import com.example.karting3.services.ReportService;
import com.example.karting3.dto.ReportResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/report")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    ReportService reportService;

    @GetMapping("/turns-month")
    public ResponseEntity<ReportResponseDTO> getTurnsReportByMonth(
            @RequestParam(name = "anio", required = false) String anio,
            @RequestParam(name = "desde", required = false) String desde,
            @RequestParam(name = "hasta", required = false) String hasta
    ) {
        return ResponseEntity.ok(reportService.generateReportByTurnsByMonth(anio, desde, hasta));
    }



}