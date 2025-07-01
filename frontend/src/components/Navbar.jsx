import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Navbar = () => {
    return (
        <AppBar position="fixed" color="primary">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Karting RM
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/reservations"
                        startIcon={<CalendarMonthIcon />}
                    >
                        Reservas
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/karts"
                        startIcon={<SpeedIcon />}
                    >
                        Karts
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/reports"
                        startIcon={<AssessmentIcon />}
                    >
                        Reportes
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/home"
                        startIcon={<HomeIcon />}
                    >
                        Inicio
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        endIcon={<ExitToAppIcon />}
                    >
                        Salir
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
