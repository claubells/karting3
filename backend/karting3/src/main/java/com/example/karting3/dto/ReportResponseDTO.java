package com.example.karting3.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {
    private Map<Integer, Map<String, Integer>> turns;
    private Map<String, Map<String, Integer>> people;
}