# Network Automation & Diagnostic API — Guía de Arquitectura y Referencia

Esta API es una plataforma de automatización y diagnóstico de red para ISPs que integra la gestión de **Capa 2 / GPON (OLTs Huawei, V-SOL, C-Data, Kingtype)** y **Capa 3 / Tráfico y Facturación (MikroTik RouterOS)** bajo una **Arquitectura Hexagonal (Puertos y Adaptadores)** estricta en Node.js y TypeScript.

---

## 1. Estructura de Directorios y Responsabilidades

```
src/
├── domain/                  # 1. CAPA DE DOMINIO (Núcleo de Negocio Puro)
│   ├── diagnostic/          # Entidades, enums y repositorios del motor de diagnóstico
│   ├── mikrotik/            # Entidades, enums y excepciones de RouterOS (Habilitado/Cortado)
│   └── olt/                 # Entidades ONT, estados administrativos/operativos, marcas OLT
│
├── application/             # 2. CAPA DE APLICACIÓN (Casos de Uso y Orquestación)
│   ├── diagnostic/          # Analizadores técnicos, motor de diagnóstico, workflow handlers
│   ├── mikrotik/            # Casos de uso (Consultar Estado, Reactivar, Cortar) y DTOs
│   ├── olt/                 # Casos de uso (Datos Técnicos, Estado de Dispositivo, Reactivar) y DTOs
│   └── ports/               # Contratos/Interfaces (OltAdapterPort, MikrotikServicePort)
│
├── infrastructure/          # 3. CAPA DE INFRAESTRUCTURA (Hardware y Adaptadores Externos)
│   ├── db/prisma/           # Persistencia de sesiones de diagnóstico con Prisma ORM / Postgres
│   ├── mikrotik/            # Adaptador SSH RouterOS y parsers de Firewall Address-List
│   ├── olt/                 # Adaptadores de hardware GPON (Huawei, VSol, CData, Kingtype)
│   └── ssh/                 # Servicio de comunicación SSH de bajo nivel con streams y ANSI stripping
│
├── presentation/            # 4. CAPA DE PRESENTACIÓN (Entrada HTTP REST)
│   ├── controllers/         # Controladores Express (OltController, MikrotikController, DiagnosticController)
│   ├── middlewares/         # Middleware global de manejo de excepciones de dominio y validación
│   ├── routers/             # Enrutadores Express (/api/v1/olt, /api/v1/mikrotik, /api/v1/diagnostic)
│   └── validators/          # Validadores de payload con tipado estricto
│
├── container/               # 5. COMPOSITION ROOT (Inyección de Dependencias)
│   └── index.ts             # Instanciación e inyección de todas las dependencias
│
├── config/                  # 6. CONFIGURACIÓN
│   └── sectors.ts           # Definición de sectores, credenciales e IPs de OLTs/Routers
│
├── shared/                  # 7. ELEMENTOS COMPARTIDOS
│   ├── errors/              # Clase base DomainError
│   └── utils/               # Logger con formato ANSI y niveles INFO, SUCCESS, WARN, ERROR
│
├── app.ts                   # Configuración del servidor Express y montaje de rutas
└── server.ts                # Punto de entrada de la aplicación
```

---

## 2. Los Dos Niveles de Operación de Red

| Dimensión | Capa OLT (`/api/v1/olt/`) | Capa MikroTik (`/api/v1/mikrotik/`) |
| :--- | :--- | :--- |
| **Capa de Red** | Capa 2 (Enlace Físico y GPON) | Capa 3 (IP, Tráfico y Facturación) |
| **Identificador** | `serial` de la ONT + `pon` | `ip` del cliente (IPv4) |
| **Hardware** | OLT (Huawei, VSOL, C-Data, Kingtype) | Router MikroTik (RouterOS) |
| **Diagnóstico** | Potencia óptica (dBm), cable roto (LOS), módem encendido | Lista de Firewall (`Habilitado` vs `CORTADO`) |
| **Reactivación** | Activa el puerto ONT en la OLT | Mueve la IP a la lista `Habilitado` en RouterOS |

---

## 3. Catálogo de Endpoints REST

### Módulo de Monitoreo & Salud (`Prometheus & Grafana`)

