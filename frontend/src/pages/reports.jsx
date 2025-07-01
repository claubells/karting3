import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getReportByTurns, getReportByPeople } from '../api/reportApi';

export default function Reports() {
    const [value, setValue] = React.useState('one');
    const [reportData, setReportData] = React.useState({ // de enero a junio para los reportes
        turns: {
            10: { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
            15: { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
            20: { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
        },
        people: {
            '1-2': { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
            '3-5': { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
            '6-10': { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0 },
            '11-15': { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0 , '06': 0},
        }
    });

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    React.useEffect(() => {
        generateReport();
    }, []);

    async function generateReport() {
        try {
            const turns = await getReportByTurns();   // llama a /api/report/turns
            const people = await getReportByPeople(); // llama a /api/report/people

            setReportData({
            turns: turns.turns,     // extrae solo el objeto turns
            people: people.people,  // extrae solo el objeto people
            });
        } catch (error) {
            console.error('Error al obtener datos del reporte:', error);
        }
    }

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                minHeight: '100vh',
                mt: 2,
                ml: 2,
            }}
        >
            <Typography variant="h6" textAlign="left" sx={{ mb: 2 }}>
                Reportes según:
            </Typography>

            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="secondary tabs example"
            >
                <Tab value="one" label="número de vueltas/tiempo" />
                <Tab value="two" label="número de personas" />
            </Tabs>

            {value === 'one' && (
                <Box mt={4} sx={{ width: '90%' }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Reporte de Ingresos por Vueltas o Tiempo
                    </Typography>

                    {reportData && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#424242' }}>
                                    <TableRow>
                                        <TableCell><b>Tipo</b></TableCell>
                                        <TableCell><b>Enero</b></TableCell>
                                        <TableCell><b>Febrero</b></TableCell>
                                        <TableCell><b>Marzo</b></TableCell>
                                        <TableCell><b>Abril</b></TableCell>
                                        <TableCell><b>Mayo</b></TableCell>
                                        <TableCell><b>Junio</b></TableCell>
                                        <TableCell><b>Total</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {['10', '15', '20'].map((turns) => (
                                        <TableRow key={turns}>
                                            <TableCell>{turns} vueltas o máx {turns} min</TableCell>
                                            <TableCell>${reportData.turns[turns]['01']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['02']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['03']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['04']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['05']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['06']?.toLocaleString() || '0'}</TableCell>
                                            <TableCell>${reportData.turns[turns]['total']?.toLocaleString() || '0'}</TableCell>
                                            </TableRow>
                                        ))}
                                    <TableRow sx={{ backgroundColor: '#424242' }}>
                                        <TableCell><b>TOTAL</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['01'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['02'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['03'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['04'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['05'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['06'] || 0), 0).toLocaleString()}</b></TableCell>
                                        <TableCell><b>${['10', '15', '20'].reduce((sum, t) => sum + (reportData.turns[t]['total'] || 0), 0).toLocaleString()}</b></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}
            {value === 'two' && (
                <Box mt={4} sx={{ width: '90%' }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                    Reporte de Ingresos por Número de Personas
                    </Typography>

                    {reportData && (
                    <TableContainer component={Paper}>
                        <Table>
                        <TableHead sx={{ backgroundColor: '#424242' }}>
                            <TableRow>
                            <TableCell><b>Rango</b></TableCell>
                            <TableCell><b>Enero</b></TableCell>
                            <TableCell><b>Febrero</b></TableCell>
                            <TableCell><b>Marzo</b></TableCell>
                            <TableCell><b>Abril</b></TableCell>
                            <TableCell><b>Mayo</b></TableCell>
                            <TableCell><b>Junio</b></TableCell>
                            <TableCell><b>Total</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {['1-2', '3-5', '6-10', '11-15'].map((range) => (
                            <TableRow key={range}>
                                <TableCell>{range} personas</TableCell>
                                <TableCell>${reportData.people[range]['01']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['02']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['03']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['04']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['05']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['06']?.toLocaleString() || '0'}</TableCell>
                                <TableCell>${reportData.people[range]['total']?.toLocaleString() || '0'}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ backgroundColor: '#424242' }}>
                                <TableCell><b>TOTAL</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['01'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['02'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['03'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['04'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['05'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['06'] || 0), 0).toLocaleString()}</b></TableCell>
                                <TableCell><b>${['1-2', '3-5', '6-10', '11-15'].reduce((sum, r) => sum + (reportData.people[r]['total'] || 0), 0).toLocaleString()}</b></TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </TableContainer>
                    )}
                </Box>
            )}
        </Box>
    );
}
