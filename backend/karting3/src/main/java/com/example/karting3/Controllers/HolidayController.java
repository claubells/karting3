package com.example.karting3.Controllers;

import com.example.karting3.Entities.HolidayEntity;
import com.example.karting3.Services.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/specialday")
@CrossOrigin("*")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping("/holidays")
    public ResponseEntity<List<HolidayEntity>> getAllHolidays() {
        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    @PostMapping("/holidays")
    public ResponseEntity<HolidayEntity> saveHoliday(@RequestBody HolidayEntity holiday) {
        return ResponseEntity.ok(holidayService.saveHoliday(holiday));
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/discount/{fecha}")
    public ResponseEntity<Double> getDiscount(@PathVariable LocalDate fecha){
        return ResponseEntity.ok(holidayService.getDiscount(fecha));
    }
}
