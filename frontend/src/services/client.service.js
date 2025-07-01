import httpClient from './http-common';

 // esta funcion se encarga de verificar si el cliente ya existe en la base de datos
export async function checkClientExists(rutClient) {
    try {
        const res = await httpClient.get(`/api/v1/client/${rutClient}`);
        return { exists: true, data: res.data }; // cliente existe
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { exists: false }; // no existe
        }
        console.error("Error verificando cliente:", error);
        throw error;
    }
}

// funcion para crear un cliente
export async function createClient(clientData) {
    try {
        const response = await httpClient.post('/api/v1/client/', clientData);
        console.log("Cliente creado:", response.data);
        return response.data; // crear cliente
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return { exists: true, message: error.response.data };
        } else {
            console.error("Error al crear cliente:", error);
            throw error;
        }
    }
}

// funcion para obtener todos los clientes
export async function getClientByRut(rut) {
    try {
        const response = await httpClient.get(`/api/v1/client/${rut}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener cliente con rut ${rut}:`, error);
        throw error;
    }
}
