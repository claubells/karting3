package com.example.karting3.controllers;

import com.example.karting3.entities.ClientEntity;
import com.example.karting3.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
@CrossOrigin("*")
public class ClientController {
    @Autowired
    ClientService clientService;

    @GetMapping("/") //obtiene todos los clientes
    public ResponseEntity<List<ClientEntity>> listAllClients() {
        List<ClientEntity> client = clientService.getClients();
        return ResponseEntity.ok(client);
    }

    @PostMapping("/")
    public ResponseEntity<?> createClient(@RequestBody ClientEntity client) {
        try {
            ClientEntity newClient = clientService.createClient(client);
            System.out.println("CLIENTE YA CREADO ***\nID: "+newClient.getIdClient()+"\nRUT: "+ newClient.getRutClient()+"\nNAME: "+newClient.getNameClient()+"\nBIRTHDATE: "+newClient.getBirthdateClient()+"\nEMAIL: "+newClient.getEmailClient());
            return ResponseEntity.ok(newClient);
        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/rut/{rut}")
    public ResponseEntity<?> getClientByRut(@PathVariable String rut) {
        Optional<ClientEntity> client = clientService.findByRut(rut);
        if (client.isPresent()) {
            return ResponseEntity.ok(client.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cliente no encontrado x su rut: " + rut);
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        Optional<ClientEntity> client = clientService.findById(id);
        if (client.isPresent()) {
            return ResponseEntity.ok(client.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cliente no encontrado x su id: " + id);
        }
    }

}