#### 1. Endpoint de Métricas Prometheus
* **Ruta**: `GET /metrics`
* **Formato**: `text/plain; version=0.0.4` (OpenMetrics)
* **Métricas Recolectadas**:
  * `mikrotik_api_http_requests_total`: Contador de peticiones por método, ruta y código de estado.
  * `mikrotik_api_http_request_duration_seconds`: Histograma de latencia HTTP.
  * `mikrotik_api_operations_total`: Total de operaciones ejecutadas contra RouterOS por sector y resultado.
  * `mikrotik_api_olt_operations_total`: Total de operaciones sobre OLTs por marca y resultado.
  * **Runtime Node.js**: Uso de memoria Heap/RSS, Event Loop lag, recolección de basura (GC) y CPU.

* **Ejemplo de configuración en `prometheus.yml`**:
```yaml
scrape_configs:
  - job_name: "mikrotik_api"
    metrics_path: "/metrics"
    scrape_interval: 10s
    static_configs:
      - targets: ["host.docker.internal:3001"]
```

#### 2. Health Check
* **Ruta**: `GET /health`
* **Response**: `{ "status": "ok" }`

---

### Módulo MikroTik (`/api/v1/mikrotik`)


#### 1. Consulta de Estado de Cliente en MikroTik
* **Ruta**: `POST /api/v1/mikrotik/client-status`
* **Request**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.14.6"
}
```
* **Response (HTTP 200)**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.14.6",
  "status": "CORTADO",
  "clientName": "BERNAL LOJA LIDIA TARCILA",
  "list": "CORTADO",
  "creationTime": "2026-08-24 15:59:48",
  "canBeReactivated": true,
  "reason": "El cliente (BERNAL LOJA LIDIA TARCILA) se encuentra Cortado en la lista 'CORTADO'."
}
```

#### 2. Reactivación de Cliente en MikroTik
* **Ruta**: `POST /api/v1/mikrotik/reactivate`
* **Request**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.14.6"
}
```
* **Response (HTTP 200)**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.14.6",
  "success": true,
  "previousStatus": "CORTADO",
  "currentStatus": "HABILITADO",
  "message": "Cliente con IP 10.100.14.6 reactivado exitosamente a la lista 'Habilitado'.",
  "executedAt": "2026-08-31T15:00:00.000Z"
}
```

#### 3. Corte Comercial en MikroTik
* **Ruta**: `POST /api/v1/mikrotik/cut`
* **Request**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.11.19"
}
```
* **Response (HTTP 200)**:
```json
{
  "sector": "totoracocha",
  "ip": "10.100.11.19",
  "success": true,
  "previousStatus": "HABILITADO",
  "currentStatus": "CORTADO",
  "message": "Cliente con IP 10.100.11.19 colocado en la lista 'CORTADO' exitosamente.",
  "executedAt": "2026-08-31T15:00:00.000Z"
}
```


---

### Módulo OLT (`/api/v1/olt`)

#### 1. Consulta de Estado Físico y Administrativo en OLT
* **Ruta**: `POST /api/v1/olt/device-status`
* **Request**:
```json
{
  "sector": "totoracocha",
  "oltName": "olt_huawei_principal",
  "pon": "0",
  "serial": "4857544312345678"
}
```
* **Response (HTTP 200)**:
```json
{
  "brand": "HUAWEI",
  "serial": "4857544312345678",
  "pon": "0",
  "ontId": 5,
  "administrativeStatus": "DISABLED",
  "operationalStatus": "OFFLINE",
  "opticalPower": -19.45,
  "canBeReactivated": true,
  "reason": "ONT deshabilitada administrativamente en la OLT.",
  "recommendation": "Ejecutar reactivación de la ONT."
}
```

#### 2. Reactivación de ONT en OLT
* **Ruta**: `POST /api/v1/olt/reactivate`
* **Request**:
```json
{
  "sector": "totoracocha",
  "oltName": "olt_huawei_principal",
  "pon": "0",
  "serial": "4857544312345678"
}
```

---

## 4. Compilación y Ejecución

* **Desarrollo (Hot Reload)**:
  ```bash
  pnpm run dev
  ```
* **Compilación a Producción**:
  ```bash
  pnpm run build
  ```
  *(Compila TypeScript hacia la carpeta `dist/` manteniendo `src/` 100% limpio).*
* **Ejecutar en Producción**:
  ```bash
  pnpm run start
  ```
