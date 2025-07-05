package com.example.karting3.services;

import com.example.karting3.repositories.RatesLapsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RatesLapsService {

    @Autowired
    RatesLapsRepository ratesLapsRepository;

    public Double getRateByLaps(int laps) {
        return ratesLapsRepository.getRatesLapsEntityByLaps(laps);
    }
}
