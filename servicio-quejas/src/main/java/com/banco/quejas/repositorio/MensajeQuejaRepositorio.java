package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.MensajeQueja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeQuejaRepositorio extends JpaRepository<MensajeQueja, Long> {

    List<MensajeQueja> findByQuejaIdOrderByFechaHoraAsc(Long quejaId);
}
