import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import logokart from '../assets/2.png';

const Navbar = () => {
    return (
        <AppBar position="fixed" color="primary">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Logo como imagen */}
                <Box
                    component={RouterLink}
                    to="/home"
                    sx={{
                        display: 'inline-block',
                        height: 48,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover img': {
                            filter: 'brightness(1.2)',
                        },
                    }}
                >
                    <img
                        src={logokart}
                        alt="Karting RM"
                        style={{ height: '100%', objectFit: 'contain' }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/reservations"
                        startIcon={<CalendarMonthIcon />}
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#90caf9',
                            },
                        }}
                    >
                        Reservas
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/karts"
                        startIcon={<SpeedIcon />}
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#90caf9',
                            },
                        }}
                    >
                        Karts
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/reports"
                        startIcon={<AssessmentIcon />}
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#90caf9',
                            },
                        }}
                    >
                        Reportes
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/home"
                        startIcon={<HomeIcon />}
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#90caf9',
                            },
                        }}
                    >
                        Inicio
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        endIcon={<ExitToAppIcon />}
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#90caf9',
                            },
                        }}
                    >
                        Salir
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
