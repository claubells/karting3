package com.example.karting3.Services;

import com.example.karting3.dto.RackReservationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RackService {

    @Autowired
    ReservationService reservationService;

    public List<RackReservationDTO> getAllReservations() {
        return reservationService.getAllForRack();
    }
}