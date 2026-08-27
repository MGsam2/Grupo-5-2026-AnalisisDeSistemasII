package com.banco.quejas.controlador;

import com.banco.quejas.modelo.Documento;
import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.MensajeQueja;
import com.banco.quejas.repositorio.QuejaRepositorio;
import com.banco.quejas.modelo.Producto;
import com.banco.quejas.modelo.Queja;
import com.banco.quejas.repositorio.DocumentoRepositorio;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.ProductoRepositorio;
import com.banco.quejas.repositorio.BitacoraQuejaRepositorio;
import com.banco.quejas.repositorio.MensajeQuejaRepositorio;
import com.banco.quejas.servicio.QuejaServicio;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.banco.quejas.servicio.EmailServicio;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quejas")
public class QuejaControlador {

    @Autowired
    private QuejaServicio quejaServicio;

    @Autowired
    private DocumentoRepositorio documentoRepositorio;

    @Autowired
    private ProductoRepositorio productoRepositorio;

    @Autowired
    private EstadoQuejaRepositorio estadoQuejaRepositorio;

    @Autowired
    private EmailServicio emailServicio;

    @Autowired
    private QuejaRepositorio quejaRepositorio;

    @Autowired
    private BitacoraQuejaRepositorio bitacoraQuejaRepositorio;

