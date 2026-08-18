# Network Automation API - Coding Standards & API Specifications

## Objetivo
Establecer convenciones obligatorias de desarrollo y diseño de API para garantizar consistencia y legibilidad a lo largo del tiempo.

---

## 1. Convenciones de TypeScript y Tipado
* **Modo Estricto**: Configurado de forma obligatoria en `tsconfig.json`. Está prohibido desactivar directivas como `strictNullChecks` o `noImplicitAny`.
* **Prohibido el uso de `any`**: Todo debe estar fuertemente tipado. Evitar `Record<string, any>`, `Object` o `{}`.
* **Declaración de Retorno**: Toda función o método público debe declarar explícitamente su tipo de retorno.
* **Tipos vs Interfaces**:
  * Utilizar `interface` para representar contratos o puertos.
  * Utilizar `type` únicamente para uniones de tipos, intersecciones, tipos mapeados o tipos utilitarios.

---

## 2. Organización del Código y Clases
* **Responsabilidad Única**: Cada clase o función debe hacer una sola cosa.
* **Tamaño Limite**: Las clases no deben superar las 300 líneas de código y las funciones idealmente deben ser menores a 40 líneas.
* **Casos de Uso**: Deben tener un único método público llamado `execute()`.
* **Constructores**: Únicamente reciben e inyectan dependencias. No deben ejecutar lógica o llamadas asíncronas en su interior.
* **Sufijos de Nomenclatura**: Las clases deben finalizar con su rol correspondiente: `UseCase`, `Repository`, `Adapter`, `Factory`, `Parser`, `Mapper`, `Validator`, `Controller`, `Middleware`, `Strategy`, `Port`.

---

## 3. Manejo de Errores y Excepciones
* **No lanzar excepciones genéricas**: Prohibido usar `throw new Error()`.
* **Excepciones de Dominio**: Siempre utilizar excepciones tipadas del dominio (ej. `OntNotFoundError`, `SessionExpiredError`).
* **Logs de Excepciones**: Toda excepción capturada en infraestructura o middlewares debe pasar por el logger oficial de la aplicación (`Logger.error`), nunca usar `console.log` o `console.error`.

---

## 4. API REST Specifications
La API es consumida únicamente por **n8n**, por lo que se priorizan contratos JSON limpios y estables.

### Diseño de Endpoints
* **Recursos**: Utilizar nombres en plural para los recursos (ej. `/api/v1/diagnostics`, `/api/v1/sessions`).
* **Verbos HTTP**:
  * `GET`: Consultar información (operación segura e idempotente).
  * `POST`: Iniciar acciones, procesos de red o crear recursos.
  * `DELETE`: Eliminar o desaprovisionar recursos.
* **Estructura de Respuesta Exitosa**: Evitar envoltorios genéricos como `{ success: true, data: ... }`. Retornar directamente el DTO tipado.
* **Estructura de Error**:
  ```json
  {
    "code": "ONT_NOT_FOUND",
    "message": "La ONT con el serial especificado no fue encontrada."
  }
  ```
* **Códigos de Estado HTTP**:
  * `200 OK`: Consulta exitosa.
  * `201 Created`: Recurso creado con éxito.
  * `202 Accepted`: Acción encolada o proceso largo iniciado.
  * `400 Bad Request`: Error en validación de parámetros (DTO).
  * `404 Not Found`: Recurso no encontrado.
  * `422 Unprocessable Entity`: Regla de negocio rota (ej. potencia fuera de rangos permitidos).
