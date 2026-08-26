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
        List < Queja > quejasPendientes = quejaRepositorio.encontrarQuejasPendientes();

        if (quejasPendientes.isEmpty()) {
            return;
        }

        System.out.println("Cron Job iniciado: Se encontraron " + quejasPendientes.size() + " quejas estancadas.");

        EstadoQueja estadoEnValidacion = estadoQuejaRepositorio.findByNombre("EnValidacion");

        for (Queja queja : quejasPendientes) {
            String agenteIdeal = quejaRepositorio.encontrarAgenteConMenorCarga();

            if (agenteIdeal != null) {
                
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
                            LocalDateTime.now()
                    );
                    bitacoraQuejaRepositorio.save(registroBitacora);
                    System.out.println("Bitácora actualizada (Cron Job): Queja " + queja.getId() + " registrada.");
                } catch (Exception e) {
                    System.err.println("Error al guardar en la bitácora desde el Cron Job: " + e.getMessage());
                }

           
                emailServicio.enviarCorreoAsignacionAgente(
                        agenteIdeal, 
                        queja.getNumeroTicket(), 
                        queja.getTitulo()
                );

                System.out.println("[Cron Job] Queja " + queja.getNumeroTicket() + " rescatada y asignada a: " + agenteIdeal);
            } else {
                System.out.println("[Cron Job] Aún no hay agentes activos. La queja " + queja.getNumeroTicket() + " sigue en espera.");
                break; 
            }
        }
    }
}