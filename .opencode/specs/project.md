# Proyecto

## Nombre

Network Automation API

---

# Descripción

Network Automation API es una API REST desarrollada en Node.js y TypeScript cuyo propósito es abstraer toda la lógica de automatización y diagnóstico de dispositivos de red utilizados por un proveedor de servicios de Internet (ISP).

La API será consumida exclusivamente por n8n.

n8n actúa únicamente como orquestador de procesos.

Toda la lógica de negocio, reglas, comunicación con dispositivos, validaciones y diagnósticos deben residir dentro de esta API.

---

# Objetivos

El proyecto debe permitir:

- Automatizar procesos técnicos.
- Centralizar la lógica de negocio.
- Reducir la complejidad de los workflows de n8n.
- Facilitar la incorporación de nuevos fabricantes.
- Permitir nuevos diagnósticos sin modificar el núcleo.
- Mantener sesiones persistentes con equipos de red.
- Exponer una API REST consistente.
- Ser completamente testeable.

---

# Filosofía

La API debe ser el único lugar donde exista inteligencia del sistema.

n8n nunca debe contener:

- reglas de negocio
- parsing
- lógica de decisión
- transformaciones
- validaciones complejas

n8n únicamente:

- recibe solicitudes
- llama endpoints
- utiliza respuestas
- continúa el flujo

---

# Dominio

El proyecto pertenece al dominio de automatización de redes GPON.

Debe soportar múltiples fabricantes.

Ejemplos:

- Huawei
- VSOL
- ZTE
- FiberHome

Cada fabricante debe implementarse de forma independiente.

---

# Casos de Uso

Los principales casos de uso del sistema son:

## Clientes

- Buscar contrato.
- Obtener información del cliente.
- Obtener dispositivo asignado.

---

## OLT

- Conectarse.
- Autenticarse.
- Mantener sesión.
- Ejecutar comandos.
- Recuperar información.
- Cerrar sesión.

---

## ONT

- Consultar información.
- Consultar potencia.
- Consultar estado.
- Consultar MAC.
- Provisionar.
- Reiniciar.
- Eliminar.
- Actualizar configuración.

---

## Diagnóstico

- Obtener información técnica.
- Analizar potencia.
- Analizar autenticación.
- Analizar estado.
- Analizar configuración.
- Generar hallazgos.
- Generar acciones recomendadas.

---

## Workflows

- Login.
- Provisionamiento.
- Diagnóstico.
- Lectura de información.
- Reinicio.

---

# Arquitectura

La arquitectura oficial del proyecto está definida en:

specs/architecture.md

Toda implementación debe respetarla.

---

# Alcance

La API NO es:

- una interfaz gráfica
- un sistema de monitoreo
- un CRM
- un ERP
- un chatbot

La API únicamente expone servicios relacionados con la automatización de red.

---

# Consumidores

Actualmente existe un único consumidor oficial.

n8n.

La API debe diseñarse pensando en contratos estables.

No debe exponer detalles internos.

---

# Contratos

Todos los endpoints deben mantener respuestas consistentes.

Las respuestas deben ser tipadas.

Nunca devolver estructuras arbitrarias.

Siempre utilizar DTOs.

---

# Fabricantes

Cada fabricante posee:

- comandos
- parsers
- workflows
- adaptadores
- mappers

Nunca compartir parsing.

Nunca compartir comandos.

La reutilización únicamente ocurre mediante contratos.

---

# Comunicación

Toda comunicación con equipos ocurre mediante puertos definidos por la aplicación.

Nunca acceder directamente a SSH desde un caso de uso.

Nunca ejecutar comandos desde Presentation.

---

# Parsing

Toda salida CLI debe convertirse inmediatamente en modelos tipados.

Nunca propagar texto plano.

Nunca aplicar reglas de negocio sobre strings.

---

# Diagnósticos

Los diagnósticos representan lógica de negocio.

Cada diagnóstico debe ser independiente.

Ejemplos:

PowerAnalyzer

MacAnalyzer

AuthenticationAnalyzer

ConfigurationAnalyzer

El motor únicamente coordina.

Nunca conoce implementaciones concretas.

---

# Sesiones

Las sesiones SSH son responsabilidad de Infrastructure.

Los casos de uso nunca conocen:

- Shell
- Prompt
- Stream
- SSH Client

Únicamente conocen un contrato.

---

# Persistencia

El sistema debe poder funcionar con distintas implementaciones.

Ejemplo:

PostgreSQL

Redis

Memoria

La lógica nunca dependerá de una implementación concreta.

---

# Escalabilidad

Agregar un nuevo fabricante no debe requerir modificar código existente.

El proceso ideal será:

- crear adapter
- crear parser
- crear commands
- crear workflow
- registrar factory

Nada más.

---

# Escalabilidad funcional

Agregar un nuevo diagnóstico no debe modificar el motor.

Solo registrar una nueva estrategia.

Agregar un nuevo endpoint no debe modificar otros módulos.

Agregar un nuevo workflow no debe afectar workflows existentes.

---

# Rendimiento

El sistema debe minimizar conexiones repetidas.

Siempre que sea posible:

- reutilizar sesiones
- reutilizar conexiones
- evitar parsing duplicado

---

# Seguridad

Nunca registrar:

- contraseñas
- tokens
- credenciales
- secretos

Toda configuración sensible proviene del entorno.

---

# Configuración

Toda configuración debe centralizarse.

Nunca utilizar valores hardcodeados.

Ejemplos:

timeouts

puertos

credenciales

hosts

reintentos

---

# Observabilidad

Toda operación importante debe registrar eventos mediante el sistema oficial de logging.

Nunca utilizar console.log.

---

# Testing

Toda funcionalidad nueva debe poder probarse de forma aislada.

Los casos de uso deben depender únicamente de contratos.

Infrastructure debe poder reemplazarse mediante mocks.

---

# Versionado

La API debe mantener compatibilidad hacia atrás siempre que sea posible.

Los cambios incompatibles deben introducirse mediante una nueva versión.

---

# Objetivo Final

El objetivo del proyecto no es únicamente ejecutar comandos sobre dispositivos.

El verdadero objetivo es proporcionar una plataforma de automatización de red que permita incorporar nuevos fabricantes, nuevos procesos y nuevos diagnósticos sin modificar la arquitectura existente.

La mantenibilidad y la extensibilidad son prioridades superiores a la velocidad de implementación.