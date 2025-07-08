import Navbar from './Navbar';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const WithNavbar = ({ children }) => {
    return (
        <>
            <Navbar />
            <Box sx={{ pt: 8 }}>{children}</Box>
        </>
    );
};

WithNavbar.propTypes = {
    children: PropTypes.node.isRequired,
};

export default WithNavbar;
