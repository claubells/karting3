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

export async function getClientById(id) {
    try {
        const response = await httpClient.get(`/id/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo el cliente por ID:', error);
        throw error;
    }
}