package com.example.karting3.Controllers;

import com.example.karting3.Services.LoyaltyDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin("*")
public class LoyaltyDiscountController {

    @Autowired
    LoyaltyDiscountService loyaltyDiscountService;

    @GetMapping("/{rut}/{date}")
    public ResponseEntity<Double> getLoyaltyDiscount(@PathVariable String rut, @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            double discount = loyaltyDiscountService.getMonthlyFrequencyDiscount(rut, date);
            return ResponseEntity.ok(discount);
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
