package com.banco.quejas.controlador;

import com.banco.quejas.modelo.Documento;
import com.banco.quejas.modelo.EstadoQueja;
import com.banco.quejas.modelo.Producto;
import com.banco.quejas.modelo.Queja;
import com.banco.quejas.repositorio.DocumentoRepositorio;
import com.banco.quejas.repositorio.EstadoQuejaRepositorio;
import com.banco.quejas.repositorio.ProductoRepositorio;
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

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity crearQueja(
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("productoId") Long productoId, // RN06: Requerimos el producto seleccionado
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

            // NUEVO: Enviar correo electrónico de notificación al cliente
            try {
                emailServicio.enviarCorreoRegistroQueja(
                        emailUsuario,
                        quejaGuardada.getNumeroTicket(),
                        quejaGuardada.getTitulo());
            } catch (Exception correoEx) {
                // Capturamos el error de correo para que, si el servidor SMTP falla,
                // la queja de todos modos se guarde con éxito en la base de datos.
                System.err.println("Advertencia: No se pudo enviar el correo, pero la queja fue guardada: "
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

            // Validar que la queja exista y pertenezca al usuario que la solicita
            if (queja == null || !queja.getUsuarioEmail().equals(emailUsuario)) {
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

            // 2. Validar seguridad: que el documento pertenezca al usuario que lo solicita
            if (!documento.getQueja().getUsuarioEmail().equals(emailUsuario)) {
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

    private String extraerEmailDelToken(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String[] chunks = token.split("\\.");
        Base64.Decoder decoder = Base64.getUrlDecoder();
        String payload = new String(decoder.decode(chunks[1]));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode payloadJson = mapper.readTree(payload);
        return payloadJson.get("sub").asText();
    }
}