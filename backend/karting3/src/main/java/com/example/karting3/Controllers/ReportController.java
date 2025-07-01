package com.example.karting3.Controllers;

import com.example.karting3.Services.ReportService;
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

    @GetMapping("/turns")
    public ResponseEntity<ReportResponseDTO> getTurnsReport() {
        return ResponseEntity.ok(reportService.generateReportByTurns());
    }

    @GetMapping("/people")
    public ResponseEntity<ReportResponseDTO> getPeopleReport() {
        return ResponseEntity.ok(reportService.generateReportByPeople());
    }

}