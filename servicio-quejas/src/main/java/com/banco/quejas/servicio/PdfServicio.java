package com.banco.quejas.servicio;

import com.banco.quejas.modelo.Queja;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfServicio {

// Colores institucionales
private static final Color AZUL_INSTITUCIONAL =
        new Color(2, 30, 69); // #021E45

private static final Color VERDE_INSTITUCIONAL =
        new Color(81, 193, 55); // #51C137

private static final Color GRIS_FONDO =
        new Color(243, 246, 249);

private static final Color GRIS_BORDE =
        new Color(218, 225, 232);

private static final Color GRIS_TEXTO =
        new Color(65, 75, 88);

private static final DateTimeFormatter FORMATO_FECHA =
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

public byte[] generarResolucionPdf(
        Queja queja,
        String resolucion,
        String nombreAgente,
        String nombreSupervisor,
        String nombreJefe,
        String nombreGerente) {

    if (queja == null) {
        throw new IllegalArgumentException(
                "La información de la queja no puede ser nula.");
    }

    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

        Document document = new Document(
                PageSize.A4,
                45,
                45,
                40,
                40
        );

        PdfWriter.getInstance(document, baos);
        document.open();

        // Fuentes
        Font fontTitulo = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                19,
                AZUL_INSTITUCIONAL
        );

        Font fontSubtitulo = FontFactory.getFont(
                FontFactory.HELVETICA,
                10,
                GRIS_TEXTO
        );

        Font fontSeccion = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                11,
                AZUL_INSTITUCIONAL
        );

        Font fontEtiqueta = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                9,
                AZUL_INSTITUCIONAL
        );

        Font fontNormal = FontFactory.getFont(
                FontFactory.HELVETICA,
                9,
                GRIS_TEXTO
        );

        Font fontResolucion = FontFactory.getFont(
                FontFactory.HELVETICA,
                10,
                GRIS_TEXTO
        );

        Font fontFirma = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                9,
                AZUL_INSTITUCIONAL
        );

        Font fontNombreFirma = FontFactory.getFont(
                FontFactory.HELVETICA,
                8,
                GRIS_TEXTO
        );

        // =========================================
        // ENCABEZADO INSTITUCIONAL
        // =========================================

        Paragraph titulo = new Paragraph(
                "BANCO CAPITAL NACIONAL",
                fontTitulo
        );

        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(4f);
        document.add(titulo);

        Paragraph subtitulo = new Paragraph(
                "DICTAMEN DE RESOLUCIÓN DE QUEJA",
                fontSubtitulo
        );

        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(14f);
        document.add(subtitulo);

        // Línea verde institucional
        PdfPTable lineaInstitucional = new PdfPTable(1);
        lineaInstitucional.setWidthPercentage(100);
        lineaInstitucional.setSpacingAfter(18f);

        PdfPCell celdaLinea = new PdfPCell(new Phrase(" "));
        celdaLinea.setBorder(Rectangle.NO_BORDER);
        celdaLinea.setBackgroundColor(VERDE_INSTITUCIONAL);
        celdaLinea.setFixedHeight(4f);

        lineaInstitucional.addCell(celdaLinea);
        document.add(lineaInstitucional);

        // =========================================
        // INFORMACIÓN GENERAL DE LA QUEJA
        // =========================================

        agregarTituloSeccion(
                document,
                "1. INFORMACIÓN GENERAL",
                fontSeccion
        );

        PdfPTable tablaDatos = new PdfPTable(
                new float[]{1.25f, 3.75f}
        );

        tablaDatos.setWidthPercentage(100);
        tablaDatos.setSpacingAfter(16f);
        tablaDatos.setSplitLate(false);

        agregarDato(
                tablaDatos,
                "Número de ticket",
                valorSeguro(queja.getNumeroTicket()),
                fontEtiqueta,
                fontNormal
        );

        String fechaRegistro = queja.getFechaCreacion() != null
                ? queja.getFechaCreacion().format(FORMATO_FECHA)
                : "No disponible";

        agregarDato(
                tablaDatos,
                "Fecha de registro",
                fechaRegistro,
                fontEtiqueta,
                fontNormal
        );

        agregarDato(
                tablaDatos,
                "Cliente",
                valorSeguro(queja.getUsuarioEmail()),
                fontEtiqueta,
                fontNormal
        );

        agregarDato(
                tablaDatos,
                "Motivo de la queja",
                valorSeguro(queja.getTitulo()),
                fontEtiqueta,
                fontNormal
        );

        agregarDato(
                tablaDatos,
                "Descripción de los hechos",
                valorSeguro(queja.getDescripcion()),
                fontEtiqueta,
                fontNormal
        );

        document.add(tablaDatos);

        // =========================================
        // RESOLUCIÓN Y ANÁLISIS
        // =========================================

        agregarTituloSeccion(
                document,
                "2. RESOLUCIÓN Y ANÁLISIS DEL AGENTE",
                fontSeccion
        );

        PdfPTable tablaResolucion = new PdfPTable(1);
        tablaResolucion.setWidthPercentage(100);
        tablaResolucion.setSpacingAfter(18f);

        PdfPCell celdaResolucion = new PdfPCell(
                new Phrase(
                        valorSeguro(resolucion),
                        fontResolucion
                )
        );

        celdaResolucion.setBackgroundColor(GRIS_FONDO);
        celdaResolucion.setBorderColor(GRIS_BORDE);
        celdaResolucion.setBorderWidth(0.8f);
        celdaResolucion.setPadding(12f);
        celdaResolucion.setLeading(0f, 1.5f);
        celdaResolucion.setHorizontalAlignment(
                Element.ALIGN_JUSTIFIED
        );

        tablaResolucion.addCell(celdaResolucion);
        document.add(tablaResolucion);

        // =========================================
        // BLOQUE DE FIRMAS
        // =========================================

        agregarTituloSeccion(
                document,
                "3. VALIDACIÓN Y AUTORIZACIÓN",
                fontSeccion
        );

        Paragraph indicacionFirmas = new Paragraph(
                "Firmas de revisión y autorización de la resolución:",
                fontNormal
        );

        indicacionFirmas.setSpacingAfter(12f);
        document.add(indicacionFirmas);

        /*
         * Las líneas siguientes son únicamente espacios visuales
         * para las firmas. No configuran campos de DocuSign.
         */

        PdfPTable tablaFirmas = new PdfPTable(
                new float[]{1f, 1f, 1f}
        );

        tablaFirmas.setWidthPercentage(100);
        tablaFirmas.setSpacingBefore(8f);
        tablaFirmas.setSpacingAfter(12f);
        tablaFirmas.setSplitLate(false);
        tablaFirmas.setKeepTogether(true);

        // Primera fila: Agente, Supervisor y Jefe
        agregarFirma(
                tablaFirmas,
                "Agente responsable",
                "",
                fontFirma,
                fontNombreFirma
        );

        agregarFirma(
                tablaFirmas,
                "Supervisor",
                "",
                fontFirma,
                fontNombreFirma
        );

        agregarFirma(
                tablaFirmas,
                "Jefe",
                "",
                fontFirma,
                fontNombreFirma
        );

        // Segunda fila: Gerente centrado
        PdfPCell celdaGerente = crearCeldaFirma(
                "Gerente",
                "",
                fontFirma,
                fontNombreFirma
        );

        celdaGerente.setColspan(3);
        tablaFirmas.addCell(celdaGerente);

        document.add(tablaFirmas);

        // =========================================
        // CIERRE DEL DOCUMENTO
        // =========================================

        document.close();

        return baos.toByteArray();

    } catch (Exception e) {
        throw new RuntimeException(
                "Error al generar el PDF de resolución: "
                        + e.getMessage(),
                e
        );
    }
}

