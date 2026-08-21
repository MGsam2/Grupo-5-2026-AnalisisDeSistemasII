package com.banco.quejas.servicio;

import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.Queja;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.QuejaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class AsignadorProgramado {

    @Autowired
    private QuejaRepositorio quejaRepositorio;

    @Autowired
    private EstadoQuejaRepositorio estadoQuejaRepositorio;

    @Autowired
    private EmailServicio emailServicio;

    // Se ejecuta automáticamente cada 5 minutos (300,000 milisegundos)
    @Scheduled(fixedRate = 15000)
    @Transactional
    public void procesarQuejasEstancadas() {
        List <Queja> quejasPendientes = quejaRepositorio.encontrarQuejasPendientes();

        if (quejasPendientes.isEmpty()) {
            // Si no hay quejas estancadas, el proceso termina en silencio
            return;
        }

        System.out.println("🔄 Cron Job iniciado: Se encontraron " + quejasPendientes.size() + " quejas estancadas.");

        EstadoQueja estadoEnValidacion = estadoQuejaRepositorio.findByNombre("EnValidacion");

        for (Queja queja : quejasPendientes) {
            // Volvemos a consultar al balanceador por si un agente ya se activó
            String agenteIdeal = quejaRepositorio.encontrarAgenteConMenorCarga();

            if (agenteIdeal != null) {
                queja.setAgenteAsignadoEmail(agenteIdeal);
                if (estadoEnValidacion != null) {
                    queja.setEstado(estadoEnValidacion);
                }
                quejaRepositorio.save(queja);

                // Notificamos al agente que le cayó una queja atrasada
                emailServicio.enviarCorreoAsignacionAgente(
                        agenteIdeal, 
                        queja.getNumeroTicket(), 
                        queja.getTitulo()
                );

                System.out.println("✅ [Cron Job] Queja " + queja.getNumeroTicket() + " rescatada y asignada a: " + agenteIdeal);
            } else {
                System.out.println("⚠️ [Cron Job] Aún no hay agentes activos. La queja " + queja.getNumeroTicket() + " sigue en espera.");
                // Rompemos el ciclo porque si no hay agentes para una, no hay para ninguna
                break; 
            }
        }
    }
}