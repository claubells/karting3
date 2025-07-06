import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FormControl, InputLabel, Box, Button, TextField, Typography, Select, MenuItem, Stack, Card, CardContent, Avatar, Alert, Snackbar } from '@mui/material';
import { verifyAvailability, deleteReservationById, getReceiptsByReservationId, getHoursConfig, simulateReceipt, createReceipt } from '../api/reservationApi';
import { getHolidays, getDiscount } from '../api/specialdayApi';
import { getRackReservations } from '../api/rackApi';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getClientByRut } from '../api/clientApi';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Fab from '@mui/material/Fab';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos personalizados para los botones del calendario
const calendarStyles = `
  .fc-button-primary {
    background-color: #1976d2 !important;
    border-color: #1976d2 !important;
    color: white !important;
  }
  
  .fc-button-primary:hover {
    background-color: #1565c0 !important;
    border-color: #1565c0 !important;
  }
  
  .fc-button-primary:focus {
    background-color: #1565c0 !important;
    border-color: #1565c0 !important;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2) !important;
  }

  .fc-event-title { 
    font-size: 1rem !important;
    font-weight: 500 !important;
  }

  .fc-event {
    font-size: 1.9rem !important;
  }

  .fc-event-main {
    font-size: 1.6rem !important;
  }

  .fc-event-main-frame {
    font-size: 1rem !important;
  }
`;

/* -------------------- */

// Bloqueos de lunes a viernes fuera del horario permitido
function generateWeekdayBlockings(days, startHour, endHour, startDate, endDate, excludeDates = []) {
    const blocks = [];
    const date = new Date(startDate);

    while (date <= new Date(endDate)) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;

        if (days.includes(date.getDay()) && !excludeDates.includes(formatted)) {
            blocks.push({
                start: `${formatted}T${startHour}`,
                end: `${formatted}T${endHour}`,
                display: 'background',
                color: '#e0e0e0', // Material-UI Grey 300 para mejor visibilidad
                overlap: false,
            });
        }

        date.setDate(date.getDate() + 1);
    }

    return blocks;
}

// Bloqueos para horarios previos a las 10:00 (feriados)
function generateHolidayBlockings(holidays) {
    return holidays.map(({ date }) => ({
        start: `${date}T00:00:00`,
        end: `${date}T10:00:00`,
        display: 'background',
        color: '#e0e0e0', // Material-UI Grey 300 para mejor visibilidad
        overlap: false,
    }));
}

function getReservationDuration(turns) {
    switch (turns) {
        case '10 vueltas':
            return 30;
        case '15 vueltas':
            return 35;
        case '20 vueltas':
            return 40;
        default:
            return 0;
    }
}

const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
        try {
            await deleteReservationById(reservationId);
            window.location.reload(); // Refresca la página para mostrar los cambios
            alert('Reserva cancelada correctamente');
            // Aquí puedes refrescar la lista de eventos si quieres
        } catch (error) {
            alert('Hubo un error al cancelar la reserva');
            console.error('Error al cancelar la reserva:', error);
        }
    }
};

const formatNumber = (num) => {
    return Number(num).toLocaleString('es-CL');
};

