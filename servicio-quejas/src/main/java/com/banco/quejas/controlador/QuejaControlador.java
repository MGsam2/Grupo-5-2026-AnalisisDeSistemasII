package com.banco.quejas.controlador;

import com.banco.quejas.modelo.Queja;
import com.banco.quejas.servicio.QuejaServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quejas")
public class QuejaControlador {

    @Autowired
    private QuejaServicio quejaServicio;

    // Endpoint para crear una nueva queja
    @PostMapping
    public ResponseEntity crearQueja(
            @RequestBody Queja queja,
            @RequestHeader(value = "X-User-Email") String usuarioEmail) {
        
        Queja nuevaQueja = quejaServicio.crearQueja(queja, usuarioEmail);
        return ResponseEntity.ok(nuevaQueja);
    }

    // Endpoint para listar las quejas
    @GetMapping
    public ResponseEntity<List<Queja>> listarQuejas(
            @RequestHeader(value = "X-User-Email") String usuarioEmail) {
        
        List<Queja> quejas = quejaServicio.obtenerQuejasPorUsuario(usuarioEmail);
        return ResponseEntity.ok(quejas);
    }
}