package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.Queja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuejaRepositorio extends JpaRepository<Queja, Long> {

    // Para listar todas las quejas de un cliente en su dashboard
    List<Queja> findByUsuarioEmail(String usuarioEmail);

    // Buscar todas las quejas que le pertenecen a un agente específico
    List<Queja> findByAgenteAsignadoEmail(String agenteAsignadoEmail);

    // NUEVO: Para buscar una queja exacta por su código de ticket (ej. QJ-1234)
    Queja findByNumeroTicket(String numeroTicket);

    @Query(value = "SELECT u.email " +
            "FROM usuarios u " +
            "INNER JOIN usuario_roles ur ON u.id = ur.usuario_id " +
            "INNER JOIN roles r ON ur.rol_id = r.id " +
            "LEFT JOIN quejas q ON u.email = q.agente_asignado_email " +
            "    AND q.estado_id = (SELECT id FROM catalogo_estados WHERE nombre = 'EnValidacion') " +
            "WHERE r.nombre = 'ROLE_AGENTE_BANCARIO' AND u.activo = true " +
            "GROUP BY u.email " +
            "ORDER BY COUNT(q.id) ASC " +
            "LIMIT 1", nativeQuery = true)
    String encontrarAgenteConMenorCarga();

    // Busca todas las quejas cuyo estado sea "PendienteDeAsignacion"
    @Query("SELECT q FROM Queja q WHERE q.estado.nombre = 'PendienteDeAsignacion'")
    java.util.List<Queja> encontrarQuejasPendientes();


}