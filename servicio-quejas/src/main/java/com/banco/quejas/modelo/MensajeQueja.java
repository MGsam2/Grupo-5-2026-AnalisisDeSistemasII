package com.banco.quejas.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes_queja")
public class MensajeQueja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "queja_id", nullable = false)
    private Queja queja;

    @Column(name = "remitente_email")
    private String remitenteEmail;

    @Column(name = "rol_remitente") // Para saber si fue "CLIENTE" o "AGENTE"
    private String rolRemitente;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    // Getters, Setters y Constructores (Vacío y completo)
    public MensajeQueja() {
    }

    public MensajeQueja(Queja queja, String remitenteEmail, String rolRemitente, String mensaje,
            LocalDateTime fechaHora) {
        this.queja = queja;
        this.remitenteEmail = remitenteEmail;
        this.rolRemitente = rolRemitente;
        this.mensaje = mensaje;
        this.fechaHora = fechaHora;
    }

    // (Getters y Setters de todos los campos)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Queja getQueja() {
        return queja;
    }

    public void setQueja(Queja queja) {
        this.queja = queja;
    }

    public String getRemitenteEmail() {
        return remitenteEmail;
    }

    public void setRemitenteEmail(String remitenteEmail) {
        this.remitenteEmail = remitenteEmail;
    }

    public String getRolRemitente() {
        return rolRemitente;
    }

    public void setRolRemitente(String rolRemitente) {
        this.rolRemitente = rolRemitente;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}