import { Box, Typography, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider, Stack, Paper } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

const faqs = [
  {
    id: "faq_participantes",
    icon: <GroupIcon color="primary" />, 
    q: "¿Cuántos pilotos pueden participar en una reserva?",
    a: "Puedes reservar para entre 1 y 15 pilotos."
  },
  {
    id: "faq_modelo_karts",
    icon: <DirectionsRunIcon color="primary" />, 
    q: "¿Cuál es el modelo de los karts?",
    a: "Todos los karts son modelo Sodikart RT8."
  },
  {
    id: "faq_edad_minima",
    icon: <InfoIcon color="primary" />, 
    q: "¿Desde qué edad se puede arrendar?",
    a: "Desde los 14 años, debido a las limitaciones del modelo de kart."
  },
  {
    id: "faq_fechas_pasadas",
    icon: <CalendarMonthIcon color="primary" />, 
    q: "¿Puedo reservar para fechas pasadas?",
    a: "No, solo puedes reservar para fechas y horas futuras, hasta el 31 de diciembre de 2025."
  },
  {
    id: "faq_cualquier_dia",
    icon: <CalendarMonthIcon color="primary" />, 
    q: "¿Puedo reservar para cualquier día?",
    a: "Sí, siempre que la fecha sea futura y hasta el 31 de diciembre de 2025."
  },
  {
    id: "faq_varias_personas",
    icon: <GroupIcon color="primary" />, 
    q: "¿Puedo reservar para varias personas?",
    a: "Sí, puedes seleccionar la cantidad de pilotos al momento de hacer la reserva (de 1 a 15)."
  },
  {
    id: "faq_registrado",
    icon: <InfoIcon color="primary" />, 
    q: "¿Qué pasa si ya estoy registrado?",
    a: "Solo necesitas ingresar tu RUT y el sistema completará tus datos automáticamente, bloqueando los demás campos."
  },
  {
    id: "faq_cancelar",
    icon: <InfoIcon color="primary" />, 
    q: "¿Puedo cancelar una reserva?",
    a: "Sí, después de crear la reserva puedes cancelarla desde la página de resumen o desde el calendario (rack) haciendo clic en la reserva."
  },
  {
    id: "faq_pagar_despues",
    icon: <InfoIcon color="primary" />, 
    q: "¿Puedo pagar después?",
    a: "Sí, puedes elegir pagar después o pagar de inmediato al finalizar la reserva."
  },
  {
    id: "faq_duracion",
    icon: <AccessTimeIcon color="primary" />, 
    q: "¿Cuánto tiempo dura la experiencia?",
    a: "El tiempo total incluye las vueltas seleccionadas más 20 minutos adicionales para preparación e instrucciones."
  },
  {
    id: "faq_comprobante",
    icon: <InfoIcon color="primary" />, 
    q: "¿Recibo un comprobante?",
    a: "Sí, cada piloto recibirá un comprobante por separado al confirmar el pago. Además, puedes ver los comprobantes desde el calendario (rack) haciendo clic en la reserva."
  },
];

const FAQ = () => (
  <Box maxWidth={900} mx="auto" my={4} px={2}>
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)' }}>
      <Typography variant="h3" color="primary" fontWeight={700} gutterBottom align="center">
        ¿Cómo arrendar un kart?
      </Typography>
      <Stack spacing={2}>
        <Typography variant="body1" fontSize="1.2rem">
          <b>1.</b> Selecciona la fecha y hora en el calendario (rack), o haz clic en <b>&quot;Crear reserva&quot;</b> y elige manualmente la fecha y hora de inicio.<br/>
          <i>Solo puedes reservar para fechas y horas futuras, hasta el 31 de diciembre de 2025.</i>
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>2.</b> Selecciona la cantidad de vueltas. El sistema calculará automáticamente la hora de término y sumará 20 minutos adicionales para preparación e instrucciones.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>3.</b> Haz clic en <b>&quot;Continuar&quot;</b>. Se abrirá una nueva página.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>4.</b> Indica la cantidad de pilotos (de 1 a 15).
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>5.</b> Si es tu primera vez, deberás completar todos los datos. Si ya estás registrado, solo ingresa tu RUT y el sistema completará el resto automáticamente, bloqueando los demás campos.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>6.</b> Haz clic en <b>&quot;Confirmar&quot;</b>. Se te pedirá revisar cuidadosamente los datos, ya que se creará la reserva.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>7.</b> Tras confirmar, verás el resumen de la reserva, donde podrás cancelar, pagar después o pagar de inmediato.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>8.</b> Al confirmar el pago, cada piloto recibirá su comprobante por separado.
        </Typography>
        <Typography variant="body1" fontSize="1.2rem">
          <b>9.</b> También puedes ver los detalles y comprobantes de cada reserva desde el calendario (rack): solo haz clic en una reserva para ver sus detalles, comprobantes y la opción de cancelar.
        </Typography>
      </Stack>
    </Paper>

    <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <HelpOutlineIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h4" color="primary" fontWeight={700}>
            Preguntas frecuentes (FAQ)
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {faqs.map((faq) => (
            <ListItem alignItems="flex-start" key={faq.id} sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>{faq.icon}</ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" fontWeight={600} fontSize="1.3rem">{faq.q}</Typography>}
                secondary={<Typography variant="body1" color="text.secondary">{faq.a}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Box>
);

export default FAQ;
