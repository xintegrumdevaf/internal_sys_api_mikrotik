# Coding Standards

## Objetivo

Este documento define las convenciones oficiales de desarrollo del proyecto.

Todo el código debe seguir estas reglas para garantizar:

- Consistencia
- Legibilidad
- Escalabilidad
- Mantenibilidad

Las reglas aquí descritas prevalecen sobre preferencias personales.

---

# Filosofía

Siempre priorizar:

1. Código claro.
2. Tipado fuerte.
3. Responsabilidades pequeñas.
4. Composición.
5. Simplicidad.

Nunca escribir código "ingenioso".

El código debe ser evidente.

---

# TypeScript

El proyecto utiliza TypeScript en modo estricto.

Está prohibido desactivar cualquier regla del compilador.

Siempre utilizar:

strict

noImplicitAny

strictNullChecks

exactOptionalPropertyTypes

---

# Tipado

Todo debe estar tipado.

Incorrecto

let data;

Correcto

const data: DiagnosticResponse

---

Nunca utilizar:

any

---

Nunca utilizar:

Object

---

Nunca utilizar:

Function

---

Nunca utilizar:

{}

---

Evitar:

unknown

Si se utiliza unknown debe validarse inmediatamente.

---

Preferir tipos concretos antes que genéricos.

Incorrecto

Record<string, unknown>

Correcto

DiagnosticContext

WorkflowContext

HuaweiOntInfo

---

# Interfaces

Las interfaces representan contratos.

Ejemplo

interface SessionRepository

interface Logger

interface WorkflowExecutor

No utilizar interfaces como DTO.

---

# Type

Utilizar type únicamente para:

Union Types

Intersection Types

Mapped Types

Utility Types

Ejemplo

type Manufacturer = "Huawei" | "VSOL"

---

# Clases

Cada clase debe tener una única responsabilidad.

Una clase nunca debe crecer indefinidamente.

Si supera aproximadamente 300 líneas debe evaluarse dividirla.

---

Toda clase debe tener un nombre explícito.

Incorrecto

Manager

Helper

Processor

Service

Correcto

HuaweiSessionFactory

PowerAnalyzer

ExecuteWorkflowUseCase

---

# Constructores

Los constructores únicamente reciben dependencias.

Nunca ejecutar lógica.

Incorrecto

constructor(){

    this.connect();

}

---

# Métodos

Orden recomendado

Constructor

Métodos públicos

Métodos protegidos

Métodos privados

---

No exponer métodos innecesarios.

Todo método privado debe permanecer privado.

---

# Funciones

Una función representa una acción.

Idealmente menos de 40 líneas.

Nunca recibir demasiados parámetros.

Si supera cinco parámetros considerar un objeto.

Incorrecto

create(a,b,c,d,e,f)

Correcto

create(CreateSessionRequest)

---

# Parámetros

Siempre tipados.

Preferir objetos cuando representen una entidad lógica.

---

# Objetos

Preferir objetos inmutables.

Usar readonly cuando sea posible.

---

# Enums

Solo representar conceptos del dominio.

Ejemplo

WorkflowStep

PowerStatus

Manufacturer

No utilizar enums para valores arbitrarios.

---

# Value Objects

Todo valor importante del dominio debe representarse mediante un Value Object.

Ejemplo

Serial

MacAddress

OpticalPower

IPAddress

PonNumber

---

# Entidades

Representan el dominio.

Nunca conocer infraestructura.

Nunca contener decoradores.

Nunca depender de librerías.

---

# DTO

Representan comunicación.

Nunca contienen lógica.

Nunca contienen validaciones.

Nunca contienen métodos.

---

# Validación

La validación de entrada ocurre únicamente en Presentation.

La validación de reglas ocurre en Domain.

---

# Casos de Uso

Un caso de uso representa una acción del sistema.

Debe tener un único método público.

execute()

Ejemplo

ExecuteWorkflowUseCase

CollectTechnicalDataUseCase

---

Nunca agregar múltiples acciones en un mismo caso de uso.

Incorrecto

UserUseCase

Correcto

CreateUserUseCase

DeleteUserUseCase

UpdateUserUseCase

---

# Servicios

Los servicios contienen lógica reutilizable.

Nunca convertirse en un "contenedor de métodos".

---

# Repositories

Representan persistencia.

Nunca lógica de negocio.

Nunca transformación.

Nunca validación.

---

# Factories

Una Factory únicamente crea objetos.

Nunca ejecuta lógica del dominio.

---

# Strategy

Utilizar Strategy cuando existan múltiples implementaciones intercambiables.

Ejemplo

DiagnosticAnalyzer

↓

PowerAnalyzer

↓

MacAnalyzer

↓

AuthenticationAnalyzer

---

# Adapter

Utilizar Adapter para encapsular diferencias entre fabricantes.

Nunca utilizar condicionales por fabricante fuera del Adapter.

Incorrecto

if(manufacturer==="Huawei")

Correcto

HuaweiAdapter

VSOLAdapter

---

# Parser

Todo texto externo debe convertirse inmediatamente a modelos tipados.

Nunca propagar strings CLI.

---

# Mapper

Los mappers transforman datos.

Nunca validan.

Nunca consultan infraestructura.

---

# Exceptions

Nunca lanzar Error.

Siempre crear excepciones específicas.

Ejemplo

SessionExpiredError

InvalidWorkflowError

OntNotFoundError

---

# Logging

Nunca usar console.log.

Siempre utilizar Logger.

Toda excepción importante debe registrarse.

---

# Async

Siempre utilizar async/await.

Nunca mezclar Promise.then.

---

# Dependencias

Nunca instanciar dependencias manualmente.

Incorrecto

const repository = new Repository()

Correcto

constructor(
    repository: Repository
)

---

# Imports

Orden recomendado

Node

Dependencias externas

Application

Domain

Infrastructure

Shared

Locales

---

Nunca utilizar imports relativos excesivos.

Incorrecto

../../../../../../

Preferir alias.

Ejemplo

@application

@domain

@infrastructure

@shared

---

# Nombres

Clases

PascalCase

Funciones

camelCase

Variables

camelCase

Interfaces

PascalCase

Archivos

kebab-case

---

# Sufijos

UseCase

Repository

Adapter

Factory

Parser

Mapper

Validator

Controller

Middleware

Exception

Strategy

Port

No inventar nuevos sufijos.

---

# Comentarios

Evitar comentarios.

Si un comentario explica el código, probablemente el código puede mejorar.

Solo comentar:

Decisiones

Algoritmos

Limitaciones externas

---

# Tests

Todo caso de uso debe poder probarse aislado.

Nunca depender de infraestructura.

Utilizar mocks para Ports.

---

# Duplicación

Antes de crear código nuevo verificar si existe una implementación equivalente.

No abstraer prematuramente.

Extraer únicamente cuando existan múltiples usos reales.

---

# Performance

Primero escribir código correcto.

Después escribir código mantenible.

Optimizar únicamente cuando exista evidencia.

---

# Regla Final

Todo Pull Request debe responder afirmativamente las siguientes preguntas:

- ¿Respeta la arquitectura?
- ¿Respeta las responsabilidades?
- ¿Está completamente tipado?
- ¿Es fácilmente testeable?
- ¿Evita duplicación innecesaria?
- ¿Puede entenderse sin comentarios?
- ¿Puede extenderse sin modificar código existente?

Si alguna respuesta es "No", la implementación debe revisarse antes de integrarse.