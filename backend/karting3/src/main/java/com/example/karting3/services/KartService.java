package com.example.karting3.services;

import com.example.karting3.entities.KartEntity;
import com.example.karting3.repositories.KartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KartService {

    @Autowired
    KartRepository kartRepository;

    public List<KartEntity> getKarts(){
        return kartRepository.findAll();
    }

    public List<KartEntity> getAvailableKarts() {
        return kartRepository.findAvailableKarts();
    }
}