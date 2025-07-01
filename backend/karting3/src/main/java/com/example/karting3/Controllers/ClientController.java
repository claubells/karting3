package com.example.karting3.Controllers;

import com.example.karting3.Entities.ClientEntity;
import com.example.karting3.Services.ClientService;
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

    /*
    @GetMapping("/getname/{rut}")
    public ResponseEntity<String> getNameClientByRut(@PathVariable String rut) {
        Optional<String> name = clientService.findNameByRut(rut);
        if (name.isPresent()) {
            return ResponseEntity.ok(name.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Nombre de Cliente no encontrado rut : " + rut);
        }
    }

    @GetMapping("/getbirthdate/{rut}")
    public ResponseEntity<LocalDate> getBirthdateClientByRut(@PathVariable String rut) {
        Optional<LocalDate> date = clientService.findBirthdateByRut(rut);
        if (date.isPresent()) {
            return ResponseEntity.ok(date.get());
        } else {
            return clientService.findBirthdateByRut(rut)
                    .map(ResponseEntity::ok)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Fecha de cumpleaños no encontrada para el rut: " + rut
                    ));
        }
    }

    /*
    @GetMapping("/getemail/{rut}")
    public ResponseEntity<String> getEmailClientByRut(@PathVariable String rut) {
        Optional<String> name = clientService.findEmailByRut(rut);
        if (name.isPresent()) {
            return ResponseEntity.ok(name.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Nombre de Cliente no encontrado rut : " + rut);
        }
    }


    @GetMapping("/getid/{rut}")
    public ResponseEntity<Long> getIdClientByRut(@PathVariable String rut) {
        Optional<Long> date = clientService.findIdByRut(rut);
        if (date.isPresent()) {
            return ResponseEntity.ok(date.get());
        } else {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontró el ID para el rut: " + rut
            );
        }
    } */

}
