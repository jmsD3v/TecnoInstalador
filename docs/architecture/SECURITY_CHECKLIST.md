# Security Checklist — Hardening Completo

Este documento define los controles de seguridad que deben aplicarse a cualquier proyecto.
No depende del stack. No depende del framework. Es universal.

---

## 1. Hardening de Código

- Validaciones server-side estrictas
- Sanitización de inputs
- Tipado fuerte (TS)
- No confiar en el frontend
- Manejo seguro de errores (sin leaks)
- Rate limiting por endpoint
- Idempotencia en operaciones críticas
- Logs sin datos sensibles
- Evitar lógica sensible en el cliente
- No exponer claves ni tokens

---

## 2. Hardening de Autenticación

- MFA opcional
- Tokens cortos
- Rotación de refresh tokens
- Revocación inmediata
- Prevención de brute force
- Bloqueo temporal por intentos fallidos
- Password policies razonables
- JWT con claims mínimos
- No almacenar contraseñas en texto plano

---

## 3. Hardening de Autorización

- RLS estrictas en todas las tablas
- Policies por módulo
- Roles bien definidos
- Claims mínimos
- Auditoría de accesos
- No mezclar permisos en el frontend

---

## 4. Hardening de Base de Datos

- Tablas privadas por defecto
- RLS en todas las tablas
- No exponer service_role
- Vistas seguras
- Índices para evitar DoS por queries pesadas
- Backups automáticos
- Auditoría de cambios

---

## 5. Hardening de Infraestructura

- HTTPS obligatorio
- CSP estricta
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- CORS restrictivo
- No exponer puertos innecesarios
- No exponer paneles de admin
- Logs centralizados
- Monitoreo de errores

---

## 6. Hardening de Dependencias

- Dependabot / Renovate
- Escaneo de vulnerabilidades
- Versiones fijas
- Evitar paquetes desconocidos
- Revisar permisos de SDKs
- No usar librerías abandonadas

---

## 7. Hardening de Deploy

- Builds determinísticos
- Variables de entorno seguras
- No exponer claves en logs
- Rotación periódica de claves
- Deploys automáticos (CI/CD)
- Validación previa al deploy

---

## 8. Hardening de Observabilidad

- Logs centralizados
- Alertas por patrones sospechosos
- Métricas de auth
- Métricas de errores
- Trazas distribuidas
- Auditoría de acciones críticas

---

## 9. Hardening de Datos

- Encriptación en tránsito
- Encriptación en reposo
- No guardar datos sensibles innecesarios
- Tokenización cuando sea posible
- Políticas de retención
- Limpieza automática

---

## 10. Hardening de Procesos

- Revisiones de código
- ADRs para decisiones
- Documentación clara
- Backups probados
- Plan de recuperación
- Rotación de claves
- Gestión de incidentes

---

## Resultado esperado

Una aplicación resistente, observable, segura por diseño y preparada para fallar sin comprometer datos ni usuarios.
