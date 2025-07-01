import axios from 'axios';

const host = import.meta.env.VITE_BACKEND_HOST;
const port = import.meta.env.VITE_BACKEND_PORT;

export default axios.create({
  baseURL: `http://${host}:${port}/api/report`,
  headers: { 'Content-Type': 'application/json' }
});


