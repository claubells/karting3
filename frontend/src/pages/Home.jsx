import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {

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
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="80vh"
            p={4}
        >
            <Typography variant="h3" component="h3" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', textAlign: 'center' }}>
                ¡Vive la adrenalina del karting en RM!
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: '#333', textAlign: 'center' }}>
                Reserva tu kart en segundos y prepárate para la mejor experiencia de velocidad. <br />
                ¡Haz tu reserva ahora y asegura tu lugar en la pista!
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
        </Box>

        </>
    );
}