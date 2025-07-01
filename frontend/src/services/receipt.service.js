import httpClient from './http-common';

// Servicio para crear un recibo
export async function createReceipt(receiptData) {
    try {
        const response = await httpClient.post('/api/v1/receipt/', receiptData);
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
        const response = await httpClient.get(`/api/v1/receipt/by-reservation-id?reservationId=${reservationId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los recibos por id de reserva:', error);
        return [];
    }
}

// servicio para simular un receipt
export async function simulateReceipt(receiptData) {
    try {
        const response = await httpClient.post('/api/v1/receipt/simulate', receiptData);
        console.log('Recibo simulado creado: ', response.data);
        return response.data; // crear recibo
    } catch (error) {
        console.error('Error al simular el recibo:', error);
        throw error;
    }
}


