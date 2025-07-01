import React from 'react';
import Navbar from './Navbar';
import { Box } from '@mui/material';

const WithNavbar = ({ children }) => {
    return (
        <>
            <Navbar />
            <Box sx={{ pt: 8 }}>{children}</Box>
        </>
    );
};

export default WithNavbar;