export default function ReservaCalendario() {
    // Estados para manejar la validez de los campos
    // fechas de los feriados, se cargan desde el backend
    const [holidayDates, setHolidayDates] = useState([]);
    const [invalidStartTime, setInvalidStartTime] = useState(false);
    const [invalidEndTime, setInvalidEndTime] = useState(false);
    const [invalidDate, setInvalidDate] = useState(false);
    const [showForm, setShowForm] = useState(false);
    // Cuando se selecciona una reserva, se guarda en el estado
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [receipts, setReceipts] = useState([]);
    //mostrar los receipt
    const [showReceipts, setShowReceipts] = useState(false);
    const [events, setEvents] = useState([]);
    const [receiptsWithNames, setReceiptsWithNames] = useState([]);
    const [simulatedReceipts, setSimulatedReceipts] = useState([]);
    const [specialDaysDiscount, setSpecialDaysDiscount] = useState(0.21);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const detailsRef = useRef(null);
    const receiptsRef = useRef(null);
    const calendarRef = useRef(null); // Nuevo ref para el calendario
    const [showScrollUp, setShowScrollUp] = useState(false);

    const rutCache = {};

    const [formData, setFormData] = useState({
        fecha: '',
        horaInicio: '',
        turns: '',
        horaFin: '',
    });

    /* Horarios de atención */
    // const weeklyHours = { min: '14:00', max: '22:00' }; 
    // const specialHours = { min: '10:00', max: '22:00' }; 
    const [hoursConfig, setHoursConfig] = useState({
        weeklyHours: { min: '14:00', max: '22:00' }, // Lunes a viernes
        specialHours: { min: '10:00', max: '22:00' },// Feriados y fines de semana
    });

    const [showReservationDetail, setShowReservationDetail] = useState(true);

    // ver los detalles del comprobante -> receipt
    const handleViewReceipts = async (reservationId) => {
        try {
            if (selectedReservation.state === 'Pendiente') {
                // Para reservas pendientes, simular los comprobantes
                await simulateReceiptsForPendingReservation();
            } else {
                // Para reservas pagadas, obtener los comprobantes reales
            const receiptsData = await getReceiptsByReservationId(reservationId);
                // Obtener nombres para cada rut de los receipts
                const receiptsWithNames = await Promise.all(
                    receiptsData.map(async (r) => {
                        let name = r.rutClientReceipt;
                        try {
                            const client = await getClientByRut(r.rutClientReceipt);
                            name = client.nameClient || r.rutClientReceipt;
                        } catch {}
                        return { ...r, nameClient: name };
                    })
                );
                setReceipts(receiptsData);
                setReceiptsWithNames(receiptsWithNames);
            }
            setShowReceipts(true);
            setTimeout(() => {
                if (receiptsRef.current) {
                    receiptsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } catch (error) {
            showAlert('Hubo un error al mostrar los comprobantes de la reserva', 'error');
            console.error('Error al mostrar los comprobantes de la reserva:', error);
        }
    };

    // se hace clic en una reserva
    const handleEventClick = (clickInfo) => {
        const { title, start, end, id, extendedProps } = clickInfo.event;
    
        // si el evento es un bloqueo no hacemos nada
        if (clickInfo.event.display === 'background') {
            return; // Ignorar clics en bloqueos
        }

        setSelectedReservation({
            title,
            start,
            end,
            id, 
            vueltas: extendedProps.vueltas, 
            group: extendedProps.group,
            state: extendedProps.state,
            rut: extendedProps.rut,
        });
    
        //extendedProps contiene la información adicional de la reserva
    
        setShowForm(false); // oculta el formulario de crear reserva si estaba abierto
        setShowReservationDetail(true);

        setTimeout(() => {
            if (detailsRef.current) {
                detailsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // Validar que la hora de inicio y fin no sean menores a 10:00 ni mayores a 22:00
    function validateTime(hour, date) {
        const minLimit = isSpecialDay(date) ? hoursConfig.specialHours.min : hoursConfig.weeklyHours.min;
        const maxLimit = '22:00';
        return hour < minLimit || hour > maxLimit;
    }

    function calculateFinalHour(horaInicio, turns) {
        const start = new Date(`2000-01-01T${horaInicio}`);
        let minutos = 30;

        if (turns === '15 vueltas') minutos = 35;
        else if (turns === '20 vueltas') minutos = 40;

        const fin = new Date(start.getTime() + minutos * 60000);
        return fin.toTimeString().slice(0, 5);
    }

    // 🔎 Función para saber si un día es feriado o fin de semana
    function isSpecialDay(dateStr) {
        if (!dateStr) return false;

        const [year, month, day] = dateStr.split('-');
        const date = new Date(+year, +month - 1, +day); // siempre local

        const dayOfWeek = date.getDay(); // 0: domingo, 6: sábado
        return holidayDates.includes(dateStr) || dayOfWeek === 0 || dayOfWeek === 6;
    }

    // Redireccionar a la siguiente pagina del fomulario
    const navigate = useNavigate();

    const handleHourSelect = async (e, newValue) => {
        let name, value;

        if (e?.target) {
            // Caso para TextField (horaInicio, horaFin)
            name = e.target.name;
            value = e.target.value;
        } else {
            // Caso para DatePicker (fecha)
            name = 'fecha';
            // Convertir la fecha a formato YYYY-MM-DD sin problemas de zona horaria
            if (newValue) {
                const year = newValue.getFullYear();
                const month = String(newValue.getMonth() + 1).padStart(2, '0');
                const day = String(newValue.getDate()).padStart(2, '0');
                value = `${year}-${month}-${day}`;
            } else {
                value = '';
            }
        }

        const newFormData = {
            ...formData,
            [name]: value,
        };

        setFormData(newFormData);

        // Validar la hora de inicio y fin
        if (name === 'horaInicio') {
            const isInvalid = validateTime(value, formData.fecha);
            setInvalidStartTime(isInvalid);
        }

        if (name === 'horaFin') {
            const isInvalid = validateTime(value, formData.fecha);
            setInvalidEndTime(isInvalid);
        }

        // si la fehca es menor a hoy, se pone como fecha invalida
        if (name === 'fecha') {
            const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const isInvalidDate = value < hoy;
            const isInvalidHour = validateTime(formData.horaInicio, value);

            setInvalidDate(isInvalidDate);
            setInvalidStartTime(isInvalidHour);

            // Reinicio la hora de fin porque puede depender del nuevo día
            newFormData.horaFin = '';
            setInvalidEndTime(false);
            setInvalidDate(isInvalidDate); // Verifica si la fecha es anterior a hoy
        }
    };

    const handleDateSelect = (selectInfo) => {
        const start = new Date(selectInfo.start);

        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        const fecha = `${yyyy}-${mm}-${dd}`;

        const horaInicio = start.toTimeString().slice(0, 5);

        const hoy = new Date().toISOString().split('T')[0];

        // Verifica si la fecha es anterior a hoy
        const isInvalidDate = fecha < hoy;
        const isInvalidHour = validateTime(horaInicio, fecha);

        //se actualiza el estado de la fecha y hora invalida
        setInvalidDate(isInvalidDate);
        setInvalidStartTime(isInvalidHour);
        setInvalidEndTime(false); // Reiniciamos por si acaso

        setFormData({
            fecha,
            horaInicio,
            turns: '',
            horaFin: '',
        });

        // Mostrar el formulario y rellenar los campos
        setShowForm(true);
    };

    const handleConfirm = async () => {
        if (invalidStartTime) {
            showAlert('La hora inicial no es válida, debe de estar dentro del horario.', 'error');
            return;
        }

        if (invalidEndTime || invalidDate) {
            showAlert('La hora final no es válida, debe de estar dentro del horario.', 'error');
            return;
        }

        if (invalidDate) {
            showAlert('El día de la reserva debe ser para hoy en adelante.', 'error');
            return;
        }

        // Validamos que todos los campos estén completos
        const { fecha, horaInicio, horaFin, turns } = formData;

        // Validamos que todos los campos esten completos
        if (!fecha || !horaInicio || !horaFin || !turns) {
            showAlert('Por favor completa todos los campos antes de continuar', 'warning');
            return;
        }

        // Solo validamos disponibilidad si ya hay 'turns' seleccionado
        // Confirmamos que no haya otra reserva en el horario seleccionado
        const disponible = await verifyAvailability(fecha, horaInicio, horaFin);

        if (!disponible) {
            showAlert('Ya existe una reserva en ese horario. Por favor elige otro.', 'error');
            setInvalidStartTime(true);
            return;
        }

        // Se obtiene la fecha, hora de inicio, hora de fin y turns del formulario
        // y se guarda la reserva en el localStorage
        localStorage.setItem('reservationData1', JSON.stringify(formData));
        console.log(
            'Primera parte de reserva guardada en localStorage:',
            localStorage.getItem('reservationData1')
        );
        navigate('/reservations-clients');
    };

    // Se obtiene la lista de reservas al cargar el componente
    useEffect(() => {
        const loadInitialData = async () => {
            try{
                // *** HORARIOS ***
                const configFromBackend = await getHoursConfig();
                setHoursConfig({
                        weeklyHours: {
                        min: configFromBackend.weeklyHours.min,
                        max: configFromBackend.weeklyHours.max,
                    },
                    specialHours: {
                        min: configFromBackend.specialHours.min,
                        max: configFromBackend.specialHours.max,
                    },
                });

                // *** FERIADOS ***
                const holidaysFromBackend = await getHolidays();
                setHolidayDates(holidaysFromBackend);
                
                // *** RACK ***
                const reservas = await getRackReservations();
                if (!Array.isArray(reservas)) {
                    console.error('El Rack no devolvió un array:', reservas);
                    return;
                }

                const formatted = [];
                const formattedPendientes = [];

                await Promise.all(
                    reservas.map(async (r) => {
                        let name = r.holdersReservation;
                        if (!rutCache[r.holdersReservation]) {
                            try {
                                const client = await getClientByRut(r.holdersReservation);
                                name = client.nameClient || r.holdersReservation;
                                rutCache[r.holdersReservation] = name;
                            } catch {
                                rutCache[r.holdersReservation] = r.holdersReservation;
                            }
                        } else {
                            name = rutCache[r.holdersReservation];
                        }

                        const eventData = {
                    id: r.idReservation,
                            title: r.statusReservation === 'Pendiente' ? `⚠️ ${name}` : name,
                            rut: r.holdersReservation,
                    start: `${r.dateReservation}T${r.startHourReservation}`,
                    end: `${r.dateReservation}T${r.finalHourReservation}`,
                    vueltas: r.turnsTimeReservation,
                    group: r.groupSizeReservation,
                    state: r.statusReservation,
                    display: 'block',
                        };

                        if (r.statusReservation === 'Pendiente') {
                            formattedPendientes.push({
                                ...eventData,
                                color: '#ff9800', // Naranja MUI
                                textColor: '#fff', // Blanco para contraste
                            });
                        } else {
                            formatted.push(eventData);
                        }
                    })
                );

                // bloqueos horarios de semana sin las fechas de feriados
                const monToFri = generateWeekdayBlockings(
                    [1, 2, 3, 4, 5], // Lunes a viernes
                    configFromBackend.specialHours.min,
                    configFromBackend.weeklyHours.min, 
                    '2025-04-01',
                    '2025-12-31', // Fecha de inicio y fin del bloque
                    holidayDates // excluye las fechas de feriados
                );

                const locksHolidays = generateHolidayBlockings(
                    holidaysFromBackend.map(date => ({ date })) 
                );

                setEvents([
                    ...generateWeekdayBlockings(holidayDates), 
                    ...generateWeekdayBlockings(holidayDates), 
                    ...monToFri, 
                    ...locksHolidays, 
                    ...formatted,
                    ...formattedPendientes
                ]);
            } catch (error) {
                console.error('Error al cargar los datos iniciales:', error);
            }
            
        };

        loadInitialData();
    }, []);

    // Detectar scroll para mostrar/ocultar la flecha
    useEffect(() => {
        const handleScroll = () => {
            if (!calendarRef.current) return;
            const calendarTop = calendarRef.current.getBoundingClientRect().top;
            setShowScrollUp(calendarTop < -100); // Muestra la flecha si el calendario está fuera de vista
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Inyectar estilos personalizados para los botones del calendario
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = calendarStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const simulateReceiptsForPendingReservation = async () => {
        try {
            if (!selectedReservation) return;

            const dateObj = selectedReservation.start instanceof Date
                ? selectedReservation.start
                : new Date(selectedReservation.start);

            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            let discount = 0.21; // valor por defecto
            try {
                const discountFromBackend = await getDiscount(dateStr);
                if (typeof discountFromBackend === 'number') {
                    discount = discountFromBackend;
                }
            } catch (error) {
                console.error('Error obteniendo descuento especial:', error);
            }

            // Simular un comprobante para el titular de la reserva
            const simulated = await simulateReceipt({
                rutClientReceipt: selectedReservation.rut,
                reservationId: selectedReservation.id,
                clientId: 1, // ID temporal
                specialDaysDiscount: discount,
            });

            // Formatear el comprobante simulado con el nombre
            const formattedReceipt = {
                ...simulated,
                nameClient: selectedReservation.title,
            };

            setSimulatedReceipts([formattedReceipt]);
            setReceiptsWithNames([formattedReceipt]);
            setSpecialDaysDiscount(discount);
        } catch (error) {
            console.error('Error simulando los comprobantes:', error);
        }
    };

    const showAlert = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    return (
        <div style={{ padding: '2rem', width: '100%' }}>
            <div ref={calendarRef}></div>
            <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                    color: '#1976d2', // Azul Material-UI
                    letterSpacing: 1,
                    textShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                }}
            >
                Calendario de Reservas
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: '#666',
                    mb: 3,
                    fontSize: '1.2rem'
                }}
            >
                💡 Haz clic sobre cualquier reserva para ver sus detalles
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 5,
                    width: '100%',
                    flexWrap: 'nowrap',
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'hidden',
                        minWidth: '900px',
                        maxWidth: '1000px',
                        height: '79vh',
                    }}
                >
                    <Box>
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]} // CALENDARIO ***
                        initialView="timeGridWeek"
                        slotMinTime="10:00:00" // hora de inicio visible de todos los dias
                        slotMaxTime="22:00:00" // hora de fin visible de todos los dias
                        slotDuration="00:20:00"
                        eventClick={handleEventClick} // se puede hacer clic en una reserva
                        allDaySlot={false}
                        selectable={true}
                        editable={false} // no se pueden mover o redimensionar las reservas
                        eventResizableFromStart={false} // no se pueden redimensionar desde el inicio
                        select={handleDateSelect} // se puede hacer clic en un bloque horario
                        events={events}
                        locale={esLocale}
                        nowIndicator={true} // muestra la hora actual                        
                        selectOverlap={false}
                            height="79vh"
                    />
                    </Box>
                </Box>

                <Box sx={{ width: '320px' }}>
                    <Button
                        variant="contained" // FOMRULARIO LATERAL ****
                        color="primary" // #1976d2
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => setShowForm((prev) => !prev)}
                        sx={{ fontSize: '1.2rem', minWidth: 320, px: 6, py: 1 }}
                    >
                        Generar reserva
                    </Button>

                    {showForm && (
                        <Box
                            component="form" // si el mostrarFormulario es true, se muestra el formulario
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                backgroundColor: '#e3f2fd', // Azul muy claro
                                padding: 3,
                                border: '1px solid #90caf9',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                                mt: 2,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#424242', // gris oscuro elegante
                                    fontWeight: 700,
                                    textAlign: 'center'
                                }}
                            >
                                Nueva Reserva
                            </Typography>

                            {/* Fecha */}
                                                         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                 <DatePicker
                                     label="Día/mes/año"
                                name="fecha"
                                     value={formData.fecha ? new Date(formData.fecha + 'T00:00:00') : null}
                                     onChange={(newValue) => handleHourSelect(null, newValue)}
                                     minDate={new Date()}
                                slotProps={{
                                         textField: {
                                             required: true,
                                             error: invalidDate,
                                             helperText: invalidDate ? 'La fecha debe ser para hoy en adelante' : '',
                                             fullWidth: true,
                                             InputLabelProps: {
                                        shrink: true,
                                             },
                                    },
                                }}
                            />
                             </LocalizationProvider>

                            {/* Hora Inicio */}
                            <TextField
                                type="time"
                                label="Hora Inicio"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleHourSelect}
                                required
                                error={invalidStartTime}
                                helperText={
                                    invalidStartTime ? 'La hora de inicio no es correcta' : ' '
                                }
                                slotProps={{
                                    input: {
                                        min: isSpecialDay(formData.fecha)
                                            ? hoursConfig.specialHours.min
                                            : hoursConfig.weeklyHours.min,
                                        max: isSpecialDay(formData.fecha)
                                            ? hoursConfig.specialHours.max
                                            : hoursConfig.weeklyHours.max,
                                    },
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />

                            {/* Selector de vueltas */}
                            <FormControl fullWidth required disabled={!formData.horaInicio}>
                                {/* se bloquea el select si no hay hora de inicio */}
                                <InputLabel id="tipo-label">Tiempo de carrera</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    name="turns"
                                    value={formData.turns}
                                    label="Cantidad de vueltas o tiempo máximo"
                                    onChange={(e) => {
                                        const tipo = e.target.value;
                                        const horaFinCalculada = calculateFinalHour(formData.horaInicio, tipo); 

                                        const limite = isSpecialDay(formData.fecha)
                                            ? hoursConfig.specialHours.max
                                            : hoursConfig.weeklyHours.max; 
                                        const invalidHour = horaFinCalculada > limite;
                                        
                                        setInvalidEndTime(invalidHour);

                                        setFormData((prev) => ({
                                            ...prev,
                                            turns: tipo,
                                            horaFin: horaFinCalculada,
                                        }));
                                    }}
                                >
                                    {/* Se muestran las opciones de vueltas y tiempo máximo */}
                                    <MenuItem value="10 vueltas">10 vueltas o máx 10 min</MenuItem>
                                    <MenuItem value="15 vueltas">15 vueltas o máx 15 min</MenuItem>
                                    <MenuItem value="20 vueltas">20 vueltas o máx 20 min</MenuItem>
                                </Select>
                            </FormControl>

                            {/* se muestra la duración total de la reserva, encima de la hora final*/}
                            {formData.turns && formData.horaInicio && (
                                <Box sx={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 2, px: 2, py: 1, display: 'inline-flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography
                                    variant="caption"
                                        sx={{ color: '#1976d2', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}
                                >
                                    {`Tiempo total de la reserva: ${getReservationDuration(formData.turns)} minutos`}
                                </Typography>
                                    <Tooltip 
                                        title={<span style={{ fontSize: '1.15rem', color: '#1976d2', fontWeight: 500 }}>El tiempo adicional que incluye la reserva es necesario para la preparación, instrucciones y transición entre clientes.</span>} 
                                        arrow
                                        slotProps={{
                                            popper: {
                                                modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
                                            },
                                            tooltip: {
                                                sx: {
                                                    backgroundColor: '#fff',
                                                    color: '#222',
                                                    boxShadow: 2,
                                                    border: '1px solid #90caf9',
                                                    fontSize: '1.15rem',
                                                    fontWeight: 500,
                                                    px: 2,
                                                    py: 1
                                                }
                                            }
                                        }}
                                    >
                                        <HelpOutlineIcon sx={{ color: '#1976d2', fontSize: '1.2rem', cursor: 'pointer' }} />
                                    </Tooltip>
                                </Box>
                            )}

                            {/* Hora Fin (sólo informativa) */}
                            <TextField
                                type="time"
                                label="Hora Final"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleHourSelect}
                                disabled // se bloquea la hora final
                                required
                                error={invalidEndTime}
                                helperText={
                                    invalidEndTime
                                        ? 'La hora final supera el horario permitido'
                                        : ' '
                                }
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleConfirm}
                                startIcon={<ArrowForwardIcon />}
                                sx={{ backgroundColor: '#66bb6a', color: '#fff', fontWeight: 600, '&:hover': { backgroundColor: '#43a047' } }}
                            >
                                Continuar
                            </Button>
                        </Box>
                    )}
                    
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            mt: 2,
                            textAlign: 'center',
                            fontSize: '1.2rem'
                        }}
                    >
                        📅 ¡Haz clic sobre el calendario para agendar tu reserva!
                    </Typography>

                </Box>
                
            </Box>
                {selectedReservation && showReservationDetail && (
                    <Card
                        ref={detailsRef}
                        sx={{
                        mt: 4,
                            p: 0,
                            borderRadius: 3,
                            boxShadow: 4,
                            background: '#f5f5f5',
                            color: '#263238',
                            width: '100%',
                            maxWidth: 700,
                            mx: 'auto',
                            border: '1px solid #e0e0e0',
                            position: 'relative',
                        }}
                    >
                            <Button
                            onClick={() => setShowReservationDetail(false)}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                minWidth: 0,
                                padding: 0.5,
                                zIndex: 10,
                            }}
                            >
                            <CloseIcon />
                            </Button>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                                    <PersonIcon />
                                </Avatar>
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {selectedReservation.title}
                                    </Typography>
                                    <Typography variant="subtitle2" color="text.secondary" fontSize={'1rem'}>
                                        Titular de la reserva
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" fontSize={'1rem'}>
                                        Rut: {selectedReservation.rut}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" mb={1}>
                                <EventAvailableIcon sx={{ color: '#1976d2', mr: 1}} />
                                <Typography fontSize={'1.2rem'}>
                                    <b>Fecha:</b> {new Date(selectedReservation.start).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" mb={1}>
                                <AccessTimeIcon sx={{ color: '#1976d2', mr: 1 }} />
                                <Typography fontSize={'1.2rem'}>
                                    <b>Hora:</b> {new Date(selectedReservation.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(selectedReservation.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false })}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" mb={1}>
                                <GroupIcon sx={{ color: '#1976d2', mr: 1 }} />
                                <Typography fontSize={'1.2rem'}>
                                    <b>Grupo:</b> {selectedReservation.group}
                                </Typography>
                            </Box>
                            <Typography sx={{ mt: 2 }} fontSize={'1.2rem'}>
                                <b>Vueltas o tiempo:</b> {selectedReservation.vueltas}
                            </Typography>
                            <Typography sx={{ mt: 1 }} fontSize={'1.2rem'}>
                                <b>Estado:</b> <span style={{ color: selectedReservation.state === 'Pagada' ? '#388e3c' : '#f44336', fontWeight: 600 }}>{selectedReservation.state}</span>
                            </Typography>
                        <Stack direction="column" spacing={2} sx={{ mt: 3 }}>
                            {selectedReservation.state === 'Pendiente' && (
                            <Button
                                variant="contained"
                                    color="success"
                                    fullWidth
                                    startIcon={<SendIcon />}
                                    onClick={async () => {
                                        try {
                                            // Obtener datos de la reserva y clientes del localStorage
                                            const reservaData = JSON.parse(localStorage.getItem('reservationData2'));
                                            if (!reservaData || !reservaData.clientList) {
                                                showAlert('No se encontraron los datos de la reserva.', 'error');
                                                return;
                                            }

                                            // Obtener el descuento especial desde el backend
                                            let specialDaysDiscount = 0;
                                            try {
                                                const discountFromBackend = await getDiscount(reservaData.dateReservation);
                                                if (typeof discountFromBackend === 'number') {
                                                    specialDaysDiscount = discountFromBackend;
                                                }
                                            } catch (error) {
                                                specialDaysDiscount = 0;
                                            }

                                            // Llama a createReceipt para cada cliente
                                            for (const client of reservaData.clientList) {
                                                await createReceipt({
                                                    rutClientReceipt: client.rutClient,
                                                    reservationId: reservaData.idReservation,
                                                    clientId: client.idClient,
                                                    specialDaysDiscount: specialDaysDiscount,
                                                });
                                            }

                                            showAlert('Pago confirmado y recibos creados.', 'success');
                                            window.location.reload();
                                        } catch (error) {
                                            showAlert('Error al confirmar el pago.', 'error');
                                        }
                                    }}
                                    sx={{ fontSize: '1.1rem', py: 1.5 }}
                            >
                                    Confirmar Pago
                                </Button>
                            )}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => {
                                        setPendingDeleteId(selectedReservation.id);
                                        setConfirmDialogOpen(true);
                                    }}
                                    sx={{ fontSize: '1.1rem' }}
                                    title="Cancelar la reserva"
                                >
                                    Cancelar la reserva
                            </Button>
                            <Button
                                variant="contained"
                                    color="info"
                                size="small"
                                    onClick={() => {
                                        if (showReceipts) {
                                            setShowReceipts(false);
                                        } else {
                                            handleViewReceipts(Number(selectedReservation.id));
                                        }
                                    }}
                                    startIcon={showReceipts ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    sx={{ fontSize: '1.1rem' }}
                            >
                                    {showReceipts ? 'Ocultar' : 'Ver'} Detalles de Pago
                            </Button>
                        </Stack>
                        </Stack>
                        {showReceipts && (
                            <Box
                                    ref={receiptsRef}
                                sx={{
                                    mt: 4,
                                    p: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 3,
                                        backgroundColor: '#f5f5f5', // Gris claro, no amarillo
                                        color: '#263238',
                                        boxShadow: 2,
                                }}
                            >
                                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>
                                        Comprobantes de esta reserva
                                    </Typography>

                                {receiptsWithNames.length > 0 ? (
                                        <Stack spacing={2}>
                                            {receiptsWithNames.map((r, idx) => (
                                                <Card key={idx} sx={{ p: 2, borderRadius: 2, boxShadow: 1, background: '#fff', border: '1px solid #bdbdbd' }}>
                                                    <CardContent sx={{ p: 0 }}>
                                                        {selectedReservation.state === 'Pendiente' && (
                                                            <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 550, fontSize:'1.2rem', display: 'block', mb: 1 }}>
                                                                ⚠️ PAGO PENDIENTE
                                                            </Typography>
                                                        )}
                                                        <Typography variant="subtitle1" fontWeight={550} sx={{ mb: 1, color: '#388e3c', fontSize: '1.5rem' }}>
                                                            Nombre: <span style={{ color: '#1976d2' }}>{r.nameClient}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1, color: '#616161', fontSize: '1.2rem' }}>
                                                            Rut: {r.rutClientReceipt}
                                                        </Typography>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Precio base:</b></span>
                                                            <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>${formatNumber(Math.round(r.baseRateReceipt))}</span>
                                        </Box>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Descuento por cantidad de personas:</b></span>
                                                            <span style={{ color: '#0288d1', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>{formatNumber(Math.round(r.groupSizeDiscount * 100))}%</span>
                                                        </Box>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Descuento de cumpleaños:</b></span>
                                                            <span style={{ color: '#fbc02d', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>{formatNumber(Math.round(r.birthdayDiscount * 100))}%</span>
                                                        </Box>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Descuento de cliente frecuente:</b></span>
                                                            <span style={{ color: '#7b1fa2', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>{formatNumber(Math.round(r.loyaltyDiscount * 100))}%</span>
                                                        </Box>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Descuento de día especial:</b></span>
                                                            <span style={{ color: '#43a047', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>{formatNumber(Math.round(r.specialDaysDiscount * 100))}%</span>
                                                        </Box>
                                                        {typeof r.maxDiscount !== 'undefined' && (
                                                            <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '1.2rem' }}><b>Descuento máximo aplicado:</b></span>
                                                                <span style={{ color: '#2196f3', minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>{formatNumber(Math.round(r.maxDiscount * 100))}%</span>
                                    </Box>
                                )}   
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>Monto final:</b></span>
                                                            <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>${formatNumber(Math.round(r.finalAmount))}</span>
                                                        </Box>
                                                        <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '1.2rem' }}><b>IVA:</b></span>
                                                            <span style={{ minWidth: 80, textAlign: 'right', marginLeft: 16, fontSize: '1.2rem' }}>${formatNumber(Math.round(r.ivaAmount))}</span>
                                                        </Box>
                                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: 500, color: '#d84315', fontSize: '1.5rem'}}><b>Total:</b></span>
                                                            <span style={{ fontWeight: 600, color: '#d84315', fontSize: '1.5rem', minWidth: 80, textAlign: 'right', marginLeft: 16 }}>${formatNumber(Math.round(r.totalAmount))}</span>
                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Stack>
                                ) : (
                                        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fff' }}>
                                        <Typography sx={{ fontSize: '1.2rem' }}>No hay comprobantes para esta reserva</Typography>
                            </Box>
                        )}
                    </Box>
                )}
                        </CardContent>
                    </Card>
                )}
            {/* Botón flotante para subir */}
            {showScrollUp && (
                <Fab
                    color="primary"
                    size="medium"
                    aria-label="Subir al calendario"
                    onClick={() => {
                        if (calendarRef.current) {
                            calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 2000,
                        boxShadow: 4,
                    }}
                >
                    <KeyboardArrowUpIcon fontSize="large" />
                </Fab>
                )}
            
            {/* Snackbar para alertas bonitas */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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
                                await deleteReservationById(pendingDeleteId);
                                setConfirmDialogOpen(false);
                                showAlert('Reserva cancelada correctamente.', 'success');
                                navigate('/reservations');
                            } catch (error) {
                                setConfirmDialogOpen(false);
                                showAlert('No se pudo cancelar la reserva.', 'error');
                            }
                        }}
                        color="error"
                        variant="contained"
                    >
                        Sí, Borrar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}