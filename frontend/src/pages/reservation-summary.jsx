import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, TextField, Card, CardContent, Stack, Snackbar, CircularProgress, Chip } from '@mui/material';
import { getReservationById, createReceipt, simulateReceipt, getReceiptsByReservationId, deleteReservationById } from '../api/reservationApi';
import { getDiscount } from '../api/specialdayApi';
import { getClientById } from '../api/loyaltyApi';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MuiAlert from '@mui/material/Alert';
import StepIcon from '@mui/icons-material/LooksOne';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Función para formatear números con separadores de miles
const formatNumber = (num) => {
    return Number(num).toLocaleString('es-CL');
};

export default function ReservationSummary() {

    const navigate = useNavigate();

    const [clientList, setClientList] = useState([]);
    const [reservationData, setReservationData] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [simulatedReceipts, setSimulatedReceipts] = useState([]);

    const [originalDiscount, setOriginalDiscount] = useState(null); 
    const [specialDaysDiscount, setSpecialDaysDiscount] = useState(0.21);

    // Estados para el diálogo de confirmación
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [loading, setLoading] = useState(false);

    // Función para mostrar alertas bonitas
    const showAlert = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    // 1 primero cargamos los datos de la reserva desde el localStorage
    useEffect(() => {
        // Mostrar alerta de reserva creada si existe
        const alerta = localStorage.getItem('reservaAlerta');
        if (alerta) {
            setSnackbar({ open: true, message: alerta, severity: 'success' });
            localStorage.removeItem('reservaAlerta');
        }
        const loadInitialData = async () => {
            const idReservation = localStorage.getItem('idReservation');
            if (!idReservation) {
                alert('No hay ID de reserva');
                navigate('/karting');
                return;
            }
            
            // obtenemos la reserva desde el back
            const reservation = await getReservationById(idReservation);
            if (!reservation) {
                alert('No se encontró la reserva');
                navigate('/');
                return;
            }
            setReservationData(reservation);
            console.log("Reserva completa recibida del backend:", reservation);
            
            const clientIds = reservation.clientIds || [];
            const fullClients = await Promise.all(
            clientIds.map(async (id) => {
                try {
                return await getClientById(id);
                } catch (err) {
                console.error(`❌ No se pudo cargar cliente con ID ${id}`, err);
                return null;
                }
            })
            );
            setClientList(fullClients.filter(c => c !== null));

            // Se carga el descuento original desde el back
            try {
                //llamamos a la función
                const discountFromBackend = await getDiscount(reservation.dateReservation);
                console.log("Descuento de holidays: ", discountFromBackend);
                if (typeof discountFromBackend === 'number') {
                    setSpecialDaysDiscount(discountFromBackend);
                    setOriginalDiscount(discountFromBackend);
                } else {
                    setSpecialDaysDiscount(0); // fallback si backend falla
                    setOriginalDiscount(0);
                }
            } catch (error) {
                console.error('Error obteniendo descuento especial:', error);
                setSpecialDaysDiscount(0);
                setOriginalDiscount(0);
            }
        
        };
        loadInitialData();
    }, [navigate]);

    // se carga el descuento guardado si existe
    useEffect(() => {
        const saved = localStorage.getItem('specialDaysDiscount');
        if (saved) setSpecialDaysDiscount(parseFloat(saved));
    }, []);

    // se guarda el descuento en el localStorage cada vez que cambia
    useEffect(() => {
        localStorage.setItem('specialDaysDiscount', specialDaysDiscount.toString());
    }, [specialDaysDiscount]);

    const simulateAllReceipts = useCallback(async () => {
        try {
            if (!reservationData || clientList.length === 0 || specialDaysDiscount === null) return;

           const simulations = await Promise.all(clientList.map(async (client) => {
            if (!client?.idClient || !client?.rutClient) {
                console.warn("⚠️ Cliente inválido en simulación:", client);
                return null;
            }

            const simulated = await simulateReceipt({
                rutClientReceipt: client.rutClient,
                reservationId: reservationData.idReservation,
                clientId: client.idClient,
                specialDaysDiscount: specialDaysDiscount,
            });
            return simulated;
            }));

            setSimulatedReceipts(simulations.filter(r => r !== null));
        } catch (error) {
            console.error('Error simulando los recibos:', error);
        }
    }, [reservationData, clientList, specialDaysDiscount]);

    // se simulan los recibos cada vez que cambia la reserva o la lista de clientes
    useEffect(() => {
        if (reservationData && clientList.length > 0) {
            simulateAllReceipts();
        }
    }, [reservationData, clientList, specialDaysDiscount, simulateAllReceipts]);

    // 3 aquí se crea la reserva
    async function handleSubmitReservation(){
        try {

            if (!reservationData || clientList.length === 0) {
                showAlert('Datos de reserva inválidos.', 'error');
                return;
            }

            setLoading(true);// activa spinner anti-estrés

            // se crean los comprobantes para cada cliente x el back
            for (const client of clientList) {
                if (!client.rutClient || !client.idClient) {
                    console.error('⚠️ Cliente sin rutClient o idClient:', client);
                    continue; // o return si quieres cortar el proceso
                }

                showAlert(`Enviando comprobante de ${client.nameClient || 'cliente sin nombre'}...`, 'info');

                await createReceipt({
                    rutClientReceipt: client.rutClient,
                    reservationId: reservationData.idReservation,
                    clientId: client.idClient,
                    specialDaysDiscount: specialDaysDiscount,
                });
                
            }

            const receiptsData = await getReceiptsByReservationId(reservationData.idReservation);
            setReceipts(receiptsData);
            console.log("Comprobantes creados:", receipts);

            localStorage.removeItem('specialDaysDiscountSet');
            localStorage.setItem('postSuccessMessage', '✅ Reserva y comprobantes creados correctamente.');

            // Espera 1 segundo antes de navegar
            setTimeout(() => {
                setLoading(false);
                navigate('/home');
            }, 1000);
        } catch (error) {
            setLoading(false);
            setLoading(false);
            showAlert('No se pudo confirmar la reserva. Intenta nuevamente.', error);
        }
    }

    if (!reservationData) {
        return <Typography>Cargando datos...</Typography>;
    }
    
    return (
        <>
        {loading && (
            <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
                <CircularProgress size={80} />
            </Box>
        )}
        {/* Pasos de la reserva */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                    icon={<StepIcon sx={{ color: '#1976d2' }} />}
                    label="Fecha y hora"
                    size="big"
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                />
                <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                <Chip
                    icon={<GroupIcon sx={{ color: '#43a047' }} />}
                    label="Clientes"
                    size="big"
                    sx={{ bgcolor: '#e8f5e9', color: '#388e3c', fontWeight: 500 }}
                />
                <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#43a047' }} />
                <Chip
                    icon={<CheckCircleIcon sx={{ color: '#ff9800' }} />}
                    label="Confirmar y Pagar"
                    size="big"
                    sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 700, border: '2px solid #ff9800' }}
                />
            </Stack>
        </Box>
        <Box p={4}>
            <Card
                sx={{
                    mb: 4,
                    textAlign: 'center',
                    background: '#fffde7',
                    border: '1px solid #ffe082',
                    borderRadius: 2,
                    boxShadow: 1,
                    maxWidth: 700,
                    width: '100%',
                    mx: 'auto',
                    p: 2,
                }}
            >
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                        <LocalOfferIcon sx={{ color: '#fbc02d', fontSize: 32, mr: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#b28704' }}>
                            Descuento especial para fines de semana/feriados
                        </Typography>
                    </Box>
                <TextField
                        label="Descuento (%)"
                    type="number"
                    value={(specialDaysDiscount * 100).toFixed(0)}
                    onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setSpecialDaysDiscount(isNaN(value) ? 0 : value / 100);
                    }}
                    onBlur={() => {
                        if (specialDaysDiscount !== originalDiscount) {
                            console.log("🟡 Descuento modificado por el usuario, re-simulando...");
                        } else {
                            console.log("🟢 Descuento intacto, re-simulando igual por seguridad...");
                        }
                        simulateAllReceipts(); // Simula con el valor actual
                    }}
                    slotProps={{
                            input: { min: 0, max: 100 },
                        }}
                        sx={{ mb: 1, maxWidth: 180 }}
                    />
                </CardContent>
            </Card>
            <Card
                            sx={{ 
                    mb: 4,
                    textAlign: 'center',
                    background: '#f5fafd',
                    border: '1px solid #b3e5fc',
                    borderRadius: 2,
                    boxShadow: 1,
                    maxWidth: 700,
                    width: '100%',
                    mx: 'auto',
                    p: 2,
                }}
            >
                <CardContent>
                    <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 700, fontSize: '1.6rem'}}>
                        Resumen de la Reserva
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <EventAvailableIcon sx={{ color: '#1976d2', fontSize: 32, mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {new Date(reservationData.dateReservation).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                        <b>Hora de inicio:</b> {reservationData.startHourReservation}
                    </Typography>
                    <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                        <b>Hora final:</b> {reservationData.finalHourReservation}
                    </Typography>
                    <Typography sx={{ fontSize: '1.2rem' }}>
                        <b>Número de vueltas:</b> {reservationData.turnsTimeReservation}
                    </Typography>
                </CardContent>
            </Card>

            {simulatedReceipts.length > 0 ? (
                <Stack spacing={2}>
                    {simulatedReceipts.map((receipt, idx) => (
                        <Card key={idx} sx={{ p: 2, borderRadius: 2, boxShadow: 1, background: '#fff', border: '1px solid #bdbdbd' }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#388e3c', fontSize: '1.5rem' }}>
                                    Nombre: <span style={{ color: '#1976d2' }}>{receipt.nameClientReceipt}</span>
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1, color: '#616161', fontSize: '1rem' }}>
                                    Rut: {receipt.rutClientReceipt}
                                </Typography>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Precio base:</b></span>
                                    <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>${formatNumber(Math.round(receipt.baseRateReceipt))}</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Descuento por cantidad de personas:</b></span>
                                    <span style={{ color: '#0288d1', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>{formatNumber(Math.round(receipt.groupSizeDiscount * 100))}%</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Descuento de cumpleaños:</b></span>
                                    <span style={{ color: '#fbc02d', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>{formatNumber(Math.round(receipt.birthdayDiscount * 100))}%</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Descuento de cliente frecuente:</b></span>
                                    <span style={{ color: '#7b1fa2', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>{formatNumber(Math.round(receipt.loyaltyDiscount * 100))}%</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Descuento de día especial:</b></span>
                                    <span style={{ color: '#43a047', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>{formatNumber(Math.round(receipt.specialDaysDiscount * 100))}%</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Descuento máximo aplicado:</b></span>
                                    <span style={{ color: '#2196f3', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>{formatNumber(Math.round(receipt.maxDiscount * 100))}%</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>Monto final:</b></span>
                                    <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>${formatNumber(Math.round(receipt.finalAmount))}</span>
                                </Box>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><b>IVA:</b></span>
                                    <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.3rem' }}>${formatNumber(Math.round(receipt.ivaAmount))}</span>
                                </Box>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 500, color: '#d84315', fontSize: '1.5rem'}}><b>Total:</b></span>
                                    <span style={{ fontWeight: 650, color: '#d84315', fontSize: '1.5rem', minWidth: 80, textAlign: 'right', marginLeft: 16 }}>${formatNumber(Math.round(receipt.totalAmount))}</span>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fff' }}>
                <Typography>Cargando simulaciones...</Typography>
                </Box>
            )
        }
            
            {/* Botón para confirmar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                        setConfirmDialogOpen(true);
                    }}
                    sx={{ fontSize: '1.1rem' }}
                    title="Cancelar la reserva"
                >
                    Cancelar la reserva
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AccessTimeIcon />}
                    sx={{
                        backgroundColor: '#ff9800',
                        color: '#fff',
                        fontWeight: 549,
                        fontSize: '1.1rem',
                        '&:hover': { backgroundColor: '#fb8c00' },
                    }}
                    onClick={() => navigate('/home')}
                >
                    Confirmar pago más tarde
                </Button>
            <Button
                variant="contained"
                color="success"
                    startIcon={<AttachMoneyIcon />}
                    sx={{ fontSize: '1.2rem', fontWeight: 400 }}
                    onClick={() => { handleSubmitReservation(); }}
                >
                    Confirmar Pago Total
                </Button>
            </Box>
            
            {/* Snackbar para alertas bonitas */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={snackbar.severity === 'success' ? 6000 : 4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ 
                        width: '100%',
                        fontSize: '1.1rem',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        },
                        ...(snackbar.severity === 'warning' && {
                            backgroundColor: '#ffe082', // Naranja más visible
                            color: '#5d4037', // Texto marrón oscuro
                            border: '1px solid #ffb300',
                        }),
                        ...(snackbar.severity === 'error' && {
                            backgroundColor: '#ffb3b3', // Rojo claro saturado
                            color: '#b71c1c', // Rojo oscuro
                            border: '1px solid #ff5252',
                        })
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Diálogo de confirmación para cancelar reserva */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
            >
                <DialogTitle>¿Cancelar la reserva?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Esta acción es irreversible. ¿Estás seguro de que quieres cancelar la reserva?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        No, volver
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                await deleteReservationById(reservationData.idReservation);
                                setConfirmDialogOpen(false);
                                showAlert('Reserva cancelada correctamente.', 'success');
                                navigate('/reservations');
                            } catch (error) {
                                setConfirmDialogOpen(false);
                                showAlert('No se pudo cancelar la reserva.', error);
                            }
                        }}
                        color="error"
                        variant="contained"
                    >
                        Sí, Borrar
            </Button>
                </DialogActions>
            </Dialog>
        </Box>

        </>
    );
}
