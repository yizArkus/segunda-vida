# Guía de operación del sistema (AWS)

**Audiencia:** personas que operan el sistema en el día a día (no es un manual de desarrollo).  
**Alcance:** despliegues, incidentes, visibilidad y accesos en AWS (ECS Fargate, Bastion, ECS Exec, Dev/Prod).

> **Importante:** Los campos marcados con `[COMPLETAR]` deben rellenarse con los valores reales de su organización (URLs, nombres de cluster, cuentas IAM, etc.).

---

## Resumen rápido

| Ambiente | Uso típico | Riesgo |
|----------|------------|--------|
| **Development** | Pruebas, validaciones antes de producción | Bajo |
| **Production** | Usuarios finales | **Alto** — cualquier cambio afecta a clientes |

---

## 1. Deployments

### 1.1 Cómo desplegar el backend a producción

1. Confirmar que **Development** ya tiene la versión deseada y probada (no desplegar a producción “a ciegas”).
2. [COMPLETAR] seguir el flujo acordado: **pipeline CI/CD** (por ejemplo, merge a rama `main` / tag / botón “Deploy” en la herramienta que usen).
3. Localizar el **servicio ECS** de backend en **Production** (misma región y cuenta que el resto).
4. Lanzar la actualización de la tarea (nueva imagen de contenedor o nueva revisión de tarea).
5. Esperar a que el despliegue termine en estado **“Completed”** o equivalente (sin errores en el despliegue).
6. Ir a la sección **3** y **4** de este documento para validar salud y logs.

**Nota:** El detalle exacto (botón, pipeline, nombre del pipeline) depende de cómo esté montado el repo de infraestructura — debe quedar documentado en `[COMPLETAR: enlace o nombre del pipeline]`.

### 1.2 Cómo desplegar el frontend a producción

1. Mismo criterio: **validar antes en Development** cuando sea posible.
2. [COMPLETAR] desplegar según su cadena (S3 + CloudFront, Amplify, otro) — suele ser **subir build** o **pipeline automático** desde la rama de producción.
3. Si usan **CDN (CloudFront)**, puede hacer falta **invalidar caché** para que los usuarios vean la versión nueva; [COMPLETAR] quién lo hace y en qué consola.
4. Comprobar el sitio en navegador (página principal, login si aplica) — ver **1.4**.

### 1.3 Diferencia: Development vs Production

| Aspecto | Development | Production |
|---------|-------------|------------|
| **Propósito** | Pruebas internas, integración | Uso real |
| **Datos** | Pueden ser de prueba | Datos reales — **más cuidado** |
| **Riesgo** | Errores afectan menos usuarios | Errores impactan a clientes |
| **Ramas / triggers** | [COMPLETAR] | [COMPLETAR] |

**Regla práctica:** tratar **Production** como “sensible”: menos cambios espontáneos, más verificación previa.

### 1.4 Cómo verificar que el deploy fue exitoso

**Backend (API)**

- [ ] En la consola de **ECS**, servicio de producción: tareas en estado **Running**, revisión desplegada la esperada.
- [ ] Llamar al endpoint de salud (si existe): [COMPLETAR] `GET https://.../health` → respuesta OK.
- [ ] Si hay **Swagger** en prod: [COMPLETAR] URL abre y lista operaciones (solo si está expuesto en política de seguridad).

**Frontend**

- [ ] Abrir la **URL pública** del sitio (ver sección 5).
- [ ] Navegación básica: carga, login, una pantalla crítica.
- [ ] (Opcional) Prueba en ventana privada o tras invalidar caché para evitar ver una versión vieja.

**Señales de fallo**

- Errores 5xx al usar la app.
- Servicio ECS con tareas que **no arrancan** o reinicios constantes.
- Alarmas de CloudWatch (si están configuradas) en estado **ALARM**.

---

## 2. Manejo de fallas

### 2.1 Qué hacer si un deploy falla

1. **No asumir** que el sistema quedó bien: revisar el estado del servicio en **ECS**.
2. Leer el **mensaje de error** del pipeline o de la consola (a veces indica imagen incorrecta, límite de recursos, etc.).
3. Si el servicio quedó en mal estado, valorar **rollback** (2.2).
4. Anotar **hora**, **quién** desplegó y **qué cambió** (para comunicación interna o con soporte).

### 2.2 Cómo hacer rollback

**ECS Fargate (backend)**

1. En **ECS** → cluster → servicio → pestaña de **despliegues** / **revisiones**.
2. Identificar la **última revisión de tarea que funcionaba bien**.
3. Forzar una nueva implementación usando esa **revisión anterior** (o la imagen anterior documentada), según el procedimiento de su equipo.

**Frontend**

- Depende del hosting: [COMPLETAR] (por ejemplo, versión anterior en S3, rollback en Amplify, o redeploy de tag anterior).

**Comunicación**

- Si Production quedó inestable, avisar a **stakeholders** según el protocolo interno.

### 2.3 Cómo validar que el sistema funciona correctamente

**Checklist rápido (post-incidente o tras deploy)**

| # | Comprobación | ¿OK? |
|---|----------------|------|
| 1 | API health / respuesta esperada | ☐ |
| 2 | Login o flujo principal en el cliente web | ☐ |
| 3 | Operación de negocio crítica (ej. alta de recurso, consulta) | ☐ |
| 4 | ECS: tareas estables, sin reinicios en bucle | ☐ |
| 5 | Logs sin errores repetidos en el último minuto (ver §3) | ☐ |

---

## 3. Visibilidad del sistema

### 3.1 Cómo ver logs

**Backend (contenedores en ECS)**

