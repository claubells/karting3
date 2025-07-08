package com.example.karting3.services;

import com.example.karting3.entities.ClientEntity;
import com.example.karting3.exception.BusinessValidationException;
import com.example.karting3.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    ClientRepository clientRepository;

    public ArrayList<ClientEntity> getClients(){
        return (ArrayList<ClientEntity>) clientRepository.findAll();
    }

    public ClientEntity createClient(ClientEntity client) {
        try {
            if(clientRepository.findByRutClient(client.getRutClient()).isPresent()){
                throw new BusinessValidationException("RUT inválido: " + client.getRutClient());
            }
            if (!rutValido(client.getRutClient())) {
                throw new BusinessValidationException("El RUT ingresado no es válido: " + client.getRutClient()+ ". Ingrese un rut correcto.");
            }
            if(!correoValido(client.getEmailClient())){
                throw new BusinessValidationException("El correo ingresado no es válido: " + client.getEmailClient());
            }
            if (!edadValida(client.getBirthdateClient())) {
                int edad = Period.between(client.getBirthdateClient(), LocalDate.now()).getYears();
                throw new BusinessValidationException("El cliente tiene " + edad + " años. Debe tener entre 14 y 120 años.");
            }
            client.setEmailClient(client.getEmailClient().toLowerCase());
            client.setRutClient(client.getRutClient().toUpperCase());
            System.out.println("Cliente guardado en la base de datos...");
            return clientRepository.save(client);
        } catch (Exception e) {
            System.err.println("Error al guardar el cliente: " + e.getMessage());
            throw e;
        }
    }

    public Boolean edadValida(LocalDate birthdate){

        if (birthdate == null) return false;

        LocalDate today = LocalDate.now();
        if (birthdate.isAfter(today)) return false;

        int edad = Period.between(birthdate, today).getYears();
        return edad >= 14 && edad <= 120;
    }

    public Boolean rutValido(String rut) {
        if (rut == null || !rut.matches("\\d{7,8}[\\dkK]")) return false;
        String cuerpo = rut.substring(0, rut.length() - 1);
        char dv = Character.toUpperCase(rut.charAt(rut.length() - 1));
        int suma = 0;
        int factor = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += (cuerpo.charAt(i) - '0') * factor;
            factor = (factor == 7) ? 2 : factor + 1;
        }
        int resto = 11 - (suma % 11);
        char dvEsperado;
        if (resto == 11) {
            dvEsperado = '0';
        } else if (resto == 10) {
            dvEsperado = 'K';
        } else {
            dvEsperado = (char) ('0' + resto);
        }
        return dv == dvEsperado;
    }

    public boolean correoValido(String correo){
        if (correo == null || correo.isBlank()) return false;

        // Regex simplificada y efectiva para emails comunes
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return correo.matches(regex);
    }

    public Optional<ClientEntity> findByRut(String rut) {
        return clientRepository.findByRutClient(rut);
    }

    public Optional<ClientEntity> findById(Long id) {
        return clientRepository.findByIdClient(id);
    }
}
