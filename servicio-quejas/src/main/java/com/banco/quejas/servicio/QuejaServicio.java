package com.banco.quejas.servicio;

import com.banco.quejas.modelo.Queja;
import com.banco.quejas.repositorio.QuejaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuejaServicio {

    @Autowired
    private QuejaRepositorio quejaRepositorio;

    public Queja crearQueja(Queja queja, String usuarioEmail) {
    queja.setUsuarioEmail(usuarioEmail);
    return quejaRepositorio.save(queja);
}

    public List obtenerQuejasPorUsuario(String usuarioEmail) {
        return quejaRepositorio.findByUsuarioEmail(usuarioEmail);
    }
    
    public List obtenerTodasLasQuejas() {
        return quejaRepositorio.findAll();
    }
}