// Agrega un título de sección con una línea verde lateral.
private void agregarTituloSeccion(
        Document document,
        String texto,
        Font fuente) throws DocumentException {

    PdfPTable tablaTitulo = new PdfPTable(1);
    tablaTitulo.setWidthPercentage(100);
    tablaTitulo.setSpacingBefore(2f);
    tablaTitulo.setSpacingAfter(9f);

    PdfPCell celda = new PdfPCell(
            new Phrase(texto, fuente)
    );

    celda.setBackgroundColor(GRIS_FONDO);
    celda.setBorder(Rectangle.LEFT);
    celda.setBorderWidthLeft(3f);
    celda.setBorderColorLeft(VERDE_INSTITUCIONAL);
    celda.setPaddingLeft(9f);
    celda.setPaddingTop(8f);
    celda.setPaddingBottom(8f);
    celda.setPaddingRight(6f);

    tablaTitulo.addCell(celda);
    document.add(tablaTitulo);
}

// Agrega una etiqueta y su valor a la tabla de información.
private void agregarDato(
        PdfPTable tabla,
        String etiqueta,
        String valor,
        Font fuenteEtiqueta,
        Font fuenteValor) {

    PdfPCell celdaEtiqueta = new PdfPCell(
            new Phrase(etiqueta, fuenteEtiqueta)
    );

    celdaEtiqueta.setBackgroundColor(GRIS_FONDO);
    celdaEtiqueta.setBorderColor(GRIS_BORDE);
    celdaEtiqueta.setPadding(8f);
    celdaEtiqueta.setVerticalAlignment(
            Element.ALIGN_MIDDLE
    );

    PdfPCell celdaValor = new PdfPCell(
            new Phrase(valor, fuenteValor)
    );

    celdaValor.setBorderColor(GRIS_BORDE);
    celdaValor.setPadding(8f);
    celdaValor.setVerticalAlignment(
            Element.ALIGN_MIDDLE
    );

    tabla.addCell(celdaEtiqueta);
    tabla.addCell(celdaValor);
}

