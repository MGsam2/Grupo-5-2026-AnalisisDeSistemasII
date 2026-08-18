package com.banco.quejas.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queja_id", nullable = false)
    private Queja queja;

    @Column(nullable = false)
    private String nombreOriginal;

    @Column(nullable = false)
    private String tipoArchivo;

    @Column(nullable = false)
    private Long tamano;

    @Column(nullable = false)
    private String rutaFisica;

    @Column(nullable = false)
    private String usuarioCarga;

    @Column(updatable = false)
    private LocalDateTime fechaCarga;

    @PrePersist
    protected void onCreate() {
        this.fechaCarga = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Queja getQueja() { return queja; }
    public void setQueja(Queja queja) { this.queja = queja; }

    public String getNombreOriginal() { return nombreOriginal; }
    public void setNombreOriginal(String nombreOriginal) { this.nombreOriginal = nombreOriginal; }

    public String getTipoArchivo() { return tipoArchivo; }
    public void setTipoArchivo(String tipoArchivo) { this.tipoArchivo = tipoArchivo; }

    public Long getTamano() { return tamano; }
    public void setTamano(Long tamano) { this.tamano = tamano; }

    public String getRutaFisica() { return rutaFisica; }
    public void setRutaFisica(String rutaFisica) { this.rutaFisica = rutaFisica; }

    public String getUsuarioCarga() { return usuarioCarga; }
    public void setUsuarioCarga(String usuarioCarga) { this.usuarioCarga = usuarioCarga; }

    public LocalDateTime getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(LocalDateTime fechaCarga) { this.fechaCarga = fechaCarga; }
}