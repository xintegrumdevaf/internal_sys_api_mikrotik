# API Specification

## Objetivo

La API constituye la única interfaz pública del sistema.

Su propósito es exponer capacidades de automatización de red mediante contratos REST estables, predecibles y completamente tipados.

El único consumidor oficial es n8n.

Toda decisión de diseño debe priorizar la estabilidad del contrato antes que la comodidad de implementación.

---

# Principios

La API debe ser:

- Consistente
- Determinista
- Idempotente cuando aplique
- Versionable
- Fácil de consumir
- Independiente de la implementación interna

La API nunca debe exponer detalles de infraestructura.

---

# Consumidor

Actualmente existe un único consumidor.

n8n.

Esto significa que:

- No existen vistas.
- No existen sesiones HTTP.
- No existen páginas.
- No existe lógica de presentación.

La API únicamente recibe solicitudes y devuelve respuestas.

---

# Versionado

Toda la API debe estar versionada.

Ejemplo

/api/v1

Los cambios incompatibles requieren una nueva versión.

Nunca romper contratos existentes.

---

# Formato

Todas las solicitudes utilizan:

Content-Type

application/json

Todas las respuestas utilizan:

application/json

---

# Diseño REST

Utilizar recursos.

Incorrecto

POST /executeHuaweiPower

POST /runWorkflow

POST /doLogin

Correcto

POST /diagnostics

POST /workflows

POST /sessions

GET /onts/{serial}

---

# Endpoints

Cada endpoint representa una única intención.

Nunca combinar múltiples acciones.

Incorrecto

POST /network

body

{
    "action":"restart"
}

Correcto

POST /onts/{id}/restart

---

# Verbos

GET

Consultar información.

POST

Crear procesos o ejecutar acciones.

PUT

Reemplazar un recurso.

PATCH

Modificar parcialmente.

DELETE

Eliminar recursos.

---

# Identificadores

Utilizar identificadores estables.

Ejemplos

id

serial

sessionId

workflowId

Nunca utilizar índices.

---

# Request

Toda request debe representarse mediante un DTO.

Nunca utilizar objetos anónimos.

Incorrecto

req.body.name

Correcto

CreateWorkflowRequest

---

# Response

Toda respuesta debe representarse mediante un DTO.

Nunca devolver entidades.

Nunca devolver modelos internos.

Nunca devolver respuestas de infraestructura.

---

# Respuesta Exitosa

Las respuestas deben contener únicamente la información necesaria.

Incorrecto

{
    "success":true,
    "status":"ok",
    "message":"Correcto",
    "data":...
}

Correcto

{
    "id":"...",
    "status":"completed",
    "result":...
}

---

# Errores

Todos los errores deben tener una estructura consistente.

Ejemplo

{
    "code":"SESSION_NOT_FOUND",
    "message":"Session not found."
}

Nunca devolver stack traces.

Nunca devolver excepciones internas.

---

# HTTP Status

200

Consulta exitosa.

201

Recurso creado.

202

Proceso aceptado.

204

Sin contenido.

400

Solicitud inválida.

401

No autorizado.

403

Acceso prohibido.

404

Recurso inexistente.

409

Conflicto.

422

Regla de negocio incumplida.

500

Error interno.

---

# Validación

Toda validación de entrada ocurre antes de ejecutar el caso de uso.

Nunca permitir datos inválidos dentro de Application.

---

# DTO

Los DTO representan únicamente comunicación.

Nunca contienen lógica.

Nunca contienen métodos.

Nunca contienen validaciones.

---

# Entidades

Nunca devolver entidades del dominio.

Siempre mapear a DTOs.

---

# Diagnósticos

Los diagnósticos representan procesos.

Ejemplo

POST

/diagnostics

Request

{
    "contractId":"..."
}

Response

{
    "status":"completed",
    "findings":[...],
    "actions":[...]
}

---

# Workflows

Los workflows representan procesos de automatización.

Nunca exponer implementación interna.

La API únicamente recibe parámetros.

---

# Sesiones

La sesión SSH nunca debe exponerse directamente.

La API únicamente trabaja con identificadores.

Ejemplo

{
    "sessionId":"..."
}

Nunca devolver:

Prompt

Shell

Streams

Buffers

---

# Fabricantes

La API no debe exponer diferencias entre fabricantes.

Incorrecto

POST

/huawei/login

Correcto

POST

/sessions

El fabricante se determina internamente.

---

# Parsing

La API nunca devuelve texto proveniente del CLI.

Toda respuesta debe encontrarse tipada.

---

# Logging

Toda request importante debe registrarse.

Nunca registrar:

Contraseñas

Tokens

Credenciales

---

# Idempotencia

Cuando una operación pueda ejecutarse varias veces sin efectos secundarios, debe ser idempotente.

Ejemplo

Consultar potencia.

Consultar información.

Obtener cliente.

---

# Acciones

Las acciones sobre recursos deben expresarse claramente.

Ejemplos

POST

/onts/{id}/restart

POST

/onts/{id}/provision

POST

/onts/{id}/disable

---

# Consistencia

Todos los endpoints deben compartir:

Mismo formato de errores.

Mismos códigos.

Mismos criterios de validación.

Misma estructura de respuestas.

---

# Extensibilidad

Agregar un nuevo endpoint nunca debe requerir modificar endpoints existentes.

Cada recurso debe ser independiente.

---

# Seguridad

Nunca aceptar información sensible mediante parámetros de URL.

Utilizar siempre HTTPS.

Toda autenticación debe abstraerse.

---

# Observabilidad

Toda operación relevante debe generar eventos de logging.

Toda excepción debe quedar registrada.

---

# Rendimiento

Evitar múltiples llamadas para obtener la misma información.

Siempre que sea posible:

- reutilizar sesiones
- minimizar conexiones SSH
- evitar parsing repetido

---

# Objetivo Final

La API debe actuar como una capa de abstracción sobre la infraestructura de red.

El consumidor nunca debe conocer:

- comandos CLI
- fabricantes
- sesiones SSH
- parsers
- protocolos

El consumidor únicamente conoce recursos REST y contratos estables.