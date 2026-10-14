package com.banco.quejas.servicio;

import com.banco.quejas.modelo.Queja;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfServicio {

    public byte[] generarResolucionPdf(Queja queja, String resolucion, String nombreAgente) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Crear documento con márgenes
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Título
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("Dictamen de Resolución de Queja\nBanco Capital Nacional (BCN)",
                    fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);
            document.add(Chunk.NEWLINE);

            // Datos de la Queja
            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("Información General:", fontSubtitulo));
            document.add(new Paragraph("Ticket: " + queja.getNumeroTicket(), fontNormal));
            document.add(new Paragraph(
                    "Fecha de Registro: "
                            + queja.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    fontNormal));
            document.add(new Paragraph("Cliente: " + queja.getUsuarioEmail(), fontNormal));
            document.add(new Paragraph("Motivo de la Queja: " + queja.getTitulo(), fontNormal));
            document.add(new Paragraph("Descripción de los Hechos: " + queja.getDescripcion(), fontNormal));
            document.add(Chunk.NEWLINE);

            // Resolución del Agente
            document.add(new Paragraph("Resolución y Análisis del Agente:", fontSubtitulo));
            Paragraph textoResolucion = new Paragraph(resolucion, fontNormal);
            textoResolucion.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(textoResolucion);
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            // Espacio para la firma de DocuSign
            document.add(new Paragraph("____________________________________________", fontNormal));
            document.add(new Paragraph("Firma del Agente Responsable: " + nombreAgente, fontSubtitulo));

            document.close();
            return baos.toByteArray(); // Devolvemos el PDF en formato de bytes
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF de resolución: " + e.getMessage());
        }
    }
}