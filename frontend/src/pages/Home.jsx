import { Box, Typography } from '@mui/material';

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
            <Typography variant="h3" component="h3" gutterBottom>
                Inicio Karting RM
            </Typography>
        </Box>
    );
}