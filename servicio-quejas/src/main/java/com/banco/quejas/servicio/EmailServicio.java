package com.banco.quejas.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServicio {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCorreoRegistroQueja(String destinatario, String numeroTicket, String titulo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();

            // Configuración del correo
            mensaje.setFrom("bncnoreplyinfo@gmail.com");
            mensaje.setTo(destinatario);
            mensaje.setSubject("¡Queja Registrada con Éxito! - Ticket: " + numeroTicket);

            mensaje.setText("Estimado cliente,\n\n" +
                    "Le informamos que su queja titulada \"" + titulo
                    + "\" ha sido registrada exitosamente en nuestro sistema.\n\n" +
                    "Su número de ticket asignado es: " + numeroTicket + "\n\n" +
                    "Puede utilizar este número para dar seguimiento al estado de su trámite.\n\n" +
                    "Atentamente,\n" +
                    "Banco Capital Nacional, S.A. (BCN)");

            // Enviar el correo
            mailSender.send(mensaje);
            System.out.println("📧 Correo enviado exitosamente vía Gmail a: " + destinatario);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar el correo con Gmail: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Método para notificar al agente sobre una nueva asignación
    public void enviarCorreoAsignacionAgente(String correoAgente, String numeroTicket, String titulo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();

            mensaje.setFrom("bncnoreplyinfo@gmail.com"); // Debe coincidir con tu username de properties
            mensaje.setTo(correoAgente);
            mensaje.setSubject("Atención: Nueva Queja Asignada - Ticket " + numeroTicket);

            mensaje.setText("Estimado Agente,\n\n" +
                    "El sistema de balanceo de carga le ha asignado una nueva queja para su gestión.\n\n" +
                    "Detalles de la asignación:\n" +
                    "- Número de Ticket: " + numeroTicket + "\n" +
                    "- Título: " + titulo + "\n\n" +
                    "Por favor, ingrese al portal administrativo del Banco Capital Nacional para verificar los documentos adjuntos y darle solucion al ticket.\n\n"
                    +
                    "Atentamente,\n" +
                    "Sistema Automático de Quejas - BCN");

            mailSender.send(mensaje);
            System.out.println("📧 Correo de asignación enviado exitosamente al agente: " + correoAgente);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar el correo al agente: " + e.getMessage());
            e.printStackTrace();
        }
    }

}