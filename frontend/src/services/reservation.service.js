import httpClient from './http-common';

// Servicio para verificar la disponibilidad del horario
export async function verifyAvailability(fecha, horaInicio, horaFin) {
    try {
        console.log(
            'Verificando disponibilidad para:\nfecha:',
            fecha,
            '\nhoraInicio: ',
            horaInicio,
            '\nhoraFin: ',
            horaFin
        );
        const res = await httpClient.get('/api/v1/reservation/available', {
            params: { fecha, horaInicio, horaFin },
        });
        return res.data.disponible;
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        return false;
    }       
}

// Servicio para crear la reserva
export async function createReservation(reservationData) {
    try {
        const response = await httpClient.post('/api/v1/reservation/', reservationData);
        console.log('Reserva creada: ', response.data);
        return response.data; // crear cliente
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return { exists: true, message: error.response.data };
        } else {
            console.error('Error al crear reserva:', error);
            throw error;
        }
    }
}


// Servicio para obtener todas las reservas
export async function getAllReservations() {
    try {
        const response = await httpClient.get('/api/v1/reservation/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        return [];
    }
}

// Servicio para obtener una reserva por id
export async function getReservationById(idReservation) {
    try {
        const response = await httpClient.get(`/api/v1/reservation/${idReservation}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la reserva por ID:', error);
        return null;
    }
}


// Servicio para borrar una reserva por id
export async function deleteReservationById(reservationId) {
    try {
        const response = await httpClient.delete(`/api/v1/reservation/${reservationId}`);
        console.log('Reserva eliminada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        throw error;
    }
}

// funcion para obtener los horarios de antención
export async function getHoursConfig() {
    try {
        const response = await httpClient.get('/api/v1/reservation/hours-config');
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener la configuración de horarios:', error);
        throw error;
    }
}

