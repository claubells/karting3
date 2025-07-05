import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Link } from '@mui/material';
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
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/home"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontWeight: 500,
                        letterSpacing: 1,
                        '&:hover': {
                            color: '#90caf9',
                        },
                        transition: 'color 0.2s',
                    }}
                >
                    Karting RM
                </Typography>

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
