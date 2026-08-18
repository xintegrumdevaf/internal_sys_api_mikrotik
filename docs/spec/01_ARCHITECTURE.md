# Network Automation API - Architecture

## Objetivo
La arquitectura del sistema está diseñada para cumplir con las siguientes directrices:
* Escalar el proyecto sin necesidad de reorganizar directorios o capas.
* Incorporar nuevos fabricantes de red sin alterar la lógica de negocio existente (abstracción total).
* Mantener una separación estricta de responsabilidades (Clean & Hexagonal Architecture).
* Facilitar el desarrollo de pruebas unitarias y de integración mediante mocks.
* Permitir el reemplazo o actualización de infraestructura (ej. de base de datos) sin alterar las capas de dominio o aplicación.

---

## Estilo Arquitectónico
El proyecto combina:
1. **Clean Architecture**: Reglas de dependencia concéntricas hacia el dominio.
2. **Hexagonal Architecture (Ports & Adapters)**: Definición de puertos en la capa de aplicación/dominio y adaptadores en la capa de infraestructura.
3. **Tactical Domain Driven Design (DDD)**: Uso de Entidades, Value Objects, Servicios de Dominio y Repositorios.

### Dirección de Dependencias Permitida
Las dependencias fluyen estrictamente de afuera hacia adentro:
```
Presentation ──> Application ──> Domain
     │               │
     ▼               ▼
  Infrastructure (implementa contratos/ports)
```
* **Domain** no conoce nada de infraestructura, ni de base de datos, ni de protocolos (SSH, HTTP, etc.).
* **Application** sólo conoce contratos (Ports) y orquesta Casos de Uso.
* **Presentation** expone la API pública (Controllers, Routes).
* **Infrastructure** implementa los detalles concretos (adaptadores SSH, consultas SQL mediante Prisma, cache en Redis, etc.).

---

## Estructura de Directorios (`src/`)

### `domain/` (Núcleo)
Representa el corazón del negocio y las reglas de GPON.
* `entities/`: Objetos de negocio con identidad (ej. `Ont`, `Olt`, `DiagnosticSession`).
* `value-objects/`: Atributos inmutables sin identidad propia (ej. `Serial`, `MacAddress`, `OpticalPower`).
* `enums/`: Enumerados de negocio (ej. `OntState`, `Manufacturer`).
* `repositories/`: Contratos de persistencia para el dominio.
* `exceptions/`: Excepciones de negocio tipadas (ej. `OntNotFoundError`).

### `application/`
Contiene los casos de uso (orquestación) que realizan operaciones del negocio.
* `use-cases/`: Clases con responsabilidad única y un único método público `execute()`.
* `ports/`: Interfaces/contratos que describen servicios externos o repositorios (ej. `OltConnectionPort`).
* `dto/`: Objetos de transferencia de datos limpios, sin lógica.

### `presentation/`
Expone el sistema al exterior (en este caso, n8n a través de REST).
* `controllers/`: Manejadores de HTTP, validan los DTOs de entrada y llaman a los casos de uso.
* `routes/`: Registro de endpoints y ruteo con Express.
* `middlewares/`: Autenticación, logging de peticiones, manejo global de errores.

### `infrastructure/`
Contiene las tecnologías específicas de persistencia, comunicación y red.
* `persistence/`: Repositorios concretos (ej. adaptadores de Prisma/PostgreSQL).
* `ssh/`: Gestión de conexiones SSH y pooling de sesiones.
* `olt/`: Implementación modular de adaptadores por fabricante (ej. `olt/huawei/`, `olt/vsol/`).
* `parsers/`: Traductores de respuestas CLI en strings planos a objetos tipados.

### `shared/`
Utilidades genéricas compartidas no vinculadas a lógica de negocio (ej. `logger`).

---

## Reglas de Fabricantes
Cada fabricante (Huawei, VSOL, ZTE, etc.) es completamente independiente.
* No se permiten condicionales como `if (manufacturer === 'Huawei')` fuera del `OltAdapterFactory` o de los adaptadores de infraestructura.
* Cada fabricante implementa su propio `OltAdapter`, sus `Commands`, sus `Parsers` y sus `Workflows` específicos en su propia carpeta bajo `infrastructure/olt/<fabricante>`.
