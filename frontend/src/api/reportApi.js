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

export async function getReportByTurnsByMonth(anio, desde, hasta) {
    try {
        const res = await httpClient.get('/turns-month', {
            params: { anio, desde, hasta }
        });
        return res.data;
    } catch (error) {
        console.error('Error al obtener los reportes por Vueltas por Mes:', error);
        return [];
    }
};


