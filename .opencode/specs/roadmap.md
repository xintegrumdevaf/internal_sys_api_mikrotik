# Roadmap

## Objetivo

Este documento define la evolución prevista del proyecto.

Su propósito es:

- Guiar el crecimiento de la plataforma.
- Evitar implementaciones improvisadas.
- Priorizar funcionalidades.
- Mantener una arquitectura consistente.

La incorporación de nuevas funcionalidades debe seguir este roadmap siempre que sea posible.

---

# Estado del Proyecto

## Fase 1

Arquitectura Base

Estado

🟢 En desarrollo

Objetivos

- Definir arquitectura.
- Configurar estructura del proyecto.
- Implementar Dependency Injection.
- Configurar logging.
- Configurar manejo de errores.
- Configurar configuración centralizada.
- Configurar aliases.
- Configurar testing.

---

## Fase 2

Infraestructura de Red

Estado

🟢 En desarrollo

Objetivos

- Session Manager.
- SSH Client.
- Connection Pool.
- Session Cache.
- Retry Policies.
- Timeout Policies.

Resultado esperado

La API puede comunicarse con dispositivos de red de forma estable.

---

## Fase 3

Fabricantes

Estado

🟢 En desarrollo

Objetivos

Huawei

- Adapter
- Commands
- Parsers
- Workflows

VSOL

- Adapter
- Commands
- Parsers
- Workflows

ZTE

- Adapter
- Commands
- Parsers
- Workflows

Resultado esperado

Agregar un fabricante implica únicamente registrar un nuevo Adapter.

---

## Fase 4

Información Técnica

Estado

🟢 En desarrollo

Objetivos

Obtener:

- Información ONT.
- Potencia óptica.
- Estado.
- MAC.
- Perfil.
- Configuración.
- Eventos.

Resultado esperado

Toda información proveniente del CLI debe convertirse en modelos tipados.

---

## Fase 5

Motor de Diagnóstico

Estado

🟡 Planificado

Objetivos

Implementar:

- Diagnostic Engine.
- Strategies.
- Findings.
- Recommendations.
- Severity Levels.
- Execution Pipeline.

Resultado esperado

Agregar un diagnóstico implica registrar una nueva Strategy.

---

## Fase 6

Workflows

Estado

🟡 Planificado

Objetivos

Implementar:

- Login Workflow.
- Read Workflow.
- Provision Workflow.
- Restart Workflow.
- Factory Reset Workflow.

Resultado esperado

Cada fabricante mantiene sus propios workflows.

---

## Fase 7

Provisionamiento

Estado

🟡 Planificado

Objetivos

- Registrar ONT.
- Eliminar ONT.
- Actualizar ONT.
- Cambiar perfil.
- Reiniciar.

Resultado esperado

Todos los procesos de provisionamiento utilizan la misma arquitectura.

---

## Fase 8

Persistencia

Estado

🟡 Planificado

Objetivos

PostgreSQL

- Sesiones.
- Historial.
- Auditoría.

Redis

- Cache.
- Sesiones.
- Locks.

Resultado esperado

La persistencia puede reemplazarse sin modificar Application.

---

## Fase 9

API Pública

Estado

🟢 En desarrollo

Objetivos

- Endpoints REST.
- Versionado.
- DTOs.
- Validación.
- Documentación OpenAPI.

Resultado esperado

Toda funcionalidad es consumible desde n8n.

---

## Fase 10

Observabilidad

Estado

🟡 Planificado

Objetivos

- Logging estructurado.
- Correlation ID.
- Auditoría.
- Métricas.
- Health Check.
- Tracing.

Resultado esperado

El comportamiento del sistema puede monitorearse completamente.

---

## Fase 11

Seguridad

Estado

🟡 Planificado

Objetivos

- API Keys.
- JWT.
- Rate Limit.
- Secret Manager.
- Rotación de credenciales.

Resultado esperado

La API puede exponerse de forma segura.

---

## Fase 12

Testing

Estado

🟡 Planificado

Objetivos

- Unit Tests.
- Integration Tests.
- Contract Tests.
- Mock Infrastructure.

Resultado esperado

Todos los casos de uso pueden probarse sin infraestructura real.

---

# Funcionalidades Futuras

Las siguientes funcionalidades están previstas, pero no forman parte del alcance inmediato.

---

## Network Inventory

Objetivo

Administrar dispositivos registrados.

Ejemplos

- OLTs
- ONTs
- Routers
- Switches

---

## Alarmas

Objetivo

Generar eventos ante condiciones específicas.

Ejemplos

- Baja potencia.
- ONT caída.
- Error de autenticación.

---

## Scheduler

Objetivo

Permitir tareas automáticas.

Ejemplos

- Diagnósticos nocturnos.
- Sincronización.
- Limpieza.

---

## Event Bus

Objetivo

Permitir comunicación desacoplada.

Ejemplos

- Redis Streams.
- RabbitMQ.
- Kafka.

---

## Plugins

Objetivo

Permitir agregar nuevos fabricantes sin modificar el núcleo.

---

## CLI

Objetivo

Administración mediante consola.

---

## WebSocket

Objetivo

Notificaciones en tiempo real.

---

## Multi Tenant

Objetivo

Soportar múltiples operadores.

---

# Reglas de Evolución

Toda nueva funcionalidad debe responder:

¿Puede implementarse mediante extensión?

Si la respuesta es sí, nunca modificar el núcleo.

---

¿Respeta la arquitectura?

Si no, debe rediseñarse antes de implementarse.

---

¿Existe un patrón equivalente?

Si existe:

Reutilizar.

Nunca crear otro diferente.

---

# Definición de Completado

Una funcionalidad únicamente se considera finalizada cuando:

- Respeta la arquitectura.
- Está completamente tipada.
- Tiene DTOs.
- Tiene pruebas.
- Tiene logging.
- Tiene documentación.
- No introduce deuda técnica.

---

# Objetivo Final

Construir una plataforma de automatización de redes modular, escalable y desacoplada.

El crecimiento del sistema debe lograrse mediante nuevas implementaciones, no mediante modificaciones del núcleo.

Agregar:

- fabricantes
- diagnósticos
- workflows
- protocolos
- persistencia

debe ser un proceso predecible y con impacto mínimo sobre el código existente.