    @Autowired
    private MensajeQuejaRepositorio mensajeQuejaRepositorio;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity crearQueja(
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("productoId") Long productoId,
            @RequestParam(value = "usuarioNombre", defaultValue = "") String usuarioNombre,
            @RequestParam(value = "usuarioApellido", defaultValue = "") String usuarioApellido,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String emailUsuario = extraerEmailDelToken(authHeader);

            // RN07: Validaciones de archivo (PDF/JPEG y máximo 2MB)[cite: 2]
            if (archivo != null && !archivo.isEmpty()) {
                String tipo = archivo.getContentType();
                if (tipo == null || (!tipo.equals("application/pdf") && !tipo.equals("image/jpeg"))) {
                    return ResponseEntity.badRequest().body("Error: El documento debe ser en formato PDF o JPEG.");
                }
                if (archivo.getSize() > 2097152) { // 2MB en bytes
                    return ResponseEntity.badRequest()
                            .body("Error: El documento no debe superar el tamaño máximo de 2 MB.");
                }
            }

            // RN05: Validar y asignar el producto[cite: 2]
            Producto producto = productoRepositorio.findById(productoId)
                    .orElseThrow(() -> new Exception("El producto seleccionado no es válido."));

            // RN04: El estado inicial obligatorio es "Registrada"[cite: 2]
            EstadoQueja estadoInicial = estadoQuejaRepositorio.findByNombre("Registrada");
            if (estadoInicial == null) {
                throw new Exception("Error interno: Catálogo de estados no inicializado.");
            }

            Queja nuevaQueja = new Queja();
            nuevaQueja.setTitulo(titulo);
            nuevaQueja.setDescripcion(descripcion);
            nuevaQueja.setProducto(producto);
            nuevaQueja.setEstado(estadoInicial);
            nuevaQueja.setUsuarioNombre(usuarioNombre);
            nuevaQueja.setUsuarioApellido(usuarioApellido);

            Queja quejaGuardada = quejaServicio.crearQueja(nuevaQueja, emailUsuario);

            // RN07: Guardar el documento físico y sus metadatos[cite: 2]
            if (archivo != null && !archivo.isEmpty()) {
                File directorio = new File(UPLOAD_DIR);
                if (!directorio.exists())
                    directorio.mkdirs();

                String nombreOriginal = archivo.getOriginalFilename();
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String nombreUnico = UUID.randomUUID().toString() + extension;

                Path rutaCompleta = Paths.get(UPLOAD_DIR + nombreUnico);
                Files.copy(archivo.getInputStream(), rutaCompleta);

                // Conservar metadatos en la base de datos[cite: 2]
                Documento doc = new Documento();
                doc.setQueja(quejaGuardada);
                doc.setNombreOriginal(nombreOriginal);
                doc.setTipoArchivo(archivo.getContentType());
                doc.setTamano(archivo.getSize());
                doc.setRutaFisica(rutaCompleta.toString());
                doc.setUsuarioCarga(emailUsuario);

                documentoRepositorio.save(doc);
            }

            // NUEVO: Enviar correos electrónicos de notificación
            try {
                // 1. Notificar al cliente (Usuario Final)
                emailServicio.enviarCorreoRegistroQueja(
                        emailUsuario,
                        quejaGuardada.getNumeroTicket(),
                        quejaGuardada.getTitulo());

                // 2. Notificar al Agente Bancario (Si el balanceador asignó uno)
                if (quejaGuardada.getAgenteAsignadoEmail() != null) {
                    emailServicio.enviarCorreoAsignacionAgente(
                            quejaGuardada.getAgenteAsignadoEmail(),
                            quejaGuardada.getNumeroTicket(),
                            quejaGuardada.getTitulo());
                }

            } catch (Exception correoEx) {
                System.err.println("Advertencia: No se pudieron enviar los correos, pero la queja fue guardada: "
                        + correoEx.getMessage());
            }

            return ResponseEntity.ok(quejaGuardada);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al registrar la queja: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity listarQuejas(@RequestHeader("Authorization") String authHeader) {
        try {
            String emailUsuario = extraerEmailDelToken(authHeader);
            List quejas = quejaServicio.obtenerQuejasPorUsuario(emailUsuario);
            return ResponseEntity.ok(quejas);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener las quejas");
        }
    }

    // Endpoint para ver el detalle de una queja específica y sus documentos
    @GetMapping("/{numeroTicket}")
    public ResponseEntity<?> obtenerDetalleQueja(
            @PathVariable String numeroTicket,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String emailUsuario = extraerEmailDelToken(authHeader);

            Queja queja = quejaServicio.obtenerQuejaPorTicket(numeroTicket);

            // 1. Validar que la queja exista
            if (queja == null) {
                return ResponseEntity.status(404).body("La queja no existe.");
            }

            // 2. REGLA DE NEGOCIO: ¿Es el creador de la queja o el agente asignado?
            boolean esElCreador = queja.getUsuarioEmail().equals(emailUsuario);
            boolean esElAgenteAsignado = queja.getAgenteAsignadoEmail() != null &&
                    queja.getAgenteAsignadoEmail().equals(emailUsuario);

            // Si no es ninguno de los dos, se bloquea el acceso
            if (!esElCreador && !esElAgenteAsignado) {
                return ResponseEntity.status(403).body("Acceso denegado o la queja no existe.");
            }

            // Buscar los documentos asociados a esta queja
            List<Documento> documentos = documentoRepositorio.findByQuejaId(queja.getId());

            // Empaquetar la queja y los documentos juntos
            java.util.Map<String, Object> respuesta = new java.util.HashMap<>();
            respuesta.put("queja", queja);
            respuesta.put("documentos", documentos);

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener el detalle de la queja");
        }
    }

