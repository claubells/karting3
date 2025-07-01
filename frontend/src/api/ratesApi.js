import httpClient from './http-common/rates';

// Servicio para obtener los karts
export const getAllKarts = () => {
    return httpClient.get('/api/kart/');
};

