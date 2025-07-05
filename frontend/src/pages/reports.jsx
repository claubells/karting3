import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getReportByTurnsByMonth } from '../api/reportApi';

export default function Reports() {
    const [value, setValue] = React.useState('one');
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [selectedMonthFrom, setSelectedMonthFrom] = React.useState('01');
    const [selectedMonthTo, setSelectedMonthTo] = React.useState('12');
    const [reportData, setReportData] = React.useState({
        turns: {
            10: {},
            15: {},
            20: {},
        },
        totalGlobal: 0,
        monthlyTotals: {},
    });

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    async function generateReport() {
        try {
            const turns = await getReportByTurnsByMonth(selectedYear, selectedMonthFrom, selectedMonthTo);

            setReportData({
                turns: turns.turns || {
                    10: {},
                    15: {},
                    20: {},
                },
                totalGlobal: turns.totalGlobal ?? 0,
                monthlyTotals: turns.monthlyTotals ?? {},
            });
        } catch (error) {
            console.error('Error al obtener datos del reporte:', error);
        }
    }

    React.useEffect(() => {
        generateReport();
    }, [selectedYear, selectedMonthFrom, selectedMonthTo]);

    const handleGenerateReport = () => {
        generateReport();
    };

    // Función para obtener los meses en el rango seleccionado
    const getMonthsInRange = () => {
        const fromIndex = parseInt(selectedMonthFrom) - 1;
        const toIndex = parseInt(selectedMonthTo) - 1;
        return months.slice(fromIndex, toIndex + 1);
    };

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
            <Box mt={4} sx={{ width: '90%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Reporte de Ingresos por Vueltas o Tiempo
                </Typography>

                {/* Controles de selección */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Año</InputLabel>
                        <Select
                            value={selectedYear}
                            label="Año"
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Desde</InputLabel>
                        <Select
                            value={selectedMonthFrom}
                            label="Desde"
                            onChange={(e) => setSelectedMonthFrom(e.target.value)}
                        >
                            {months.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Hasta</InputLabel>
                        <Select
                            value={selectedMonthTo}
                            label="Hasta"
                            onChange={(e) => setSelectedMonthTo(e.target.value)}
                        >
                            {months.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button 
                        variant="contained" 
                        onClick={handleGenerateReport}
                        sx={{ height: 56 }}
                    >
                        Generar Reporte
                    </Button>
                </Box>

                {reportData && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#2196f3' }}>
                                <TableRow>
                                    <TableCell><b>Tipo</b></TableCell>
                                    {getMonthsInRange().map((month) => (
                                        <TableCell key={month.value}><b>{month.label}</b></TableCell>
                                    ))}
                                    <TableCell><b>Total</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {['10', '15', '20'].map((turns) => (
                                    <TableRow key={turns}>
                                        <TableCell>{turns} vueltas o máx {turns} min</TableCell>
                                        {getMonthsInRange().map((month) => (
                                            <TableCell key={month.value}>
                                                ${reportData.turns[turns]?.[month.value]?.toLocaleString() || '0'}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            ${reportData.turns[turns]?.['total']?.toLocaleString() || '0'}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                <TableRow sx={{ backgroundColor: '#2196f3' }}>
                                    <TableCell><b>TOTAL</b></TableCell>
                                    {getMonthsInRange().map((month) => (
                                        <TableCell key={month.value}>
                                            <b>${reportData?.monthlyTotals?.[month.value]?.toLocaleString() || '0'}</b>
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <b>${reportData?.totalGlobal?.toLocaleString() || '0'}</b>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
            
        </Box>
    );
}
