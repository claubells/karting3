package com.example.karting3.Services;

import com.example.karting3.Repositories.BirthdayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class BirthdayService {

    @Autowired
    private BirthdayRepository birthdayRepository;

    public Double getBirthDiscount(LocalDate birthdateClient, LocalDate reservationDate, int groupSizeReservation) {
        if (groupSizeReservation >= 3 && birthdateClient.getDayOfMonth() == reservationDate.getDayOfMonth() && birthdateClient.getMonth() == reservationDate.getMonth()) {
            return birthdayRepository.getDiscountById(2); // 50%
        }
        return birthdayRepository.getDiscountById(1); // 0
    }
}
