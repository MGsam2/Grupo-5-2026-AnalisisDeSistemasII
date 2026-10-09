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

    @Column(name = "estado_anterior")
    private String estadoAnterior;

    @Column(name = "estado_nuevo")
    private String estadoNuevo;

    @Column(name = "descripcion_evento", columnDefinition = "TEXT")
    private String descripcionEvento;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "direccion_ip", length = 45) // 45 es suficiente para IPv6
    private String direccionIp;


    public BitacoraQueja() {}

    public BitacoraQueja(String usuarioEmail, Long quejaId, String estadoAnterior, String estadoNuevo, String descripcionEvento, LocalDateTime fechaHora, String direccionIp) {
        this.usuarioEmail = usuarioEmail;
        this.quejaId = quejaId;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.descripcionEvento = descripcionEvento;
        this.fechaHora = fechaHora;
        this.direccionIp = direccionIp;
    }

public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }
    public Long getQuejaId() { return quejaId; }
    public void setQuejaId(Long quejaId) { this.quejaId = quejaId; }
    public String getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(String estadoAnterior) { this.estadoAnterior = estadoAnterior; }
    public String getEstadoNuevo() { return estadoNuevo; }
    public void setEstadoNuevo(String estadoNuevo) { this.estadoNuevo = estadoNuevo; }
    public String getDescripcionEvento() { return descripcionEvento; }
    public void setDescripcionEvento(String descripcionEvento) { this.descripcionEvento = descripcionEvento; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getDireccionIp() { return direccionIp; }
    public void setDireccionIp(String direccionIp) { this.direccionIp = direccionIp; }
}