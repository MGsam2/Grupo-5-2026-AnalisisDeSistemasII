package com.banco.quejas.servicio;

import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.Queja;
import com.banco.quejas.repositorio.BitacoraQuejaRepositorio;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.QuejaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuejaServicio {

    @Autowired
    private QuejaRepositorio quejaRepositorio;

    // Inyectamos el catálogo de estados para poder actualizar el estado de la queja
    @Autowired
    private EstadoQuejaRepositorio estadoQuejaRepositorio;

    @Autowired
    private BitacoraQuejaRepositorio bitacoraQuejaRepositorio;

    public Queja crearQueja(Queja queja, String usuarioEmail) {
        queja.setUsuarioEmail(usuarioEmail);

        // 1. Consultar a la base de datos por el agente activo con menor carga de
        // trabajo
        String agenteIdeal = quejaRepositorio.encontrarAgenteConMenorCarga();

        if (agenteIdeal != null) {
            // Si existe un agente disponible, se le asigna su correo
            queja.setAgenteAsignadoEmail(agenteIdeal);

            // Actualizamos el estado a "EnValidacion" indicando que ya tiene un agente
            // asignado
            EstadoQueja estadoEnValidacion = estadoQuejaRepositorio.findByNombre("EnValidacion");
            if (estadoEnValidacion != null) {
                queja.setEstado(estadoEnValidacion);
            }

            System.out.println("✅ Asignación exitosa. Queja asignada al agente: " + agenteIdeal);
        } else {
            // Si la consulta devuelve null (ej. todos inactivos o no hay agentes
            // registrados),
            // la queja queda en cola de espera.
            EstadoQueja estadoPendiente = estadoQuejaRepositorio.findByNombre("PendienteDeAsignacion");
            if (estadoPendiente != null) {
                queja.setEstado(estadoPendiente);
            }

            System.out.println("⚠️ No hay agentes activos. La queja quedó en PendienteDeAsignacion.");
        }

        // 2. Guardar la queja en la base de datos para generar su ID
        Queja quejaGuardada = quejaRepositorio.save(queja);

        // 3. Cumplimiento CU02: Registrar en la Bitácora de Quejas
        try {
            com.banco.quejas.modelo.BitacoraQueja registroBitacora = new com.banco.quejas.modelo.BitacoraQueja(
                    usuarioEmail,
                    quejaGuardada.getId(),
                    quejaGuardada.getEstado().getNombre(),
                    java.time.LocalDateTime.now());
            bitacoraQuejaRepositorio.save(registroBitacora);
            System.out.println("📝 Bitácora actualizada: Queja " + quejaGuardada.getId() + " registrada con estado "
                    + quejaGuardada.getEstado().getNombre());
        } catch (Exception e) {
            System.err.println("⚠️ Error al guardar en la bitácora de quejas: " + e.getMessage());
        }

        // 4. Retornar la queja ya guardada con todos sus datos
        return quejaGuardada;
    }

    public List obtenerQuejasPorUsuario(String usuarioEmail) {
        return quejaRepositorio.findByUsuarioEmail(usuarioEmail);
    }

    public List obtenerTodasLasQuejas() {
        return quejaRepositorio.findAll();
    }

    public Queja obtenerQuejaPorTicket(String numeroTicket) {
        return quejaRepositorio.findByNumeroTicket(numeroTicket);
    }
}