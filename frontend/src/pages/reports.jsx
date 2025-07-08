import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Button, Skeleton } from '@mui/material';
import { getReportByTurnsByMonth } from '../api/reportApi';

export default function Reports() {
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

    const generateReport = React.useCallback(async () => {
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
    }, [selectedYear, selectedMonthFrom, selectedMonthTo]);

    React.useEffect(() => {
        generateReport();
    }, [generateReport]);

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
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    mt: 1,
                    background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                    borderRadius: 2,
                    maxWidth: '1456px',
                    minWidth: '1430px',
                    mx: 'auto',
                    textAlign: 'center'
                }}
            >
                <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    sx={{ 
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    Reporte de Ingresos por Vueltas o Tiempo
                </Typography>
            </Paper>

            <Box mt={4} sx={{ width: 'auto', maxWidth: '1500px', mx: 'auto' }}>
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
                        color="error"
                        onClick={handleGenerateReport}
                        sx={{ height: 56, fontSize: '1.1rem' } }
                    >
                        Generar Reporte
                    </Button>
                </Box>

                {!reportData ? (
                    <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2, my: 2 }} />
                ) : (
                    <TableContainer component={Paper} sx={{ minWidth: '100%' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#1976d2', fontSize: '1.2rem'}}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 500, fontSize: '1.2rem'}}>
                                        <b>Tipo</b>
                                        </TableCell>
                                    {getMonthsInRange().map((month) => (
                                        <TableCell key={month.value} sx={{ color: '#fff', fontWeight: 540 , fontSize: '1.2rem' }}>
                                            <b>{month.label}</b>
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, backgroundColor: '#1565c0', fontSize: '1.2rem' }}>
                                        <b>Total</b>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {['10', '15', '20'].map((turns) => (
                                    <TableRow
                                        key={turns}
                                        sx={turns === '15' ? { backgroundColor: '#f5f5f5' , fontSize: '1.2rem' } : {}}
                                    >
                                        <TableCell sx={{ fontSize: '1.2rem' }}>{turns} vueltas o máx {turns} min</TableCell>
                                        {getMonthsInRange().map((month) => (
                                            <TableCell key={month.value} sx={{ fontSize: '1.2rem' }}>
                                                ${reportData.turns[turns]?.[month.value]?.toLocaleString() || '0'}
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600, fontSize: '1.2rem'  }}>
                                            ${reportData.turns[turns]?.['total']?.toLocaleString() || '0'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: '#1565c0', fontSize: '1.7rem'  }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}><b>TOTAL</b></TableCell>
                                    {getMonthsInRange().map((month) => (
                                        <TableCell key={month.value} sx={{ color: '#fff', fontWeight: 400, fontSize: '1.2rem'  }}>
                                            <b>${reportData?.monthlyTotals?.[month.value]?.toLocaleString() || '0'}</b>
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#0d47a1' }}>
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
