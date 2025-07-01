package com.example.karting3.Controllers;

import com.example.karting3.Services.BirthdayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/birthday")
@CrossOrigin("*")
public class BirthdayController{

    @Autowired
    BirthdayService birthdayService;

    /*
    @GetMapping("/discount/{birthdateClient}{reservationDate}{groupSizeReservation}")
    public Double GetBirthdayDiscount(@PathVariable LocalDate birthdateClient, @PathVariable LocalDate reservationDate, @PathVariable int groupSizeReservation) {
        return birthdayService.getBirthDiscount(birthdateClient, reservationDate, groupSizeReservation);
    }
     */

}
