import httpClient from './http-common/specialday';

// funcion para obtener los días festivos
export async function getHolidays() {
    try {
        const response = await httpClient.get('/holidays');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los días festivos: ', error);
        return [];
    }
}

// funcion para obtener el descuento según la fecha dada
export async function getDiscount(fecha) {
    try {
        const response = await httpClient.get(`/discount/${fecha}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el descuento por la fecha ', fecha, error);
        return error;
    }
}
