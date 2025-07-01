package com.example.karting3.Services;

import com.example.karting3.Repositories.ReceiptRepository;
import com.example.karting3.dto.ReportResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ReceiptRepository receiptRepository;

    public ReportResponseDTO generateReportByTurns() {

        Map<Integer, Map<String, Integer>> turnsMap = new HashMap<>();

        for (Integer tipo : List.of(10, 15, 20)) {
            Map<String, Integer> porMes = new HashMap<>();
            for (String mes : List.of("01", "02", "03", "04", "05", "06")) {
                int ingreso = receiptRepository.obtenerIngresoPorVueltasYMes(tipo, mes); // ← tu método actual
                porMes.put(mes, ingreso);
            }

            // Calcular total y agregar
            int total = porMes.values().stream().mapToInt(i -> i).sum();
            porMes.put("total", total);

            turnsMap.put(tipo, porMes);
        }

        ReportResponseDTO dto = new ReportResponseDTO();
        dto.setTurns(turnsMap);
        return dto;
    }

    public ReportResponseDTO generateReportByPeople() {

        Map<String, Map<String, Integer>> peopleMap = new HashMap<>();

        for (String rango : List.of("1-2", "3-5", "6-10", "11-15")) {
            Map<String, Integer> porMes = new HashMap<>();
            for (String mes : List.of("01", "02", "03", "04", "05", "06")) {
                int ingreso = obtenerIngresoPorRangoYMes(rango, mes); // ← tu lógica actual
                porMes.put(mes, ingreso);
            }

            // Calcular total
            int total = porMes.values().stream().mapToInt(i -> i).sum();
            porMes.put("total", total);
            peopleMap.put(rango, porMes);
        }

        ReportResponseDTO dto = new ReportResponseDTO();
        dto.setPeople(peopleMap);
        return dto;
    }

    /*
    private String getRange(int groupSize) {
        if (groupSize >= 1 && groupSize <= 2) return "1-2";
        if (groupSize >= 3 && groupSize <= 5) return "3-5";
        if (groupSize >= 6 && groupSize <= 10) return "6-10";
        if (groupSize >= 11 && groupSize <= 15) return "11-15";
        return null;
    }

    List<ReservationMiniDTO> reservations = reservationRepository.findAll().stream()
                                                            .map(r -> new ReservationMiniDTO(
                                                                    r.getIdReservation(),
                                                                    r.getDateReservation(),
                                                                    r.getTurnsTimeReservation(),
                                                                    r.getGroupSizeReservation()
                                                            ))
                                                            .toList();
    private List<ReservationMiniDTO> fetchReservations() {
        String url = "http://localhost:8096/api/reservation/minimal";
        ResponseEntity<ReservationMiniDTO[]> response = restTemplate.getForEntity(url, ReservationMiniDTO[].class);
        return Arrays.asList(response.getBody());
    }

    private List<ReceiptDTO> fetchReceipts() {
        String url = "http://localhost:8096/api/receipt/minimal";
        ResponseEntity<ReceiptDTO[]> response = restTemplate.getForEntity(url, ReceiptDTO[].class);
        return Arrays.asList(response.getBody());
    }*/

    public int obtenerIngresoPorRangoYMes(String rango, String mes) {
        String[] partes = rango.split("-");
        int min = Integer.parseInt(partes[0]);
        int max = Integer.parseInt(partes[1]);

        return receiptRepository.obtenerIngresoPorRangoYMes(min, max, mes);
    }

}