import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Home() {

    // Carrusel de imágenes de fondo
    const images = [
        '/imagenInicio.jpg',
        '/kart2.jpg',
        '/kart3.jpg',
        '/kart4.jpg',
        '/kart5.jpg',
        '/kart6.jpg',
        '/kart7.jpg',
        '/kart8.jpg',
    ];
    const [current, setCurrent] = useState(0);
    const intervalRef = useRef();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(intervalRef.current);
    }, [images.length]);

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        resetInterval();
    };
    const handleNext = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        resetInterval();
    };
    // Reinicia el intervalo cuando se navega manualmente
    const resetInterval = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000);
    };

   const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleCloseSnackbar = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        const msg = localStorage.getItem('postSuccessMessage');
        if (msg) {
            setSnackbar({
                open: true,
                message: msg,
                severity: 'success',
            });
            localStorage.removeItem('postSuccessMessage');
        }
    }, []);

    return (
        <>
            {/* Snackbar para mostrar alerta de éxito */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
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
                            backgroundColor: '#ffe082',
                            color: '#5d4037',
                            border: '1px solid #ffb300',
                        }),
                        ...(snackbar.severity === 'error' && {
                            backgroundColor: '#ffb3b3',
                            color: '#b71c1c',
                            border: '1px solid #ff5252',
                        }),
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                minWidth: '200px',
                backgroundImage: `url(${images[current]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                p: 4,
                transition: 'background-image 0.5s ease',
            }}
        >
            {/* Botón anterior */}
            <Button
                onClick={handlePrev}
                sx={{
                    position: 'absolute',
                    left: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    minWidth: 0,
                    color: 'white',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                    zIndex: 2,
                    '&:hover': { background: 'rgba(0,0,0,0.5)' },
                }}
            >
                <ArrowBackIosNewIcon fontSize="large" />
            </Button>
            <Typography
                variant="h2"
                fontWeight="bold"
                gutterBottom
                sx={{
                    textShadow: '2px 2px 4px rgb(0, 0, 0)',
                    color: 'white',
                }}
            >
                Bienvenido a
            </Typography>
            <Typography
                variant="h2"
                fontWeight="bold"
                gutterBottom
                sx={{
                    fontSize: '6rem',
                    color: 'rgb(255, 0, 0)',
                    textShadow: `
                        -1px -1px 1px white,
                        2px 2px 3px rgb(0, 0, 0)
                    `,
                }}
            >
                Karting RM
            </Typography>
            <Typography
                variant="h5"
                gutterBottom
                sx={{
                    textShadow: '4px 4px 4px rgb(0, 0, 0)',
                    color: 'white',
                }}
            >
                Vive la adrenalina en cada curva. Reserva tu experiencia ahora.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/reservations"
                sx={{
                    fontSize: '1.3rem',
                    px: 5,
                    py: 2,
                    borderRadius: 3,
                    boxShadow: 3,
                    color: 'white', // color inicial del texto
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                        color: 'rgb(212, 212, 212)', // mantener el texto blanco en hover
                    },
                }}
            >
                Reservar mi Kart
            </Button>
            {/* Botón siguiente */}
            <Button
                onClick={handleNext}
                sx={{
                    position: 'absolute',
                    right: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    minWidth: 0,
                    color: 'white',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                    zIndex: 2,
                    '&:hover': { background: 'rgba(0,0,0,0.5)' },
                }}
            >
                <ArrowForwardIosIcon fontSize="large" />
            </Button>
        </Box>

        </>
    );
}