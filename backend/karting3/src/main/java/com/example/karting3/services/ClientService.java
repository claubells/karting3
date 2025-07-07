package com.example.karting3.services;

import com.example.karting3.entities.ClientEntity;
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
                throw new RuntimeException("\nEl RUT: "+client.getRutClient()+" ya está registrado.");
            }
            if (!rutValido(client.getRutClient())) {
                throw new RuntimeException("El RUT ingresado no es válido: " + client.getRutClient()+ ". Ingrese un rut correcto.");
            }
            if(!correoValido(client.getEmailClient())){
                throw new RuntimeException("El correo ingresado no es válido: " + client.getEmailClient());
            }
            if (!edadValida(client.getBirthdateClient())) {
                int edad = Period.between(client.getBirthdateClient(), LocalDate.now()).getYears();
                throw new RuntimeException("El cliente tiene " + edad + " años. Debe tener entre 14 y 120 años.");
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

        int años = Period.between(birthdate, today).getYears();
        return años >= 14 && años <= 120;
    }

    public Boolean rutValido(String rut) {
        if (rut == null || !rut.matches("\\d{7,8}[\\dkK]")) return false;
        String cuerpo = rut.substring(0, rut.length() - 1);
        char dv = Character.toUpperCase(rut.charAt(rut.length() - 1));
        int suma = 0, factor = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += (cuerpo.charAt(i) - '0') * factor;
            factor = (factor == 7) ? 2 : factor + 1;
        }
        int resto = 11 - (suma % 11);
        char dvEsperado = (resto == 11) ? '0' : (resto == 10) ? 'K' : (char) ('0' + resto);
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

    /*
    public String findNameByRut(String rut) {
        return clientRepository.findNameByRutClient(rut);
    }

    public Optional<LocalDate> findBirthdateByRut(String rut) {
        return clientRepository.findBirthdateByRut(rut);
    }


    public Optional<String> findEmailByRut(String rut) {
        return clientRepository.findEmailByRutClient(rut);
    }
    public Optional<Long> findIdByRut(String rut) {
        return clientRepository.getIdByRutClient(rut);
    }*/


    public Optional<ClientEntity> findById(Long id) {
        return clientRepository.findByIdClient(id);
    }
}
