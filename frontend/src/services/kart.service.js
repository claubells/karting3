import httpClient from './http-common';

// Servicio para obtener los karts
export const getAllKarts = () => {
    return httpClient.get('/api/v1/kart/');
};