    // 4. Endpoint para visualizar o descargar un documento físico
    @GetMapping("/documento/{documentoId}")
    public ResponseEntity verDocumento(
            @PathVariable("documentoId") Long documentoId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String emailUsuario = extraerEmailDelToken(authHeader);

            // 1. Buscar el documento en la base de datos
            Documento documento = documentoRepositorio.findById(documentoId)
                    .orElseThrow(() -> new Exception("Documento no encontrado"));

            boolean esElCreador = documento.getQueja().getUsuarioEmail().equals(emailUsuario);
            boolean esElAgenteAsignado = documento.getQueja().getAgenteAsignadoEmail() != null &&
                    documento.getQueja().getAgenteAsignadoEmail().equals(emailUsuario);

            // Si no es ninguno de los dos, bloqueamos el acceso
            if (!esElCreador && !esElAgenteAsignado) {
                return ResponseEntity.status(403).build(); // Acceso denegado
            }

            // 3. Cargar el archivo físico desde el disco duro
            Path rutaArchivo = Paths.get(documento.getRutaFisica());
            Resource recurso = new UrlResource(rutaArchivo.toUri());

            if (!recurso.exists() || !recurso.isReadable()) {
                throw new Exception("No se puede leer el archivo físico o no existe.");
            }

            // 4. Determinar el Content-Type dinámicamente (PDF o JPEG)
            MediaType mediaType = MediaType.parseMediaType(documento.getTipoArchivo());

            // 5. Enviar el archivo. "inline" le dice al navegador que intente mostrarlo (no
            // descargarlo a la fuerza)
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + documento.getNombreOriginal() + "\"")
                    .body(recurso);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 5. Endpoint para la Bandeja del Agente Bancario
    @GetMapping("/mis-asignadas")
    public ResponseEntity<List<Queja>> obtenerQuejasAsignadasAlAgente(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extraemos el correo del agente usando el método que ya tienes programado
            String emailAgente = extraerEmailDelToken(authHeader);

            // Buscamos solo las quejas que tienen su correo
            List<Queja> quejasDelAgente = quejaRepositorio.findByAgenteAsignadoEmail(emailAgente);

            return ResponseEntity.ok(quejasDelAgente);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private String extraerEmailDelToken(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String[] chunks = token.split("\\.");
        Base64.Decoder decoder = Base64.getUrlDecoder();
        String payload = new String(decoder.decode(chunks[1]));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode payloadJson = mapper.readTree(payload);
        return payloadJson.get("sub").asText();
    }

    // ==========================================
    // CU04: BOTÓN "CONFIRMAR Y ENVIAR AL SUPERVISOR"
    // ==========================================
    @PutMapping("/{numeroTicket}/enviar-supervisor")
    public ResponseEntity<?> enviarASupervisor(
            @PathVariable String numeroTicket,
            @RequestBody java.util.Map<String, String> payload,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String emailAgente = extraerEmailDelToken(authHeader);
            String resolucion = payload.get("resolucion");

            // FA08: Validar campo vacío
            if (resolucion == null || resolucion.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Completa este campo.");
            }

            Queja queja = quejaServicio.obtenerQuejaPorTicket(numeroTicket);
            if (queja == null)
                return ResponseEntity.notFound().build();

            String estadoAnterior = queja.getEstado().getNombre();

            // Buscar nuevo estado (Asegúrate de que el nombre coincida exactamente con
            // tu BD)
            EstadoQueja estadoNuevo = estadoQuejaRepositorio.findByNombre("EnRevisionSupervisor");
            if (estadoNuevo == null)
                throw new Exception("El estado no existe en el catálogo.");

            queja.setEstado(estadoNuevo);
            queja.setResolucionAgente(resolucion);
            quejaRepositorio.save(queja); // Guardamos los cambios

            // Guardar en la bitácora
            com.banco.quejas.modelo.BitacoraQueja bitacora = new com.banco.quejas.modelo.BitacoraQueja(
                    emailAgente, queja.getId(), estadoAnterior, estadoNuevo.getNombre(),
                    "Traslado a Supervisor. Resolución redactada: " + resolucion, java.time.LocalDateTime.now());
            bitacoraQuejaRepositorio.save(bitacora);

            // ---> LO NUEVO: Mensaje automático para el cliente <---
            MensajeQueja mensajeAvance = new MensajeQueja(
                    queja,
                    emailAgente,
                    "AGENTE", // Usamos AGENTE para que el frontend lo pinte con el mismo estilo
                    "Se valida la información y está correcta, la queja avanza a la siguiente fase.",
                    java.time.LocalDateTime.now());
            mensajeQuejaRepositorio.save(mensajeAvance);
            // ---------------------------------------------------------

            return ResponseEntity
                    .ok(java.util.Map.of("mensaje", "La resolución ha sido enviada al Supervisor Correctamente"));

        } catch (Exception e) {
            // FA06: Error al trasladar la queja
            return ResponseEntity.status(500).body("Error al trasladar la queja: " + e.getMessage());
        }
    }

