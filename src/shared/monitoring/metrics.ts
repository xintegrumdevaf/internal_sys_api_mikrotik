import { Registry, collectDefaultMetrics, Counter, Histogram } from "prom-client"
import type { Request, Response, NextFunction } from "express"

export const register = new Registry()

// Habilitar recolección de métricas por defecto del runtime Node.js (CPU, memoria, GC, event loop lag)
collectDefaultMetrics({
  register,
  prefix: "mikrotik_api_"
})

// Métrica: Total de peticiones HTTP procesadas
export const httpRequestsTotal = new Counter({
  name: "mikrotik_api_http_requests_total",
  help: "Total de peticiones HTTP procesadas por método, ruta y código de estado",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
})

// Métrica: Duración de peticiones HTTP en segundos
export const httpRequestDurationSeconds = new Histogram({
  name: "mikrotik_api_http_request_duration_seconds",
  help: "Duración de las peticiones HTTP en segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register]
})

// Métrica: Total de operaciones ejecutadas contra routers MikroTik
export const mikrotikOperationsTotal = new Counter({
  name: "mikrotik_api_operations_total",
  help: "Total de operaciones ejecutadas en MikroTik RouterOS",
  labelNames: ["sector", "operation", "status"],
  registers: [register]
})

// Métrica: Total de operaciones sobre OLTs
export const oltOperationsTotal = new Counter({
  name: "mikrotik_api_olt_operations_total",
  help: "Total de operaciones ejecutadas en OLTs (Huawei, VSOL, CData, Kingtype)",
  labelNames: ["brand", "operation", "status"],
  registers: [register]
})

/**
 * Middleware Express para instrumentación automática de peticiones HTTP en Prometheus
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Ignorar métricas y health checks para no ensuciar las estadísticas
  if (req.path === "/metrics" || req.path === "/health") {
    next()
    return
  }

  const start = process.hrtime()

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = seconds + nanoseconds / 1e9

    // Normalizar ruta para evitar alta cardinalidad de URLs dinámicas
    const route = req.baseUrl || req.route?.path || req.path || "unknown"
    const statusCode = String(res.statusCode)

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode
    })

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route,
        status_code: statusCode
      },
      duration
    )
  })

  next()
}

/**
 * Endpoint handler para exponer métricas en formato estándar de Prometheus
 */
export async function getMetricsHandler(_req: Request, res: Response): Promise<void> {
  res.set("Content-Type", register.contentType)
  const metrics = await register.metrics()
  res.end(metrics)
}
