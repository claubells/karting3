package com.example.karting3.Services;

import com.example.karting3.Entities.HolidayEntity;
import com.example.karting3.Repositories.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    @Autowired
    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public List<HolidayEntity> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public HolidayEntity saveHoliday(HolidayEntity holiday) {
        return holidayRepository.save(holiday);
    }

    public void deleteById(Long id) {
        holidayRepository.deleteById(id);
    }

    public Double getDiscount(LocalDate fecha) {
        Double discount = holidayRepository.getDiscountByDate(fecha);
        //verficamos si es feriado
        if (discount != null) {
            return discount; // feriado real
        }
        // si no es feriado hay q ver si es sabado o domingo
        DayOfWeek dayOfWeek = fecha.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return holidayRepository.getDiscountByDescription("Descuento Fines de Semana"); // descuento por fin de semana
        }
        return 0.0; // no tiene descuento
    }
}
