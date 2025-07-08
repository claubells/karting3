import { useEffect, useState } from 'react';
import { getAllKarts } from '../api/ratesApi';
import {
    Container,
    Typography,
    Grid,
    Box,
    CircularProgress,
    AlertTitle,
    Alert,
    Card,
    CardContent,
    Chip,
    Paper,
    Grow,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SettingsIcon from '@mui/icons-material/Settings';

const Karts = () => {
    // "karts" es una variable de estado que empieza como un array vacío
    // la funcion setKarts se usa para actualizar el estado de "karts"
    const [karts, setKarts] = useState([]);

    // "loading" es una variable de estado que empieza como true
    // para que cuando se este cargando los karts, se muestre un mensaje de carga
    const [loading, setLoading] = useState(true);

    // "error" es una variable de estado que empieza como null
    // si ocurre un error al cargar los karts, se actualiza con un mensaje de error
    const [error, setError] = useState(null);

    // cuando se carga haz lo siguiente
    useEffect(() => {
        getAllKarts() // hace una llamada a la API para obtener todos los karts
            .then((response) => {
                // si la llamada es exitosa
                setKarts(response.data); // guarda los datos
                setLoading(false); // indica que ya terminó la carga
            })
            .catch((err) => {
                // sino
                setError('Error con la base de datos al cargar los karts.', err);
                setLoading(false); // deja de cargar
            });
    }, []); // [] significa que solo se ejecuta una vez al cargar el componente

    if (loading) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.21)',
                    zIndex: 1300,
                }}
            >
                <CircularProgress color="secondary" sx={{ mr: 2 }} />
                <Typography variant="h6" color="rgba(126, 126, 126, 0.84)">
                    Cargando karts...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',

                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Container sx={{ mt: 1, mb: 18 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                    borderRadius: 2
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
                    Karts Disponibles
                </Typography>
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        mt: 1, 
                        color: 'rgba(255,255,255,0.9)'
                    }}
                >
                    Explora nuestra flota de karts de alta calidad
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {karts.map((kart, index) => (
                    <Grid key={kart.idKart}>
                        <Grow in={true} timeout={300 * (index + 1)}>
                            <Card 
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <DirectionsCarIcon sx={{ fontSize: 40, color: '#ea1d25', mr: 2 }} />
                                        <Typography variant="h6" component="div">
                                            {kart.modelKart}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <QrCodeIcon sx={{ color: '#90caf9', mr: 1 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            Código: {kart.codeKart}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <SettingsIcon sx={{ color: '#90caf9', mr: 1 }} />
                                        <Chip
                                            label={kart.statusKart}
                                            color={['disponible', 'available'].includes(kart.statusKart.toLowerCase()) ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Karts;