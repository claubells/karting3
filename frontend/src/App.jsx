import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home, Karts, Karting, Reservations, ReservationsClients, ReservationSummary, Reports } from './pages';
import './App.css';
import WithNavbar from './components/WithNavbar';
import { useEffect } from 'react';

function AppContent() {
    const location = useLocation();

    // con esta funcion se cambia el root segun la ruta de la pagina
    useEffect(() => {
        const isLanding = location.pathname === '/';
        const root = document.getElementById('root');

        if (root) {
            if (isLanding) {
                root.classList.add('fullscreen'); // si esta en / es fullscreen
            } else {
                root.classList.remove('fullscreen'); // si estamos en otra ruta es sin fullscreen
            }
        }
    }, [location]);

    return (
        <Routes>
            <Route path="/" element={<Karting />} />
            <Route
                path="/home"
                element={
                    <WithNavbar>
                        <Home />
                    </WithNavbar>
                }
            />
            <Route
                path="/karts"
                element={
                    <WithNavbar>
                        <Karts />
                    </WithNavbar>
                }
            />
            <Route
                path="/reservations"
                element={
                    <WithNavbar>
                        <Reservations />
                    </WithNavbar>
                }
            />
            <Route
                path="/reservations-clients"
                element={
                    <WithNavbar>
                        <ReservationsClients />
                    </WithNavbar>
                }
            />
            <Route
                path="/reservation-summary"
                element={
                    <WithNavbar>
                        <ReservationSummary />
                    </WithNavbar>
                }
            />
            <Route
                path="/reports"
                element={
                    <WithNavbar>
                        <Reports />
                    </WithNavbar>
                }
            />
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
