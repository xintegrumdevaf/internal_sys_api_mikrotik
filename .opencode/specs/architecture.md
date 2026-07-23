# Arquitectura

## Objetivo

La arquitectura debe permitir:

- Escalar el proyecto sin reorganizar carpetas.
- Incorporar nuevos fabricantes sin modificar lógica existente.
- Mantener una separación estricta de responsabilidades.
- Facilitar testing.
- Permitir reemplazar infraestructura sin afectar el dominio.
- Centralizar toda la lógica de negocio dentro de la API.
- Servir exclusivamente como backend para n8n.

---

# Estilo Arquitectónico

El proyecto utiliza una combinación de:

- Clean Architecture
- Hexagonal Architecture (Ports & Adapters)
- Tactical DDD

Cada capa tiene una única responsabilidad.

Nunca deben mezclarse.

---

# Dependencias

La única dirección permitida es:

Presentation
↓

Application
↓

Domain

Infrastructure implementa contratos definidos por Application o Domain.

Nunca al revés.

---

# Estructura

src/

    presentation/

    application/

    domain/

    infrastructure/

    shared/

---

# Presentation

Responsabilidad:

Exponer la API.

No contiene lógica de negocio.

No conoce fabricantes.

No conoce SSH.

No conoce bases de datos.

Únicamente:

- Controllers
- Routes
- Middlewares
- Request Validation
- Response Mapping

Ejemplo

presentation/

    controllers/

    routes/

    middlewares/

    validators/

---

# Controllers

Responsabilidades:

Recibir request.

Validar DTO.

Invocar UseCase.

Retornar respuesta.

Nunca:

Consultar repositorios.

Ejecutar SSH.

Ejecutar SQL.

Aplicar reglas de negocio.

---

# Routes

Únicamente registran endpoints.

No contienen lógica.

---

# Middlewares

Autenticación.

Logs.

Errores.

Rate Limit.

Nada más.

---

# Application

La capa Application contiene los casos de uso.

No conoce Express.

No conoce PostgreSQL.

No conoce Huawei.

No conoce SSH.

Únicamente conoce contratos.

Estructura

application/

    dto/

    ports/

    services/

    use-cases/

---

# Use Cases

Cada caso de uso representa una única acción del sistema.

Ejemplos

CollectTechnicalData

ExecuteDiagnostic

ProvisionOnt

RestartOnt

AuthenticateClient

Nunca:

Contener SQL.

Contener SSH.

Contener HTTP.

---

# DTO

Representan comunicación entre capas.

Nunca contienen lógica.

Nunca contienen métodos.

Nunca representan entidades.

---

# Ports

Los Ports representan contratos.

Ejemplos

OltConnectionPort

SessionRepository

LoggerPort

CachePort

WorkflowRepository

Nunca contienen implementación.

---

# Services

Contienen lógica reutilizable de aplicación.

Ejemplo

WorkflowExecutor

SessionCoordinator

DiagnosticCoordinator

Nunca acceder directamente a infraestructura.

---

# Domain

Es el núcleo del sistema.

No conoce ninguna tecnología.

Debe poder ejecutarse sin Express.

Debe poder ejecutarse sin PostgreSQL.

Debe poder ejecutarse sin Docker.

Debe poder ejecutarse sin SSH.

---

domain/

    entities/

    value-objects/

    enums/

    repositories/

    services/

    events/

    exceptions/

---

# Entities

Representan conceptos del negocio.

Ejemplos

Ont

Olt

DiagnosticSession

Workflow

Client

Nunca heredan de ORM.

Nunca contienen decorators.

Nunca contienen JSON.

---

# Value Objects

Representan valores inmutables.

Ejemplos

Serial

MacAddress

OpticalPower

PonNumber

IpAddress

Username

Password

---

# Enums

Únicamente conceptos del dominio.

Ejemplos

WorkflowStep

DiagnosticStatus

OntState

PowerLevel

Manufacturer

---

# Domain Services

Contienen lógica de dominio que no pertenece a una entidad.

Ejemplo

PowerAnalyzer

WorkflowResolver

---

# Repositories

Representan persistencia.

Son contratos.

Nunca implementaciones.

---

# Infrastructure

Infrastructure implementa todos los contratos.

Todo acceso externo ocurre aquí.

