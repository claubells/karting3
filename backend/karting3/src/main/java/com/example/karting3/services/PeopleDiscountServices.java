package com.example.karting3.services;

import com.example.karting3.repositories.PeopleDiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PeopleDiscountServices {

    @Autowired
    PeopleDiscountRepository peopleDiscountRepository;

    public Double getPeopleDiscount(int numberPeople) {
        Double discount = peopleDiscountRepository.getPeopleDiscountEntityByPeople(numberPeople);
        if(discount != null) {
            return discount;
        }
        return 0.0;
    }
}
