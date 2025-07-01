package com.example.karting3.Controllers;

import com.example.karting3.Services.RatesLapsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rates")
@CrossOrigin("*")
public class RatesLapsController {

    @Autowired
    RatesLapsService ratesLapsService;

    @GetMapping("/laps/{laps}")
    public ResponseEntity<Double> getRatesByLaps(@PathVariable int laps) {
        Double rate = ratesLapsService.getRateByLaps(laps);
        return ResponseEntity.ok(rate);
    }
}
