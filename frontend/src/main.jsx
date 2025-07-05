import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>
);

