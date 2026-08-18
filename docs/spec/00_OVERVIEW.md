# Network Automation API - Overview

## Nombre del Proyecto
Network Automation API

## Descripción
Network Automation API es una API REST desarrollada en Node.js y TypeScript cuyo propósito es abstraer toda la lógica de automatización y diagnóstico de dispositivos de red utilizados por un proveedor de servicios de Internet (ISP).

La API es consumida exclusivamente por **n8n**, el cual actúa únicamente como orquestador de procesos. Toda la lógica de negocio, reglas de comunicación con los dispositivos (OLT, ONT, Routers, etc.), validaciones y diagnósticos residen dentro de esta API. n8n nunca debe contener lógica de negocio.

## Objetivos
El proyecto debe permitir:
* Automatizar procesos técnicos de red.
* Centralizar la lógica de negocio.
* Reducir la complejidad de los workflows de n8n.
* Facilitar la incorporación de nuevos fabricantes de hardware.
* Permitir nuevos diagnósticos sin modificar el núcleo de la aplicación.
* Mantener sesiones persistentes con los equipos de red.
* Exponer una API REST consistente y completamente tipada.
* Ser 100% testeable mediante aislamiento e inyección de dependencias.

## Filosofía del Sistema
La API debe ser el único lugar donde exista inteligencia del sistema.

### n8n nunca debe contener:
* Reglas de negocio.
* Parsing de salidas de comandos CLI/SSH.
* Lógica de decisión o ruteo complejo de negocio.
* Transformaciones complejas.
* Validaciones complejas de red.

### n8n únicamente:
* Recibe solicitudes externas.
* Llama a los endpoints de la API.
* Utiliza las respuestas tipadas.
* Continúa el flujo de orquestación.

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
