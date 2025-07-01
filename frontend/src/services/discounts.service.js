import httpClient from './http-common';

// Servicio para obtener el descuento de cumpleaños
export async function getBirthdayDiscount() {
    try {
        const response = await httpClient.get('/api/v1/reservation/birthday-discount');
        return response.data; // va a ser un número decimal
    } catch (error) {
        console.error('Error al obtener el descuento de cumpleaños:', error);
        throw error; // Manejo de errores
    }
}

// funcion para obtener los días festivos
export async function getHolidays() {
    try {
        const response = await httpClient.get('/api/v1/receipt/holidays');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los días festivos: ', error);
        return [];
    }
}


/*
//desceunto para dias especiales fines de semana y feriados
export async function getSpecialDayDiscount() {
    try{
        const response = await httpClient.get('/api/v1/receipt/special-day-discount');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el descuento por día especial: ', error);
        return 0;
    }
}*/