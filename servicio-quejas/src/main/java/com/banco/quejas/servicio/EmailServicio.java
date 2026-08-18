package com.banco.quejas.servicio;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailServicio {

    // Extraemos el token del application.properties de forma segura
    @Value("${mailtrap.api.token}")
    private String mailtrapToken;

    public void enviarCorreoRegistroQueja(String destinatario, String numeroTicket, String titulo) {
        try {
            // 1. Inicializar la configuración de Mailtrap con el Token
            MailtrapConfig config = new MailtrapConfig.Builder()
                    .token(mailtrapToken)
                    .build();

            MailtrapClient client = MailtrapClientFactory.createMailtrapClient(config);

            // 2. Construir el correo con los datos reales de la queja
            MailtrapMail mail = MailtrapMail.builder()
                    .from(new Address("hello@demomailtrap.co", "Banco Capital Nacional"))
                    .to(List.of(new Address(destinatario)))
                    .subject("¡Queja Registrada con Éxito! - Ticket: " + numeroTicket)
                    .text("Estimado cliente,\n\n" +
                          "Le informamos que su queja titulada \"" + titulo + "\" ha sido registrada exitosamente en nuestro sistema.\n\n" +
                          "Su número de ticket asignado es: " + numeroTicket + "\n\n" +
                          "Puede utilizar este número para dar seguimiento al estado de su trámite.\n\n" +
                          "Atentamente,\n" +
                          "Banco Capital Nacional, S.A. (BCN)")
                    .category("Notificacion Quejas")
                    .build();

            // 3. Enviar el correo a través de la API
            client.send(mail);
            System.out.println("📧 Correo de Mailtrap enviado exitosamente a: " + destinatario);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar el correo con la API de Mailtrap: " + e.getMessage());
            e.printStackTrace();
        }
    }
}