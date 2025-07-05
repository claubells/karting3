import httpClient from './http-common/client';

export async function getClientByRut(rut) {
    try {
        const response = await httpClient.get(`/rut/${rut}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo el cliente por RUT:', error);
        throw error;
    }
}