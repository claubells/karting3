import httpClient from './http-common/loyalty';

 // esta funcion se encarga de verificar si el cliente ya existe en la base de datos
export async function checkClientExists(rutClient, handleError) {
    try {
        const res = await httpClient.get(`/client/rut/${rutClient}`);
        return { exists: true, data: res.data }; // cliente existe
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { exists: false };
        } else {
            if (handleError) handleError(error);
            return { exists: false }; 
        }
    }
}

// funcion para crear un cliente
export async function createClient(clientData) {
    try {
        const response = await httpClient.post('/client/', clientData);
        console.log("Cliente creado:", response.data);
        return response.data; // crear cliente
    } catch (error) {
        if (error.response) {
            // Acepta texto plano o JSON
            const backendMessage =
                typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response.data?.error || 'Error desconocido';

            throw new Error(backendMessage);
        } else {
            console.error("Error inesperado:", error);
            throw new Error('Error de red o inesperado al crear cliente.');
        }
    }
}

// funcion para obtener un cliente x rut
export async function getClientByRut(rut) {
    try {
        const response = await httpClient.get(`/client/rut/${rut}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener cliente con rut ${rut}:`, error);
        throw error;
    }
}

// funcion para obtener un cliente por id
export async function getClientById(id) {
    try {
        const response = await httpClient.get(`/client/id/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener cliente`, error);
        throw error;
    }
}
