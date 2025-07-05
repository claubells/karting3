import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
    return (
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
                sx={{ fontSize: '1.3rem', px: 5, py: 2, borderRadius: 3, boxShadow: 3 }}
            >
                Reservar mi Kart
            </Button>
        </Box>
    );
}