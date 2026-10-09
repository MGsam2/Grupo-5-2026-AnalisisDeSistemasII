package com.banco.quejas.servicio;

import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.Queja;
import com.banco.quejas.modelo.BitacoraQueja;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.QuejaRepositorio;
import com.banco.quejas.repositorio.BitacoraQuejaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AsignadorProgramado {

    @Autowired
    private QuejaRepositorio quejaRepositorio;

    @Autowired
    private EstadoQuejaRepositorio estadoQuejaRepositorio;

    @Autowired
    private EmailServicio emailServicio;

    // 1. Inyectamos el repositorio de la bitácora
    @Autowired
    private BitacoraQuejaRepositorio bitacoraQuejaRepositorio;

    @Scheduled(fixedRate = 15000)
    @Transactional
    public void procesarQuejasEstancadas() {
        List<Queja> quejasPendientes = quejaRepositorio.encontrarQuejasPendientes();

        if (quejasPendientes.isEmpty()) {
            String agenteIdeal = quejaRepositorio.encontrarAgenteConMenorCarga();

            if (agenteIdeal == null) {
                System.out.println("[Cron Job] no hay agentes activos ahora.");
            } else {

                System.out.println("[Cron Job] El agente con menor carga es: " + agenteIdeal
                        + " se le asignaran las quejas");

            }

            return;
        }

        System.out.println(
                "Cron Job iniciado: Se encontraron " + quejasPendientes.size() + " quejas Pendientes de Asignacion.");

        EstadoQueja estadoEnValidacion = estadoQuejaRepositorio.findByNombre("EnValidacion");

        for (Queja queja : quejasPendientes) {
            String agenteIdeal = quejaRepositorio.encontrarAgenteConMenorCarga();

            if (agenteIdeal != null) {

                System.out.println(
                        "Cron Job iniciado: El agente con menor carga es " + agenteIdeal
                                + " se le asignaran las quejas");

                String estadoAnterior = queja.getEstado().getNombre();

                queja.setAgenteAsignadoEmail(agenteIdeal);
                if (estadoEnValidacion != null) {
                    queja.setEstado(estadoEnValidacion);
                }
                quejaRepositorio.save(queja);

                try {
                    BitacoraQueja registroBitacora = new BitacoraQueja(
                            queja.getUsuarioEmail(),
                            queja.getId(),
                            estadoAnterior,
                            queja.getEstado().getNombre(),
                            "Rescate por Cron Job: Asignación en segundo plano al agente " + agenteIdeal,
                            LocalDateTime.now(),
                            "127.0.0.1");
                    bitacoraQuejaRepositorio.save(registroBitacora);
                    System.out.println("Bitácora actualizada (Cron Job): Queja " + queja.getId() + " registrada.");
                } catch (Exception e) {
                    System.err.println("Error al guardar en la bitácora desde el Cron Job: " + e.getMessage());
                }

                emailServicio.enviarCorreoAsignacionAgente(
                        agenteIdeal,
                        queja.getNumeroTicket(),
                        queja.getTitulo());

                System.out.println("[Cron Job] Queja " + queja.getNumeroTicket() + " asignada a: " + agenteIdeal);
            } else {
                System.out.println("[Cron Job] Aún no hay agentes activos. Las " + quejasPendientes.size()
                        + " Quejas sigue en espera.");

                break;
            }
        }
    }
}