import httpClient from './http-common/report';

export async function getReportByTurns() {
    try {
        const res = await httpClient.get('/turns');
        return res.data;
    } catch (error) {
        console.error('Error al obtener los reportes por Vueltas:', error);
        return [];
    }
};

export async function getReportByPeople() {
    try {
        const res = await httpClient.get('/people');
        return res.data;
    } catch (error) {
        console.error('Error al obtener los reportes por n de Personas:', error);
        return [];
    }
};

