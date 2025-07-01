package com.example.karting3.Services;

import com.example.karting3.Entities.ReceiptEntity;
import com.example.karting3.Entities.ReservationEntity;
import com.example.karting3.Repositories.*;
import com.example.karting3.dto.ReceiptDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class ReceiptService {

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private RatesLapsService ratesLapsService;

    @Autowired
    ClientRepository clientRepository;

    @Autowired
    PeopleDiscountRepository peopleDiscountRepository;

    @Autowired
    BirthdayService birthdayService;

    @Autowired
    LoyaltyDiscountService loyaltyDiscountService;

    public List<ReceiptDTO> getMinimalReceipts() {
        return receiptRepository.findAll().stream().map(r -> new ReceiptDTO(
                        r.getReservationId(),
                        r.getBaseRateReceipt()))
                .toList();
    }

    public ReceiptEntity createReceipt(ReceiptEntity receipt) {

        try{
            System.out.println("\nCreando el comprobante *** ");
            System.out.println("Rut del cliente: " + receipt.getRutClientReceipt());
            System.out.println("Reserva ID: " + receipt.getReservationId());
            Long reservationId = receipt.getReservationId();

            ReservationEntity reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID: " + reservationId));

            String nameClient = clientRepository.findNameByRutClient(receipt.getRutClientReceipt());

            if (nameClient.isEmpty()) {
                System.out.println("El nombre de cliente no existe.");
                return null;
            }

            //seteamos el nombre del cliente en el Receipt
            receipt.setNameClientReceipt(nameClient);

            // GET baseRate by laps
            Double baseRate = ratesLapsService.getRateByLaps(reservation.getTurnsTimeReservation());
            receipt.setBaseRateReceipt(baseRate);

            double groupSizeDiscount = peopleDiscountRepository.getPeopleDiscountEntityByPeople(reservation.getGroupSizeReservation());
            receipt.setGroupSizeDiscount(groupSizeDiscount);

            double birthdayDiscount = getBirthdayDiscount(receipt.getRutClientReceipt(), reservation.getDateReservation(), reservation.getGroupSizeReservation());
            receipt.setBirthdayDiscount(birthdayDiscount);

            double loyalityDiscount = getFrequencyDiscount(receipt.getRutClientReceipt(), reservation.getDateReservation());
            receipt.setLoyaltyDiscount(loyalityDiscount);

            double specialDaysDiscount = receipt.getSpecialDaysDiscount();
            receipt.setSpecialDaysDiscount(specialDaysDiscount);

            double maxDiscount = getMaxDiscount(
                    receipt.getGroupSizeDiscount(),
                    receipt.getBirthdayDiscount(),
                    receipt.getLoyaltyDiscount(),
                    specialDaysDiscount
            );
            receipt.setMaxDiscount(maxDiscount);

            double finalAmount = baseRate - (baseRate * maxDiscount);
            receipt.setFinalAmount(finalAmount);

            double ivaAmount = finalAmount * 0.19;
            receipt.setIvaAmount(ivaAmount);

            double totalAmount = finalAmount + ivaAmount;
            receipt.setTotalAmount(totalAmount);

            // cambiamos el estado de la reserva a pagada:
            reservation.setStatusReservation("pagada");

            // Obtener el email del cliente
            String emailClient = clientRepository.findEmailByRutClient(receipt.getRutClientReceipt());

            String normalizedEmail = emailClient.toLowerCase();
            if (normalizedEmail.endsWith("@gmail.com") ||
                            normalizedEmail.endsWith("@hotmail.com") ||
                            normalizedEmail.endsWith("@outlook.com") ||
                            normalizedEmail.endsWith("@usach.cl")
            ) {
                byte[] pdfAdjunto = generarPdfRecibo(receipt);
                sendReceiptWithPdf(emailClient, "Comprobante de Pago - Karting RM",
                        "Adjunto encontrarás tu comprobante en formato PDF.", pdfAdjunto);
            }else{
                System.out.println("El Comprobante de pago no se pudo enviar x correo.");
            }
            // creamos el recibo
            return receiptRepository.save(receipt);
        }
        catch(Exception e){
            System.err.println("Error al crear El comprobante");
            e.printStackTrace();
            throw e;
        }
    }

    public double getBirthdayDiscount(String rutClient, LocalDate reservationDate, int groupSizeReservation) {

        LocalDate birthdateClient = clientRepository.findBirthdateByRut(rutClient);

        if (birthdateClient.getDayOfMonth() == reservationDate.getDayOfMonth() && birthdateClient.getMonthValue() == reservationDate.getMonthValue()) {
            Double discount = birthdayService.getBirthDiscount(birthdateClient, reservationDate, groupSizeReservation);
            if(discount == null){
                System.out.println("El descuento no se pudo calcular.");
                return 0.0;
            }
            return discount;
        }
        return 0.0;
    }


    public ReceiptEntity simulateReceipt(ReceiptEntity receipt) {

        try{
            System.out.println("\nCreando el comprobante SIMULADO*** \n");
            Long reservationId = receipt.getReservationId();

            ReservationEntity reservation = reservationRepository.findById(receipt.getReservationId())
                    .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID: " + receipt.getReservationId()));

            String nameClient = clientRepository.findNameByRutClient(receipt.getRutClientReceipt());

            if (nameClient.isEmpty()) {
                System.out.println("El nombre de cliente no existe.");
                return null;
            }

            System.out.println("RUT recibido: " + receipt.getRutClientReceipt());
            System.out.println("Reserva ID recibido: " + receipt.getReservationId());
            System.out.println("Special day discount: " + receipt.getSpecialDaysDiscount());

            Double baseRate = ratesLapsService.getRateByLaps(reservation.getTurnsTimeReservation());

            double groupSizeDiscount = peopleDiscountRepository.getPeopleDiscountEntityByPeople(reservation.getGroupSizeReservation());
            double birthdayDiscount = getBirthdayDiscount(receipt.getRutClientReceipt(), reservation.getDateReservation(), reservation.getGroupSizeReservation());
            double loyaltyDiscount = getFrequencyDiscount(receipt.getRutClientReceipt(), reservation.getDateReservation());

            double specialDaysDiscount = receipt.getSpecialDaysDiscount();
            receipt.setSpecialDaysDiscount(specialDaysDiscount);

            double maxDiscount = getMaxDiscount(
                    groupSizeDiscount,
                    birthdayDiscount,
                    loyaltyDiscount,
                    specialDaysDiscount
            );

            double finalAmount = baseRate - (baseRate * maxDiscount);
            double ivaAmount = finalAmount * 0.19;
            double totalAmount = finalAmount + ivaAmount;

            Long clientId = getClientId(receipt.getRutClientReceipt());

            // Crear objeto simulación
            ReceiptEntity simulated = new ReceiptEntity();
            simulated.setRutClientReceipt(receipt.getRutClientReceipt());
            simulated.setNameClientReceipt(nameClient);
            simulated.setBaseRateReceipt(baseRate);
            simulated.setGroupSizeDiscount(groupSizeDiscount);
            simulated.setBirthdayDiscount(birthdayDiscount);
            simulated.setLoyaltyDiscount(loyaltyDiscount);
            simulated.setSpecialDaysDiscount(specialDaysDiscount);
            simulated.setMaxDiscount(maxDiscount);
            simulated.setFinalAmount(finalAmount);
            simulated.setIvaAmount(ivaAmount);
            simulated.setTotalAmount(totalAmount);
            simulated.setClientId(clientId);
            simulated.setReservationId(reservationId);

            return simulated;
        }
        catch(Exception e){
            System.err.println("Error al crear El comprobante");
            e.printStackTrace();
            throw e;
        }
    }

    public List<ReceiptEntity> getReceiptsByReservationId(String reservationId){
        List<ReceiptEntity> reciepts = receiptRepository.findAllByReservationId(reservationId);
        System.out.println("\nRecibos de la reserva con ID: " + reservationId+ "***** \n");
        for(ReceiptEntity receipt : reciepts){
            System.out.println("El comprobante con ID: " + receipt.getIdReceipt() + " pertenece a la reserva con ID: " + receipt.getReservationId());
        }
        return reciepts;
    }

    public Long getClientId(String rut){
        String url = "http://localhost:8091/api/client/getid/" + rut;
        Long clientId = clientRepository.getIdByRutClient(rut);
        if(clientId == null){
            System.out.println("El id del cliente no existe rut: " + rut);
            return null;
        }
        return clientId;
    }

    public Double getFrequencyDiscount(String rut, LocalDate date) {
        Double descuento = loyaltyDiscountService.getMonthlyFrequencyDiscount(rut, date);
        if(descuento == null){
            System.out.println("No se pudo recuperar el descuento");
            return 0.0;
        }
        return descuento;
    }

    public int getMonthlyFrequency(String rut, LocalDate date) {
        return receiptRepository.countReceiptsByRutAndMonth(rut, date.getYear(), date.getMonthValue());
    }

    private double getMaxDiscount(double groupSizeDiscount, double birthdayDiscount, double loyaltyDiscount, double specialDaysDiscount) {
        return Math.max(
                Math.max(groupSizeDiscount, birthdayDiscount),
                Math.max(loyaltyDiscount, specialDaysDiscount)
        );
    }

    public byte[] generarPdfRecibo(ReceiptEntity receipt) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                NumberFormat formatter = NumberFormat.getInstance(new Locale("es", "CL"));
                float margin = 50;
                float yStart = page.getMediaBox().getHeight() - margin;
                float tableWidth = page.getMediaBox().getWidth() - 2 * margin;
                float yPosition = yStart;
                float rowHeight = 30f;
                float tableHeight = 8 * rowHeight;
                float cellMargin = 5f;
                float[] columnWidth = {150f, 300f};
                float xStart = margin;

                // Título
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
                contentStream.newLineAtOffset(margin + 100, yPosition);
                contentStream.showText("Comprobante de Pago - Karting RM");
                contentStream.endText();
                yPosition -= 50;

                // Inicio de la tabla
                float tableTopY = yPosition;

                // Datos para la tabla
                String[][] content = {
                    {"Nombre", receipt.getNameClientReceipt()},
                    {"RUT", receipt.getRutClientReceipt()},
                    {"Precio base", "$" + formatter.format(receipt.getBaseRateReceipt())},
                    {"Descuento aplicado", formatter.format(receipt.getMaxDiscount() * 100) + "%"},
                    {"Monto final", "$" + formatter.format(receipt.getFinalAmount())},
                    {"IVA (19%)", "$" + formatter.format(receipt.getIvaAmount())},
                    {"Total a pagar", "$" + formatter.format(receipt.getTotalAmount())}
                };

                // Dibujar la tabla
                float nextY = yPosition;
                for (int i = 0; i < content.length; i++) {
                    // Dibujar las líneas horizontales
                    contentStream.moveTo(xStart, nextY);
                    contentStream.lineTo(xStart + tableWidth, nextY);
                    contentStream.stroke();

                    // Dibujar el contenido
                    float textY = nextY - rowHeight + 10;

                    // Primera columna (etiqueta)
                    contentStream.beginText();
                    if (i == content.length - 1) { // Si es la última fila (Total a pagar)
                        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                        contentStream.setNonStrokingColor(1, 0, 0); // Rojo
                    } else {
                        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                        contentStream.setNonStrokingColor(0, 0, 0); // Negro
                    }
                    contentStream.newLineAtOffset(xStart + cellMargin, textY);
                    contentStream.showText(content[i][0]);
                    contentStream.endText();

                    // Segunda columna (valor)
                    contentStream.beginText();
                    if (i == content.length - 1) { // Si es la última fila (Total a pagar)
                        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                        contentStream.setNonStrokingColor(1, 0, 0); // Rojo
                    } else {
                        contentStream.setFont(PDType1Font.HELVETICA, 12);
                        contentStream.setNonStrokingColor(0, 0, 0); // Negro
                    }
                    contentStream.newLineAtOffset(xStart + columnWidth[0] + cellMargin, textY);
                    contentStream.showText(content[i][1]);
                    contentStream.endText();

                    nextY -= rowHeight;
                }

                // Restaurar color negro para las líneas
                contentStream.setStrokingColor(0, 0, 0);

                // Dibujar la última línea horizontal
                contentStream.moveTo(xStart, nextY);
                contentStream.lineTo(xStart + tableWidth, nextY);
                contentStream.stroke();

                // Dibujar líneas verticales
                // Línea izquierda
                contentStream.moveTo(xStart, yPosition);
                contentStream.lineTo(xStart, nextY);
                contentStream.stroke();

                // Línea de separación entre columnas
                contentStream.moveTo(xStart + columnWidth[0], yPosition);
                contentStream.lineTo(xStart + columnWidth[0], nextY);
                contentStream.stroke();

                // Línea derecha
                contentStream.moveTo(xStart + tableWidth, yPosition);
                contentStream.lineTo(xStart + tableWidth, nextY);
                contentStream.stroke();

                // Resaltar la última fila (Total a pagar)
                contentStream.setLineWidth(1.5f);
                float lastRowY = nextY + rowHeight;
                contentStream.moveTo(xStart, lastRowY);
                contentStream.lineTo(xStart + tableWidth, lastRowY);
                contentStream.stroke();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Error generando PDF: " + e.getMessage());
            throw new RuntimeException("Error al generar el PDF", e);
        }
    }

    public void sendReceiptWithPdf(String toEmail, String subject, String mensaje, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(mensaje, false); // cuerpo del correo (texto plano o HTML si quieres)

            ByteArrayDataSource dataSource = new ByteArrayDataSource(pdfBytes, "application/pdf");
            helper.addAttachment("Comprobante_KartingRM.pdf", dataSource);

            mailSender.send(message);
            System.out.println("📄 PDF enviado exitosamente por correo.");
        } catch (Exception e) {
            System.err.println("❌ Error enviando PDF por correo: " + e.getMessage());
        }
    }

    public int obtenerIngresoPorVueltasYMes(int turns, String month) {
        return receiptRepository.obtenerIngresoPorVueltasYMes(turns, month);
    }

    public int obtenerIngresoPorRangoYMes(int min, int max, String month) {
        return receiptRepository.obtenerIngresoPorRangoYMes(min, max, month);
    }
}
