package com.example.karting3.services;

import com.example.karting3.repositories.ReceiptRepository;
import com.example.karting3.dto.ReportResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ReceiptRepository receiptRepository;

    public ReportResponseDTO generateReportByTurnsByMonth(String anio, String desde, String hasta) {
        // Si vienen nulos, usamos todos los meses por defecto
        List<String> meses = List.of("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12");

        if (desde != null && hasta != null) {
            int iDesde = meses.indexOf(desde);
            int iHasta = meses.indexOf(hasta);
            if (iDesde >= 0 && iHasta >= iDesde) {
                meses = meses.subList(iDesde, iHasta + 1);
            }
        }

        Map<Integer, Map<String, Integer>> turnsMap = new HashMap<>();
        int totalGlobal = 0;

        for (Integer tipo : List.of(10, 15, 20)) {
            Map<String, Integer> porMes = new HashMap<>();

            for (String mes : meses) {
                int ingreso = receiptRepository.obtenerIngresoPorVueltasMesYAnio(tipo, mes, anio);
                porMes.put(mes, ingreso);
            }

            int total = porMes.values().stream().mapToInt(i -> i).sum();
            porMes.put("total", total);
            totalGlobal += total;
            turnsMap.put(tipo, porMes);
        }

        // Calcular totales mensuales
        Map<String, Integer> monthlyTotals = new HashMap<>();
        for (String mes : meses) {
            int totalMes = 0;
            for (Integer tipo : List.of(10, 15, 20)) {
                totalMes += turnsMap.get(tipo).getOrDefault(mes, 0);
            }
            monthlyTotals.put(mes, totalMes);
        }

        ReportResponseDTO dto = new ReportResponseDTO();
        dto.setTurns(turnsMap);
        dto.setTotalGlobal(totalGlobal);
        dto.setMonthlyTotals(monthlyTotals);
        return dto;
    }

}