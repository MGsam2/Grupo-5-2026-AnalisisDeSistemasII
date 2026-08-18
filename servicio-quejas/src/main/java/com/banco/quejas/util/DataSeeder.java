package com.banco.quejas.util;

import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.Producto;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.ProductoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EstadoQuejaRepositorio estadoQuejaRepositorio;

    @Autowired
    private ProductoRepositorio productoRepositorio;

    @Override
    public void run(String... args) throws Exception {
        
        // RN04: Carga inicial de Estados de la Queja
        if (estadoQuejaRepositorio.count() == 0) {
            estadoQuejaRepositorio.save(new EstadoQueja("Registrada", "Queja ingresada correctamente por el Usuario Final"));
            estadoQuejaRepositorio.save(new EstadoQueja("PendienteDeAsignacion", "La queja no esta asignada a un Agente."));
            estadoQuejaRepositorio.save(new EstadoQueja("EnValidacion", "Queja asignada a un Agente Bancario para revisión inicial"));
            estadoQuejaRepositorio.save(new EstadoQueja("EsperandoDocumentacion", "Queja que requiere información o documentación adicional del Usuario Final"));
            estadoQuejaRepositorio.save(new EstadoQueja("EnRevisionSupervisor", "Queja validada y firmada por el Agente Bancario, pendiente de revisión del Supervisor"));
            estadoQuejaRepositorio.save(new EstadoQueja("EnRevisionJefe", "Queja validada y firmada por el Supervisor Bancario, pendiente de revisión del Jefe"));
            estadoQuejaRepositorio.save(new EstadoQueja("EnDictamen", "Queja validada por el Jefe y trasladada al Gerente, para la resolución final."));
            estadoQuejaRepositorio.save(new EstadoQueja("Aprobada", "Queja aprobada por el Gerente"));
            estadoQuejaRepositorio.save(new EstadoQueja("Denegada", "Queja denegada por el Gerente"));
            estadoQuejaRepositorio.save(new EstadoQueja("DevueltaParaRevision", "Queja fue devuelta a una etapa anterior, por un aprobador(RN01)"));
            estadoQuejaRepositorio.save(new EstadoQueja("Archivada", "Queja cuyo resultado final ya fue notificado al Usuario y se ha completado su gestión en el sistema"));
            
            System.out.println("✅ Catálogo de Estados (RN04) cargado exitosamente.");
        }

        // RN05: Carga inicial de Tipos de Producto
        if (productoRepositorio.count() == 0) {
            productoRepositorio.save(new Producto("Cuentas de ahorro"));
            productoRepositorio.save(new Producto("Tarjeta de crédito y debito"));
            productoRepositorio.save(new Producto("Cuentas monetarias"));
            productoRepositorio.save(new Producto("Prestamos"));
            productoRepositorio.save(new Producto("Cheques"));
            
            System.out.println("✅ Catálogo de Productos (RN05) cargado exitosamente.");
        }
    }
}