    // ==========================================
    // CU04: BOTÓN "SOLICITAR INFORMACIÓN ADICIONAL" (FA03)
    // ==========================================
    @PutMapping("/{numeroTicket}/solicitar-info")
    public ResponseEntity<?> solicitarInformacion(
            @PathVariable String numeroTicket,
            @RequestBody java.util.Map<String, String> payload,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String emailAgente = extraerEmailDelToken(authHeader);
            String justificacion = payload.get("justificacion");

            // FA08: Validar campo vacío
            if (justificacion == null || justificacion.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Completa este campo.");
            }

            Queja queja = quejaServicio.obtenerQuejaPorTicket(numeroTicket);
            if (queja == null)
                return ResponseEntity.notFound().build();

            String estadoAnterior = queja.getEstado().getNombre();

            // Buscar nuevo estado (⚠️ Asegúrate de que el nombre coincida exactamente con
            // tu BD)
            EstadoQueja estadoNuevo = estadoQuejaRepositorio.findByNombre("EsperandoDocumentacion");
            if (estadoNuevo == null)
                throw new Exception("El estado no existe en el catálogo.");

            queja.setEstado(estadoNuevo);
            queja.setResolucionAgente("Info solicitada: " + justificacion);
            quejaRepositorio.save(queja);

            // Guardamos la petición del agente como el primer mensaje del historial
            MensajeQueja mensajeAgente = new MensajeQueja(
                    queja, emailAgente, "AGENTE", justificacion, java.time.LocalDateTime.now());
            mensajeQuejaRepositorio.save(mensajeAgente);

            // Guardar en la bitácora
            com.banco.quejas.modelo.BitacoraQueja bitacora = new com.banco.quejas.modelo.BitacoraQueja(
                    emailAgente, queja.getId(), estadoAnterior, estadoNuevo.getNombre(),
                    "Solicitud de información adicional. Motivo: " + justificacion, java.time.LocalDateTime.now());
            bitacoraQuejaRepositorio.save(bitacora);

            // Notificar al cliente
            emailServicio.enviarCorreoSolicitudInformacion(queja.getUsuarioEmail(), queja.getNumeroTicket(),
                    justificacion);

            return ResponseEntity.ok(java.util.Map.of("mensaje",
                    "La solicitud de información adicional ha sido enviada correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    // ==========================================
    // NUEVO: RESPUESTA DEL CLIENTE CON MÁS INFORMACIÓN
    // ==========================================
    @PostMapping("/{numeroTicket}/responder")
    public ResponseEntity<?> responderSolicitud(
            @PathVariable String numeroTicket,
            @RequestParam("mensaje") String mensaje,
            @RequestParam(value = "archivo", required = false) org.springframework.web.multipart.MultipartFile archivo,
            @RequestHeader("Authorization") String authHeader) {

        if (archivo != null && !archivo.isEmpty()) {
            String tipo = archivo.getContentType();
            if (tipo == null || (!tipo.equals("application/pdf") && !tipo.equals("image/jpeg"))) {
                return ResponseEntity.badRequest().body("Error: El documento debe ser en formato PDF o JPEG.");
            }
            if (archivo.getSize() > 2097152) { // 2MB en bytes
                return ResponseEntity.badRequest()
                        .body("Error: El documento no debe superar el tamaño máximo de 2 MB.");
            }
        }

        try {
            String emailCliente = extraerEmailDelToken(authHeader);
            Queja queja = quejaServicio.obtenerQuejaPorTicket(numeroTicket);

            if (queja == null || !queja.getUsuarioEmail().equals(emailCliente)) {
                return ResponseEntity.status(403).body("Acceso denegado.");
            }

            String estadoAnterior = queja.getEstado().getNombre();

            // 1. Guardar el nuevo documento (si viene uno)
            if (archivo != null && !archivo.isEmpty()) {
                java.io.File directorio = new java.io.File(UPLOAD_DIR);
                if (!directorio.exists())
                    directorio.mkdirs();

                String nombreOriginal = archivo.getOriginalFilename();
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String nombreUnico = java.util.UUID.randomUUID().toString() + extension;

                java.nio.file.Path rutaCompleta = java.nio.file.Paths.get(UPLOAD_DIR + nombreUnico);
                java.nio.file.Files.copy(archivo.getInputStream(), rutaCompleta);

                Documento doc = new Documento();
                doc.setQueja(queja);
                doc.setNombreOriginal(nombreOriginal);
                doc.setTipoArchivo(archivo.getContentType());
                doc.setTamano(archivo.getSize());
                doc.setRutaFisica(rutaCompleta.toString());
                doc.setUsuarioCarga(emailCliente);

                documentoRepositorio.save(doc);
            }

            // 2. Guardar el mensaje en el "Chat"
            // (Asegúrate de inyectar MensajeQuejaRepositorio arriba en tu controlador)
            MensajeQueja nuevoMensaje = new MensajeQueja(
                    queja, emailCliente, "CLIENTE", mensaje, java.time.LocalDateTime.now());
            mensajeQuejaRepositorio.save(nuevoMensaje);

            // 3. Regresar la queja a la bandeja del Agente
            EstadoQueja estadoValidacion = estadoQuejaRepositorio.findByNombre("EnValidacion");
            queja.setEstado(estadoValidacion);
            quejaRepositorio.save(queja);

            // 4. Registrar en Bitácora
            com.banco.quejas.modelo.BitacoraQueja bitacora = new com.banco.quejas.modelo.BitacoraQueja(
                    emailCliente, queja.getId(), estadoAnterior, "EnValidacion",
                    "El cliente proporcionó información adicional y adjuntó nueva evidencia.",
                    java.time.LocalDateTime.now());
            bitacoraQuejaRepositorio.save(bitacora);

            // Opcional: Notificar al agente asignado que el cliente ya respondió
            emailServicio.enviarCorreoRespuestaCliente(
                    queja.getAgenteAsignadoEmail(), queja.getNumeroTicket(),
                    "Respuesta de cliente recibida: " + mensaje);

            return ResponseEntity.ok(java.util.Map.of("mensaje",
                    "Información enviada correctamente. Su queja vuelve a estar en revisión."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al procesar la respuesta: " + e.getMessage());
        }
    }

    // ==========================================
    // NUEVO: OBTENER EL HISTORIAL DE MENSAJES (CHAT)
    // ==========================================
    @GetMapping("/{numeroTicket}/mensajes")
    public ResponseEntity<?> obtenerMensajesQueja(
            @PathVariable String numeroTicket,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String emailUsuario = extraerEmailDelToken(authHeader);
            Queja queja = quejaServicio.obtenerQuejaPorTicket(numeroTicket);

            if (queja == null) {
                return ResponseEntity.status(404).body("La queja no existe.");
            }

            // Validar seguridad: Solo el cliente creador o el agente asignado pueden ver el
            // chat
            boolean esElCreador = queja.getUsuarioEmail().equals(emailUsuario);
            boolean esElAgenteAsignado = queja.getAgenteAsignadoEmail() != null &&
                    queja.getAgenteAsignadoEmail().equals(emailUsuario);

            if (!esElCreador && !esElAgenteAsignado) {
                return ResponseEntity.status(403).body("Acceso denegado al historial.");
            }

            // Llamamos a la base de datos para traer el historial ordenado
            List<MensajeQueja> historial = mensajeQuejaRepositorio.findByQuejaIdOrderByFechaHoraAsc(queja.getId());

            return ResponseEntity.ok(historial);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener el historial de mensajes");
        }
    }

}