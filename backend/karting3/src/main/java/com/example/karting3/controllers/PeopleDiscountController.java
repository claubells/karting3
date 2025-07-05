package com.example.karting3.controllers;

import com.example.karting3.services.PeopleDiscountServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/people")
@CrossOrigin("*")
public class PeopleDiscountController {
    @Autowired
    PeopleDiscountServices peopleDiscountServices;

    /*
    @GetMapping("/discount/{numberPeople}")
    public ResponseEntity<Double> getPeopleDiscount(@PathVariable int numberPeople) {
        Double rate = peopleDiscountServices.getPeopleDiscount(numberPeople);
        return ResponseEntity.ok(rate);
    }

     */

}