1. **AWS Console** → **ECS** → cluster → servicio → pestaña de **Logs** (si está integrado con **CloudWatch Logs**).
2. O **CloudWatch** → **Log groups** → grupo asociado al servicio de backend [COMPLETAR nombre del grupo].
3. Filtrar por tiempo y por **ERROR** / **Exception** si la herramienta lo permite.

**Frontend**

- Si el frontend es estático: los “logs” del usuario suelen ser **errores de red** y **consola del navegador** (F12 → Consola / Red).
- **CloudFront** (si aplica): métricas de 4xx/5xx; **S3** logs opcionales [COMPLETAR].

### 3.2 Cómo verificar el estado de los servicios

- **ECS:** servicio → tareas **Running** / deseadas; eventos recientes del servicio.
- **CloudWatch** (si hay alarmas): estado **OK** vs **ALARM**.
- [COMPLETAR] **dashboard** o panel único que el equipo use.

### 3.3 Cómo saber si algo está caído

1. **Prueba desde fuera:** abrir URL del frontend y probar API health (§5).
2. **Consola ECS:** ¿hay tareas `0/1` Running o despliegues fallidos?
3. **Alarmas** (si existen): correos o chat de alerta.
4. **Dependencias externas:** [COMPLETAR] (por ejemplo, base de datos, auth de terceros).

---

## 4. Accesos clave

### 4.1 Base de datos (vía Bastion)

**Idea general:** la base de datos **no** suele estar expuesta a Internet; se entra por un **servidor Bastion** (salto) en la misma red de AWS.

Pasos típicos (ajustar a su documentación interna):

1. Tener **VPN** o **Session Manager** (SSM) si así está definido [COMPLETAR].
2. Conectarse al **Bastion** con la clave o método aprobado por su organización.
3. Desde el Bastion, usar el cliente de base de datos (`psql` para PostgreSQL, etc.) con el **host interno** de la base de datos (no la IP pública).
4. Usar usuario/contraseña **rotadas** y almacenadas en **Secrets Manager** o equivalente [COMPLETAR].

**Riesgos**

- ⚠️ **No** compartir credenciales por correo no cifrado.
- ⚠️ **No** ejecutar cambios destructivos en **Production** sin ventana y sin respaldo.

### 4.2 Acceso a contenedores (ECS Exec)

**Para qué sirve:** abrir una sesión interactiva **dentro** de una tarea Fargate (diagnóstico, comandos de lectura).

Pasos típicos:

1. **AWS CLI** instalado y perfil configurado con permisos adecuados.
2. Comando `aws ecs execute-command` (parámetros: cluster, servicio, task id) [COMPLETAR: plantilla exacta que use el equipo].
3. **Solo** en horarios y con **autorización** según política de la empresa.

**Riesgos**

- ⚠️ **No** usar Exec para “arreglar datos” a mano sin procedimiento; preferir **cambios controlados** y reversibles.

### 4.3 Permisos que necesita quien opera

| Permiso / rol | Uso típico |
|---------------|------------|
| Lectura en **ECS** (servicios, tareas, eventos) | Ver estado y despliegues |
| Lectura en **CloudWatch Logs** | Ver logs |
| [COMPLETAR] **Deploy** (CI/CD o ECS UpdateService) | Solo personas autorizadas |
| **ECS Exec** (SSM) | Diagnóstico avanzado — limitado |
| **Bastion / DB** | Muy restringido — suele ser DBA o equipo de plataforma |

> El equipo de seguridad o cloud debería asignar **roles IAM** con el mínimo necesario (principio de menor privilegio).

---

## 5. Inventario de endpoints

*Rellenar con los valores reales de producción y desarrollo.*

### Production

| Recurso | URL | Notas |
|---------|-----|--------|
| API base | [COMPLETAR] | |
| Health | [COMPLETAR] | Ej. `GET /health` |
| Swagger / OpenAPI | [COMPLETAR] o *No expuesto* | Solo si la política lo permite |
| Frontend (sitio web) | [COMPLETAR] | |
| Otros | [COMPLETAR] | Webhooks, etc. |

### Development

| Recurso | URL | Notas |
|---------|-----|--------|
| API base | [COMPLETAR] | |
| Health | [COMPLETAR] | |
| Swagger | [COMPLETAR] | |
| Frontend | [COMPLETAR] | |

---

## 6. Repositorios

| Repositorio | Contenido principal | Notas |
|-------------|----------------------|--------|
| [COMPLETAR] URL o nombre | Backend | Código API, Dockerfile |
| [COMPLETAR] | Frontend | Web, build |
| [COMPLETAR] | Infraestructura (IaC) | ECS, redes, Bastion, pipelines |

---

## Acciones críticas y riesgos (resumen)

| Acción | Riesgo | Recomendación |
|--------|--------|---------------|
| **Desplegar a Production sin probar en Development** | Alto | **Evitar.** Flujo recomendado: Dev → validación → Prod. |
| **Rollback tardío** | Medio/Alto | Tener identificada la **revisión anterior estable** antes de grandes cambios. |
| **Cambios directos en BD de producción** | Alto | Solo con **procedimiento**, respaldo y **ventana**. |
| **Compartir credenciales** | Alto | Usar **gestor de secretos** y roles IAM. |
| **Invalidar caché CDN** | Medio | Tras deploy de frontend, si no se invalida, los usuarios pueden ver **versión vieja**. |

---

## Contactos y escalado

| Rol | Nombre / canal | Cuándo contactar |
|-----|----------------|------------------|
| [COMPLETAR] | | Caídas de producción |
| [COMPLETAR] | | Infra / AWS |
| [COMPLETAR] | | Aplicación / producto |

---

*Documento generado como plantilla de handoff. Actualizar los campos `[COMPLETAR]` y revisar con el equipo de infraestructura antes de entregar al cliente.*
