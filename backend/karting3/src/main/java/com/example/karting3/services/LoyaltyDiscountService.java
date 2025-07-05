package com.example.karting3.services;

import com.example.karting3.repositories.LoyaltyDiscountRepository;
import com.example.karting3.repositories.ReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class LoyaltyDiscountService {

    @Autowired
    LoyaltyDiscountRepository loyaltyDiscountServiceRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    public double getMonthlyFrequencyDiscount(String rut, LocalDate date) {
        try {
            int cantidad = receiptRepository.countReceiptsByRutAndMonth(rut, date.getYear(), date.getMonthValue());
            System.out.println("Cantidad de visitas este mes: "+cantidad);

            if (cantidad >= 0) {
                if (cantidad >= 7) {
                    Optional<Double> descuento = loyaltyDiscountServiceRepository.getDiscountByVisit(7);
                    double valor = descuento.orElse(0.0);
                    System.out.println("Descuento aplicado (≥7 visitas): " + valor);
                    return valor;
                }
                Optional<Double> descuento = loyaltyDiscountServiceRepository.getDiscountByVisit(cantidad);
                double valor = descuento.orElse(0.0);
                System.out.println("Descuento aplicado (" + cantidad + " visitas): " + valor);
                return valor;
            }
            System.out.println("Error al calcular la cantidad de visitas.");
            return 0.0;
        } catch (Exception e) {
            System.err.println("Error al llamar a reservation-service: " + e.getMessage());
            return 0.0;
        }
    }
}
