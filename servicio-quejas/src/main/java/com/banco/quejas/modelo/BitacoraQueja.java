package com.banco.quejas.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bitacora_quejas")
public class BitacoraQueja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_email")
    private String usuarioEmail;

    @Column(name = "queja_id")
    private Long quejaId;

    @Column(name = "estado_queja")
    private String estadoQueja;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    // Constructor vacío (Requerido por Hibernate)
    public BitacoraQueja() {}

    // Constructor para llenado rápido
    public BitacoraQueja(String usuarioEmail, Long quejaId, String estadoQueja, LocalDateTime fechaHora) {
        this.usuarioEmail = usuarioEmail;
        this.quejaId = quejaId;
        this.estadoQueja = estadoQueja;
        this.fechaHora = fechaHora;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }
    public Long getQuejaId() { return quejaId; }
    public void setQuejaId(Long quejaId) { this.quejaId = quejaId; }
    public String getEstadoQueja() { return estadoQueja; }
    public void setEstadoQueja(String estadoQueja) { this.estadoQueja = estadoQueja; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}