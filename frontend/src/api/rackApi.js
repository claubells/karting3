import httpClient from './http-common/rack';

export async function getRackReservations() {
    try {
        const res = await httpClient.get('/reservations');
        return res.data;
    } catch (error) {
        console.error('Error al obtener el rack:', error);
        return [];
    }
};