// Agrega una firma a una de las columnas.
private void agregarFirma(
        PdfPTable tabla,
        String cargo,
        String nombre,
        Font fuenteCargo,
        Font fuenteNombre) {

    tabla.addCell(
            crearCeldaFirma(
                    cargo,
                    nombre,
                    fuenteCargo,
                    fuenteNombre
            )
    );
}

// Construye una celda con espacio para firma.
private PdfPCell crearCeldaFirma(
        String cargo,
        String nombre,
        Font fuenteCargo,
        Font fuenteNombre) {

    PdfPCell celda = new PdfPCell();
    celda.setBorder(Rectangle.NO_BORDER);
    celda.setPaddingLeft(5f);
    celda.setPaddingRight(5f);
    celda.setPaddingTop(12f);
    celda.setPaddingBottom(10f);
    celda.setMinimumHeight(95f);
    celda.setHorizontalAlignment(Element.ALIGN_CENTER);
    celda.setVerticalAlignment(Element.ALIGN_BOTTOM);

    Paragraph espacioFirma = new Paragraph(
            " ",
            fuenteNombre
    );

    espacioFirma.setSpacingAfter(30f);
    celda.addElement(espacioFirma);

    // Línea visual para la firma
    Paragraph lineaFirma = new Paragraph(
            "________________________",
            fuenteNombre
    );

    lineaFirma.setAlignment(Element.ALIGN_CENTER);
    lineaFirma.setSpacingAfter(5f);
    celda.addElement(lineaFirma);

    Paragraph textoCargo = new Paragraph(
            cargo,
            fuenteCargo
    );

    textoCargo.setAlignment(Element.ALIGN_CENTER);
    textoCargo.setSpacingAfter(3f);
    celda.addElement(textoCargo);

    if (nombre != null && !nombre.trim().isEmpty()) {
        Paragraph textoNombre = new Paragraph(
                nombre,
                fuenteNombre
        );

        textoNombre.setAlignment(Element.ALIGN_CENTER);
        celda.addElement(textoNombre);
    }

    return celda;
}

// Evita mostrar el texto "null" cuando un dato está vacío.
private String valorSeguro(Object valor) {
    if (valor == null) {
        return "No disponible";
    }

    String texto = valor.toString().trim();

    return texto.isEmpty()
            ? "No disponible"
            : texto;
}

}