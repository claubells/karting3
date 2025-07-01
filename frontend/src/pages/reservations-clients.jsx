import React, { useState, useEffect } from 'react';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    TextField,
    Button,
    Typography,
    Chip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { createReservation} from '../api/reservationApi';
import { checkClientExists, createClient, getClientByRut } from '../api/loyaltyApi';
import { useNavigate } from 'react-router-dom';

export default function ReservationClients() {
    const navigate = useNavigate();

    const [numberPeople, setNumberPeople] = useState(''); // empezamos de un valor vacio
    const [clients, setClients] = useState([]);

    // se inicializa el estado de la reserva
    const [reservationData1, setReservationData1] = useState({
        dateReservation: '',
        startHourReservation: '',
        finalHourReservation: '',
        turnsTimeReservation: '',
        groupSizeReservation: '',
    });

    // se obtiene la reserva desde el localStorage
    useEffect(() => {
        const storedReserva = localStorage.getItem('reservationData1');
        if (storedReserva) {
            const { fecha, horaInicio, horaFin, turns } = JSON.parse(storedReserva);
            
        }
    }, []);

    // esta funcion se ejecuata cuando el usuario selecciona cuantas personas hay en el select
    const handleNumberPeopleChange = (e) => {
        // convierte el numero seleccionado a un entero
        const count = parseInt(e.target.value);
        // actualiza la cantidad de formularios a mostrar
        setNumberPeople(count);

        //se genera la cantidad de formularios segun la cantidad de personas
        const newClients = Array.from({ length: count }, (_, i) => ({
            rut: clients[i]?.rut || '',
            name: clients[i]?.name || '',
            email: clients[i]?.email || '',
            birthdate: clients[i]?.birthdate || '',
            registered: clients[i]?.registered || false, //conserva el estado de si el cliente está registrado
            message: clients[i]?.message || '', // conserva el mensaje de ya esta registrado (si es q lo está)
        }));

        setClients(newClients); // actualiza el array de clientes
    };

    // esta funcion se ejecuta cuando el usuario cambia el valor de un campo en uno de los formularios de persona
    const handleClientChange = async (index, field, value) => {
        const newClients = [...clients]; // copia el array actual
        newClients[index][field] = value; // actualiza el campo

        // se actualiza el estado de los clientes
        setClients(newClients);

        // Si se escribe RUT, consultar al backend
        if (field === 'rut') {
            const response = await checkClientExists(value);

            const updatedClients = [...newClients]; // hacemos una nueva copia actualizada
            if (response.exists) {
                // Si el RUT ya existe, mostrar un mensaje de error
                updatedClients[index].registered = true;
                updatedClients[index].message =
                    'Cliente ya registrado. \nNo es necesario volver a ingresar los datos.';
            } else {
                // Si el RUT no existe, limpiar el mensaje de error
                updatedClients[index].registered = false;
                updatedClients[index].message = '';
            }
            setClients(updatedClients); // actualiza array de clientes
        }
        
        
    };

    // cuando aprietas el boton de enviar
    const handleSubmit = async (e) => {
        e.preventDefault(); // evita que recargue la pagina

        // se crean los clientes
        for (const client of clients) {
            if (!client.registered) {
                if (!client.rut || !client.name || !client.email || !client.birthdate) {
                    alert('Por favor completa todos los campos de cada persona no registrada.');
                    return;
                }
            }
            if (!client.registered) {
                await createClient({
                    rutClient: client.rut,
                    nameClient: client.name,
                    emailClient: client.email,
                    birthdateClient: client.birthdate,
                });
            }
        }

        await handleSubmitReservation();
    };

    const handleSubmitReservation = async () => {
        try {
            const groupSize = parseInt(numberPeople);
            if (isNaN(groupSize) || groupSize <= 0) {
                alert('Cantidad de personas inválida.');
                return;
            }

            if (clients.length === 0) {
                alert('No hay personas registradas para la reserva.');
                return;
            }

            const clientList = [];

            for (const rut of clients.map((c) => c.rut)) {
                try {
                    const client = await getClientByRut(rut);
                    clientList.push(client);
                } catch (err) {
                    alert(`No se pudo obtener el cliente con RUT ${rut}`);
                    return;
                }
            }

            const storedReserva = JSON.parse(localStorage.getItem('reservationData1'));
            const { fecha, horaInicio, horaFin, turns } = storedReserva;

            const reservationData = {
                dateReservation: fecha,
                startHourReservation: horaInicio,
                finalHourReservation: horaFin,
                turnsTimeReservation: parseInt(turns),
                groupSizeReservation: parseInt(numberPeople),
            };

            const infoNewReservation = {
                ...reservationData,
                holdersReservation: clientList[0].rutClient,
                clientIds: clientList.map(c => c.idClient),
            };

            // creamos la reserva
            const newReservation = await createReservation(infoNewReservation);

            if (!newReservation || !newReservation.idReservation) {
                console.error('❌ La reserva no se creó correctamente:', newReservation);
                alert('No se pudo crear la reserva. El ID es inválido.');
                return;
            }

            // guardamos la nueva reserva en el localStorage
            localStorage.setItem('reservationData2', JSON.stringify({
                ...infoNewReservation,
                idReservation: newReservation.idReservation,
                clientList: clientList.map(c => ({ idClient: c.idClient, rutClient: c.rutClient })),
            }));

            localStorage.setItem('idReservation', newReservation.idReservation);

            // Limpiar localStorage y redirigir
            localStorage.removeItem('reservationData1');
            navigate('/reservation-summary');
        } catch (error) {
            console.error('Error al crear la reserva:', error);
            alert('No se pudo crear la reserva. Intenta nuevamente.');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, minWidth: 208 }}
        >
            <FormControl fullWidth>
                <InputLabel id="cantidad-label">Cantidad de personas</InputLabel>
                <Select
                    labelId="cantidad-label"
                    id="cantidad-personas"
                    value={numberPeople}
                    label="Cantidad de personas"
                    onChange={handleNumberPeopleChange}
                >
                    {[...Array(15).keys()].map((n) => (
                        <MenuItem key={n + 1} value={n + 1}>
                            {n + 1} persona{n + 1 > 1 ? 's' : ''}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {/* Campos por cada persona */}
            {numberPeople !== '' &&
                clients.map((client, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 280,
                            gap: 1,
                            p: 2,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="subtitle1">Persona {index + 1}</Typography>

                        {index === 0 && (
                            <Chip
                                icon={<StarIcon htmlColor="black" />}
                                label="Titular de la reserva"
                                size="small"
                                sx={{
                                    alignSelf: 'start',
                                    mb: 1,
                                    backgroundColor: '#f57f17',
                                    color: 'black',
                                }}
                            />
                        )}

                        <TextField
                            label="RUT"
                            value={client.rut}
                            onChange={(e) => handleClientChange(index, 'rut', e.target.value)}
                            required
                        />
                        <TextField
                            label="Nombre"
                            value={client.name}
                            onChange={(e) => handleClientChange(index, 'name', e.target.value)}
                            disabled={client.registered}
                            required
                        />
                        <TextField
                            label="Email"
                            value={client.email}
                            onChange={(e) => handleClientChange(index, 'email', e.target.value)}
                            disabled={client.registered}
                            required
                        />
                        <TextField
                            label="Fecha de nacimiento"
                            type="date"
                            value={client.birthdate}
                            onChange={(e) => handleClientChange(index, 'birthdate', e.target.value)}
                            disabled={client.registered}
                            required
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        {/*  Mensaje si está registrado */}
                        {client.registered && (
                            <Typography variant="body2" sx={{ color: 'lightgreen', mt: 1 }}>
                                {client.message.split('\n').map((line, idx) => (
                                    <span key={idx}>
                                        {line}
                                        <br />
                                    </span>
                                ))}
                            </Typography>
                        )}
                    </Box>
                ))}

            {/* Botón para enviar */}
            {numberPeople !== '' && (
                <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
                    Crear Reserva
                </Button>
            )}
        </Box>
    );
}
