import httpClient from './http-common/reservation';

// ********** RESERVATION **********
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
        const res = await httpClient.get('/reservation/available', {
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
        console.log('Datos que se están enviando al backend:', reservationData);
        const response = await httpClient.post('/reservation/', reservationData);
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
        const response = await httpClient.get('/reservation/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        return [];
    }
}

// Servicio para obtener una reserva por id
export async function getReservationById(idReservation) {
    try {
        const response = await httpClient.get(`/reservation/${idReservation}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la reserva por ID:', error);
        return null;
    }
}


// Servicio para borrar una reserva por id
export async function deleteReservationById(idReservation) {
    try {
        const response = await httpClient.delete(`/reservation/${idReservation}`);
        console.log('Reserva eliminada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        throw error;
    }
}

// ********** RESERVATION HOUR **********
// funcion para obtener los horarios de antención
export async function getHoursConfig() {
    try {
        const response = await httpClient.get('/hours/');
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener la configuración de horarios:', error);
        throw error;
    }
}

// ********** RECEIPTS **********
// Servicio para crear un recibo
export async function createReceipt(receiptData) {
    try {
        const response = await httpClient.post('/receipt/', receiptData);
        console.log('Recibo creado: ', response.data);
        return response.data; // crear recibo
    } catch (error) {
        console.error('Error al crear el recibo:', error);
        throw error;
    }
}

// Servicio para obtener todos los receipt por id de reserva
export async function getReceiptsByReservationId(reservationId) {
    try {
        const response = await httpClient.get(`/receipt/by-reservation-id?reservationId=${reservationId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los recibos por id de reserva:', error);
        return [];
    }
}

// servicio para simular un receipt
export async function simulateReceipt(receiptData) {
    try {
        const response = await httpClient.post('/receipt/simulate', receiptData);
        console.log('Recibo simulado creado: ', response.data);
        return response.data; // crear recibo
    } catch (error) {
        console.error('Error al simular el recibo:', error);
        throw error;
    }
}