Ejemplo

infrastructure/

    persistence/

    ssh/

    olt/

    parsers/

    cache/

    logger/

    config/

    factories/

---

# Persistence

Implementaciones de repositorios.

PostgreSQL.

Redis.

Memoria.

Nunca lógica de negocio.

---

# SSH

Toda comunicación SSH.

Manejo de sesiones.

Reconexión.

Timeouts.

Shell.

Nada más.

Nunca interpretar respuestas.

---

# OLT

Implementaciones por fabricante.

Ejemplo

olt/

    huawei/

    vsol/

    zte/

Cada fabricante contiene:

adapter/

commands/

parser/

workflow/

mapper/

factory/

Nunca compartir lógica mediante condicionales.

---

# Adapter

Encapsula diferencias entre fabricantes.

Nunca hacer

if(manufacturer==="Huawei")

fuera de esta carpeta.

---

# Commands

Representan comandos CLI.

Ejemplo

DisplayOntInfoCommand

DisplayMacCommand

DisplayPowerCommand

---

# Parser

Transforman texto CLI en modelos tipados.

Nunca devuelven strings.

Nunca contienen reglas de negocio.

---

# Mapper

Transforman respuestas.

Nada más.

---

# Workflow

Cada fabricante puede tener workflows distintos.

Ejemplo

LoginWorkflow

SetupWorkflow

ProvisionWorkflow

---

# Factories

Crean implementaciones.

Ejemplo

OltAdapterFactory

WorkflowFactory

ParserFactory

---

# Shared

Contiene únicamente elementos realmente compartidos.

shared/

    logger/

    errors/

    constants/

Nunca colocar aquí:

Helpers

Utils

Business Logic

---

# Flujo de ejecución

Controller

↓

Use Case

↓

Port

↓

Infrastructure

↓

Respuesta

Nunca saltar capas.

---

# Inyección de dependencias

Toda dependencia debe resolverse desde un único Composition Root.

Ejemplo

container.ts

Nunca utilizar new dentro de los casos de uso.

---

# Organización por dominio

Nunca organizar por tecnología.

Incorrecto

controllers/

services/

repositories/

models/

Correcto

diagnostic/

workflow/

olt/

session/

client/

Dentro de cada dominio sí se aplica la división por capas.

Ejemplo

application/

    diagnostic/

    olt/

    workflow/

domain/

    diagnostic/

    olt/

    session/

Esto mantiene cohesionados todos los elementos relacionados.

---

# Fabricantes

Cada fabricante es completamente independiente.

Huawei

VSOL

ZTE

FiberHome

Cada uno puede tener:

Comandos distintos.

Parsers distintos.

Workflows distintos.

Nunca compartir parsing.

---

# Diagnósticos

Cada diagnóstico representa una Strategy.

Ejemplo

PowerAnalyzer

MacAnalyzer

AuthAnalyzer

SignalAnalyzer

Todos implementan:

DiagnosticAnalyzer

El motor únicamente ejecuta estrategias.

Nunca conoce implementaciones concretas.

---

# Workflows

Los workflows representan procesos.

Nunca estados.

Ejemplo

LoginWorkflow

ProvisionWorkflow

ReadInformationWorkflow

RestartWorkflow

Cada workflow puede reutilizar Steps.

---

# Steps

Un Step representa una interacción atómica.

Ejemplo

Esperar Prompt

Enviar comando

Esperar Password

Enviar Password

Esperar Config

Nunca contiene lógica de negocio.

---

# Sesiones

La sesión SSH debe abstraerse completamente.

Los casos de uso nunca conocen Shell.

Nunca conocen Streams.

Nunca conocen Prompts.

Solo conocen:

SessionPort

---

# Respuestas

Toda respuesta de infraestructura debe convertirse inmediatamente a modelos tipados.

Nunca propagar:

CLI

JSON arbitrario

Texto plano

---

# Escalabilidad

Agregar un nuevo fabricante debe implicar únicamente:

Crear Adapter

Crear Parser

Crear Commands

Crear Workflow

Registrar Factory

Nada más.

No modificar código existente.

---

# Regla Final

Si una nueva funcionalidad requiere modificar más de un dominio existente, la arquitectura probablemente necesita una nueva abstracción antes de implementar dicha funcionalidad.