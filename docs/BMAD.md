# Secondra — Marco BMAD

Documento de alineación para el producto **Secondra**: visión de negocio, modelo de datos central, arquitectura de software y estrategia de despliegue. El detalle técnico ejecutable (contratos, validaciones, enumeraciones) vive en `specs/secondra-spec.yaml` (Spec-Kit, fuente de la verdad para generación y CI).

---

## B — Business (negocio)

### Visión

Secondra impulsa la **economía circular** conectando personas que ofrecen bienes de segunda mano con quienes buscan alternativas sostenibles y asequibles. El valor central es **alargar la vida útil** de los objetos, reducir residuos y facilitar intercambios locales de confianza.

### Objetivos de negocio (orientación)

- Facilitar la publicación y descubrimiento de artículos usados o en buen estado.
- Priorizar la **proximidad** (ubicación) y un canal de contacto directo (**WhatsApp**) para cerrar acuerdos fuera de la app si se desea.
- Escalar el catálogo y el tráfico sin comprometer claridad de datos ni cumplimiento futuro (moderación, reportes, métricas de impacto ambiental).

### Alcance MVP implícito

Catálogo de **Items** con precio, categoría, estado del artículo y metadatos de contacto; API REST mínima para listar y crear ítems; cliente móvil/web unificado con Expo.

---

## M — Model (modelo de datos)

### Entidad núcleo: `Item`

Representa un artículo en venta o intercambio. Es el agregado principal del dominio en esta fase.

| Concepto     | Rol |
|-------------|-----|
| Identidad   | `Id` único, estable para enlaces y sincronización. |
| Catálogo    | `Name`, `Description`, `Price`, `Category`, `Condition`. |
| Contexto local | `Location` (texto libre o normalizado en evoluciones futuras). |
| Contacto    | `WhatsApp` (canal preferido para negociación). |
| Auditoría   | `CreatedAt` para ordenación y reporting. |

Las enumeraciones (`Category`, `Condition`), tipos y reglas de validación están **congeladas** en `specs/secondra-spec.yaml` para evitar divergencias entre backend, app y generadores.

### Evolución (escalabilidad del modelo)

- Nuevas entidades (p. ej. `User`, `Favorite`, `Conversation`) se documentan en el Spec-Kit y versionan con `specVersion`.
- `Item` puede ganar `SellerId`, imágenes múltiples o estado de publicación sin romper el contrato si se añaden campos opcionales y se sube la versión del spec.

---

## A — Architecture (arquitectura)

### Panorama híbrido

| Capa        | Tecnología | Responsabilidad |
|------------|------------|-----------------|
| Cliente    | **Expo (React Native)** + web | UI, formularios, listados, deep links a WhatsApp; un solo código base para iOS, Android y web cuando aplique. |
| API        | **.NET 8** (ASP.NET Core) | REST, validación, persistencia, autenticación futura. |
| Datos      | Base relacional (p. ej. PostgreSQL en producción) | Tabla `Items` alineada al Spec-Kit; migraciones versionadas. |

### Principios

- **Contrato primero**: OpenAPI / DTOs derivados del Spec-Kit (`secondra-spec.yaml`).
- **Sin lógica de negocio duplicada**: reglas de validación documentadas en el spec y aplicadas en el servidor; el cliente refleja mensajes coherentes.
- **Preparado para crecimiento**: API stateless, despliegue en contenedor, posible CDN para assets estáticos y colas para trabajos async en fases posteriores.

### Integración cliente ↔ API

- Transporte HTTPS + JSON.
- Versionado de API recomendado (`/v1/...` en evolución; el spec puede fijar `basePath`).
- Errores estructurados (códigos HTTP + cuerpo con detalles de validación) para que Expo muestre feedback uniforme.

---

## D — Deployment (despliegue)

### Objetivo

Entornos **reproducibles** (Docker) y nube **AWS** para producción y, opcionalmente, staging.

### Contenedores

- **API .NET 8**: imagen multi-stage (build + runtime), variables de entorno para cadena de conexión y secretos.
- **Base de datos**: RDS PostgreSQL (o Aurora compatible) en AWS; backups y parámetros en infra como código cuando el proyecto lo adopte.
- **Frontend Expo**: builds EAS para stores; hosting web estático (S3 + CloudFront) si se publica la variante web.

### AWS (referencia)

| Componente    | Uso típico |
|---------------|------------|
| ECS Fargate / EKS | Orquestación de la API en contenedor. |
| ALB           | Terminación TLS y enrutamiento al servicio API. |
| RDS           | PostgreSQL para `Items` y futuras tablas. |
| Secrets Manager / SSM | Cadenas de conexión y claves. |
| CloudWatch    | Logs y métricas. |

### Pipeline (visión)

Build → tests → escaneo de imagen → despliegue blue/green o rolling según el orquestador elegido. El Spec-Kit puede validarse en CI (lint del YAML, compatibilidad de versiones) antes de merge.

---

## Relación con Spec-Driven Development

1. **Cambio de contrato** → actualizar `specs/secondra-spec.yaml` primero.
2. **Generación o implementación manual** → .NET (controladores, DTOs, FluentValidation/IDataAnnotations) y tipos TypeScript en Expo alineados al spec.
3. **Revisiones** → diff del spec como review obligatorio para cambios de API o modelo.

---

## Referencias internas

| Recurso | Descripción |
|---------|-------------|
| `specs/secondra-spec.yaml` | Spec-Kit técnico (entidad Item, API, validaciones). |
| `specs/infra-spec-kit.yaml` | Vista infra legada/resumen; consolidar o deprecar según decisión de equipo. |
