import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FormControl, InputLabel, Box, Button, TextField, Typography, Select, MenuItem, Stack } from '@mui/material';
import { verifyAvailability, deleteReservationById, getReceiptsByReservationId, getHoursConfig } from '../api/reservationApi';
import { getHolidays } from '../api/specialdayApi';
import { getRackReservations } from '../api/rackApi';


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
                color: '#555555', // Color de bloqueo semana
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
        color: '#555555', // Color de bloqueo feriados
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

    const detailsRef = useRef(null);

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

    // ver los detalles del comprobante -> receipt
    const handleViewReceipts = async (reservationId) => {
    
        try {
            console.log('ID de reserva:', reservationId);
            const receiptsData = await getReceiptsByReservationId(reservationId);
            setReceipts(receiptsData); // guarda los recibos en el estado
            setShowReceipts(true); // muestra los recibos
        } catch (error) {
            alert('Hubo un error al mostrar los comprobantes de la reserva');
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
        });
    
        //extendedProps contiene la información adicional de la reserva
    
        setShowForm(false); // oculta el formulario de crear reserva si estaba abierto

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

    const handleHourSelect = async (e) => {
        const { name, value } = e.target;

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
            const isHoy = new Date().toISOString().split('T')[0];
            const isInvalidDate = value < hoy;
            const isInvalidHour = validateTime(formData.horaInicio, value);

            setInvalidDate(isInvalidDate);
            setInvalidStartTime(isInvalidHour);

            // Reinicio la hora de fin porque puede depender del nuevo día
            newFormData.horaFin = '';
            setInvalidEndTime(false);
            setInvalidDate(value < isHoy); // Verifica si la fecha es anterior a hoy
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
            alert('La hora inicial no es válida, debe de estar dentro del horario.');
            return;
        }

        if (invalidEndTime || invalidDate) {
            alert('La hora final no es válida, debe de estar dentro del horario.');
            return;
        }

        if (invalidDate) {
            alert('El día de la reserva debe ser para hoy en adelante.');
            return;
        }

        // Validamos que todos los campos estén completos
        const { fecha, horaInicio, horaFin, turns } = formData;

        // Validamos que todos los campos esten completos
        if (!fecha || !horaInicio || !horaFin || !turns) {
            alert('Por favor completa todos los campos antes de continuar');
            return;
        }

        // Solo validamos disponibilidad si ya hay 'turns' seleccionado
        // Confirmamos que no haya otra reserva en el horario seleccionado
        const disponible = await verifyAvailability(fecha, horaInicio, horaFin);

        if (!disponible) {
            alert('Ya existe una reserva en ese horario. Por favor elige otro.');
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

                const formatted = reservas.map((r) => ({
                    id: r.idReservation,
                    title: `Titular: ${r.holdersReservation}`,
                    start: `${r.dateReservation}T${r.startHourReservation}`,
                    end: `${r.dateReservation}T${r.finalHourReservation}`,
                    vueltas: r.turnsTimeReservation,
                    group: r.groupSizeReservation,
                    state: r.statusReservation,
                    display: 'block',
                }));

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
                    ...generateHolidayBlockings(holidayDates), 
                    ...monToFri, 
                    ...locksHolidays, 
                    ...formatted
                ]);
            } catch (error) {
                console.error('Error al cargar los datos iniciales:', error);
            }
            
        };

        loadInitialData();
    }, []);

    return (
        <div style={{ padding: '2rem', width: '100%' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#e0e0e0' }}>
                Calendario de Reservas
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
                    }}
                >
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
                        
                    />
                </Box>

                <Box sx={{ width: '320px' }}>
                    <Button
                        variant="contained" // FOMRULARIO LATERAL ****
                        color="primary" // #1976d2
                        fullWidth
                        onClick={() => setShowForm((prev) => !prev)}
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
                                backgroundColor: '#455a64', //color fomulario
                                padding: 3,
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                mt: 2,
                            }}
                        >
                            <Typography variant="h6">Nueva Reserva</Typography>

                            {/* Fecha */}
                            <TextField
                                type="date"
                                label="Mes/día/año"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleHourSelect}
                                required
                                error={invalidDate} // Si la fecha es inválida, se muestra el error
                                helperText={
                                    invalidDate ? 'La fecha debe ser para hoy en adelante' : ''
                                } // Mensaje de error
                                slotProps={{
                                    input: {
                                        min: new Date().toISOString().split('T')[0],
                                    },
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />

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
                                //aumentar tamaño de la letra
                                <Typography
                                    variant="caption"
                                    sx={{ mt: -1, ml: 1, fontSize: '0.9rem', color: '#00e676' }}
                                >
                                    {`Tiempo total de la reserva: ${getReservationDuration(formData.turns)} minutos`}
                                </Typography>
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
                                color="success"
                                onClick={handleConfirm} // aquí guardamos los datos en el localstorage
                            >
                                Continuar
                            </Button>
                        </Box>
                    )}

                </Box>
                
            </Box>
                {selectedReservation && (
                    <Box 
                        ref={detailsRef} p={4}
                        sx={{
                        mt: 4,
                        p: 3,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        backgroundColor: '#263238',
                        color: '#ffffff',
                        width: '47%',
                        textAlign: 'left'
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 2 }}>Detalle de la Reserva</Typography>
                        <Typography> Titular: {selectedReservation.title}</Typography>
                        <Typography> Fecha: {new Date(selectedReservation.start).toLocaleDateString()}</Typography>
                        <Typography> Hora de inicio: {new Date(selectedReservation.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false })}</Typography>
                        <Typography> Hora final: {new Date(selectedReservation.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false })}</Typography>
                        <Typography> Vueltas o tiempo en minutos: {selectedReservation.vueltas}</Typography>
                        <Typography> Tamaño del grupo: {selectedReservation.group} </Typography>
                        <Typography> Estado de la reserva: {selectedReservation.state}</Typography>

                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            {/* Botón para eliminar */}
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ mt: 2 }}
                                size="small"
                                onClick={() => handleDeleteReservation(selectedReservation.id)}
                            >
                                Cancelar esta reserva
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                sx={{ mt: 2 }}
                                size="small"
                                onClick={() => handleViewReceipts(Number(selectedReservation.id))}
                            >
                                Ver comprobantes
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 2 }}
                                size="small"
                                onClick={() => setShowReceipts(false)}
                            >
                                Ocultar Comprobantes
                            </Button>
                        </Stack>
                        {/* Comprobantes de la reserva */}
                        {showReceipts && (
                            <Box
                                sx={{
                                    mt: 4,
                                    p: 2,
                                    border: '1px solid #ccc',
                                    borderRadius: 2,
                                    backgroundColor: '#263238',
                                    color: '#ffffff'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>Comprobantes de esta reserva</Typography>

                                {receipts.length > 0 ? (
                                    receipts.map((r, idx) => (
                                        <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #666', borderRadius: 1 }}>
                                            <Typography> Rut Cliente: {r.rutClientReceipt}</Typography>
                                            <Typography> Precio base: ${r.baseRateReceipt.toFixed(0)}</Typography>
                                            <Typography> Descuento por cantidad de personas: {r.groupSizeDiscount * 100}%</Typography>
                                            <Typography> Descuento de cumpleaños: {r.birthdayDiscount * 100}%</Typography>
                                            <Typography> Descuento de cliente frecuente: {r.loyaltyDiscount * 100}%</Typography>
                                            <Typography> Descuento de día especial: {r.specialDaysDiscount * 100}%</Typography>
                                            <Typography> Monto final: ${r.finalAmount.toFixed(0)}</Typography>
                                            <Typography> IVA: ${r.ivaAmount.toFixed(0)}</Typography>
                                            <Typography fontWeight="bold" color="success.main" ><b>Total a pagar:</b> ${r.totalAmount.toFixed(0)}</Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 2, border: '1px solid #666', borderRadius: 1 }}>
                                        <Typography>No hay comprobantes para esta reserva</Typography>
                                    </Box>
                                )}   
                            </Box>
                        )}


                    </Box>
                )}
        </div>
    );
}
