import httpClient from './http-common/client';

export async function getClientByRut(rut) {
    try {
        const response = await httpClient.get(`/rut/${rut}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || `No se pudo obtener el cliente con RUT ${rut}`;
        console.error('Error obteniendo el cliente por RUT:', message);
        throw new Error(message); // Lanza el mensaje real para que el componente lo use
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