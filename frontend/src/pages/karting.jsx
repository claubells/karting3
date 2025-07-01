import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';

// pagina inicial con la foto de karting y el texto de bienvenida
const Karting = () => {
    return (
        <Box
            sx={{
                minWidth: '200',
                width: '100vw',
                height: '100vh',
                //overflow: 'hidden',
                backgroundImage: 'url(/imagenInicio.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
            }}
        >
            <Box sx={{ maxWidth: '700px' }}>
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
                -1px -1px 1px white,       /* luz blanca arriba izquierda */
                2px 2px 3px rgb(0, 0, 0) /* sombra negra abajo derecha */
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
                    component={Link}
                    to="/home"
                    variant="contained"
                    size="large"
                    endIcon={<EmojiFlagsIcon />}
                    sx={{
                        mt: 4,
                        transition: 'transform 0.3s ease',
                        color: 'white',
                        backgroundColor: 'rgb(26, 120, 215)',
                        '&:hover': {
                            transform: 'translateY(-5px)', // sube 5px
                            boxShadow: '0 8px 16px rgba(17, 21, 3, 0.41)',
                            color: 'rgb(255, 255, 255)', // cambia el color de la letra
                            backgroundColor: 'rgb(30, 143, 255)',
                            '& .MuiSvgIcon-root': {
                                color: 'red', // <-- cambia color del ícono al hacer hover
                            },
                        },
                        '& .MuiSvgIcon-root': {
                            transition: 'color 0.3s ease',
                            color: 'rgb(229, 255, 0)', // color inicial del ícono
                        },
                    }}
                >
                    Reservar Ahora
                </Button>
            </Box>
        </Box>
    );
};

export default Karting;
