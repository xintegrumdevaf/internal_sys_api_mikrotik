# Network Automation API - Overview

## Nombre del Proyecto
Network Automation API

## Descripción
Network Automation API es una API REST desarrollada en Node.js y TypeScript cuyo propósito es abstraer toda la lógica de automatización y diagnóstico de dispositivos de red utilizados por un proveedor de servicios de Internet (ISP).

La API es consumida por la **API del ISP** (backend del sistema principal) y por **n8n** (como orquestador de procesos). Toda la lógica de negocio, reglas de comunicación con los dispositivos (OLT, ONT, Routers, etc.), validaciones y diagnósticos residen dentro de esta API. Ni la API del ISP ni n8n deben contener lógica de bajo nivel de hardware ni parsing de red.

## Objetivos
El proyecto debe permitir:
* Automatizar procesos técnicos de red.
* Centralizar la lógica de negocio y de red.
* Reducir la complejidad de los workflows de n8n y de los servicios del backend del ISP.
* Facilitar la incorporación de nuevos fabricantes de hardware.
* Permitir nuevos diagnósticos sin modificar el núcleo de la aplicación.
* Mantener sesiones persistentes con los equipos de red.
* Exponer una API REST consistente y completamente tipada.
* Ser 100% testeable mediante aislamiento e inyección de dependencias.

## Filosofía del Sistema
La API debe ser el único lugar donde exista inteligencia y control sobre el hardware de red.

### Los clientes consumidores (API del ISP y n8n) nunca deben contener:
* Reglas de interacción de bajo nivel de red.
* Parsing de salidas de comandos CLI/SSH/Telnet.
* Lógica de decisión o ruteo de hardware GPON / MikroTik.
* Transformaciones complejas de telemetría de red.
* Validaciones físicas de enlaces de red.

### Los clientes consumidores únicamente:
* Reciben solicitudes externas (usuarios, operadores o disparadores de eventos).
* Llaman a los endpoints REST de esta API.
* Utilizan las respuestas tipadas (DTOs) para continuar el flujo de orquestación o responder al cliente final.

---

## Estado y Roadmap del Proyecto

### Fase 1: Arquitectura Base
* **Estado**: 🟢 En desarrollo / Completada base
* **Objetivos**: Definir arquitectura limpia/hexagonal, inyección de dependencias, logging estructurado, manejo centralizado de excepciones y tipado estricto.

### Fase 2: Infraestructura de Red
* **Estado**: 🟢 En desarrollo
* **Objetivos**: Session Manager, cliente SSH integrado, Connection Pool, cache de sesiones, políticas de reintentos y timeouts.

### Fase 3: Fabricantes
* **Estado**: 🟢 En desarrollo
* **Objetivos**: Implementación de adaptadores, comandos, parsers y workflows independientes por fabricante (Huawei, VSOL, ZTE).

### Fase 4: Información Técnica
* **Estado**: 🟢 En desarrollo
* **Objetivos**: Mapear potencia óptica, estado, MAC, perfil, configuración y eventos de la ONT a modelos tipados.

### Fase 5: Motor de Diagnóstico
* **Estado**: 🟡 Planificado
* **Objetivos**: Diagnósticos basados en estrategias (Diagnostic Engine, Findings, Actions, Severities).

### Fase 6: Workflows de Automatización
* **Estado**: 🟡 Planificado
* **Objetivos**: Workflows de Login, Read, Provisioning y Restart por fabricante.

### Fase 7: Provisionamiento
* **Estado**: 🟡 Planificado
* **Objetivos**: Registro, eliminación y reinicio de ONTs en la OLT de manera consistente.

### Fase 8: Persistencia
* **Estado**: 🟡 Planificado
* **Objetivos**: Gestión de sesiones y auditoría en PostgreSQL, cache y locks distribuidos en Redis.

### Fase 9: API Pública
* **Estado**: 🟢 En desarrollo
* **Objetivos**: Endpoints REST, versionado `/api/v1`, uso estricto de DTOs, validaciones y documentación OpenAPI.

### Fase 10: Observabilidad
* **Estado**: 🟡 Planificado
* **Objetivos**: Correlation ID, logs estructurados de red y métricas.

### Fase 11: Seguridad
* **Estado**: 🟡 Planificado
* **Objetivos**: API Keys, JWT, Rate Limiting y Secret Manager.

### Fase 12: Testing
* **Estado**: 🟡 Planificado
* **Objetivos**: Pruebas unitarias, integración y mocks de infraestructura.
