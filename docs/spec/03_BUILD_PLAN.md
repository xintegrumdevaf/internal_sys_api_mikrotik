# Network Automation API - Build Plan

Este documento detalla el plan de implementación técnica secuencial para el despliegue del proyecto.

## Etapa 0: Estructuración de Specs y Directrices
* [x] Crear el directorio `docs/spec` y migrar la documentación antigua.
* [x] Definir las reglas universales en `AGENTS.md` y `.agents/rules/GEMINI.md`.
* [x] Eliminar el directorio de configuración antiguo `.opencode`.

## Etapa 1: Dockerización de la Aplicación
* [ ] Crear el `Dockerfile` optimizado (multi-stage, `pnpm`, Node.js LTS).
* [ ] Integrar la ejecución automática de migraciones de Prisma en el arranque.
* [ ] Configurar el puerto por defecto a `3001` para no colisionar con otros servicios en la VPS.
* [ ] Crear un archivo `docker-compose.yml` para facilitar simulaciones locales y despliegue rápido.

## Etapa 2: CI/CD con GitHub Actions
* [ ] Crear el workflow `.github/workflows/deploy.yml` para ejecutar typecheck, lint y build en las ramas `main` y `test`.
* [ ] Configurar el disparo automático de webhook de Coolify tras un despliegue exitoso.
