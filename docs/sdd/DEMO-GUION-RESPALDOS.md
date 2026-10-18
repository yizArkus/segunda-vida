# Demo SDD — Respaldos (guion transparente)

Este archivo es el **guion hablado** para la demo. Las tasks de la feature se guardarán en vivo en `respaldos-tasks.md` durante la fase Tasks.

## Antes de empezar (2 min)

Decí al equipo:

> “Hoy no vamos a ‘pedirle magia a la IA’. Vamos a trabajar en cinco fases. En cada una paramos. Cuando haya tareas, **no se quedan solo en el chat**: las vamos a dejar escritas en el repo, en `docs/sdd/`, para que cualquiera las pueda abrir mañana.”

Checklist técnico:
- [ ] Backend en http://localhost:5000 (`/health` → 1.7.0)
- [ ] Frontend en http://localhost:8081
- [ ] Tab Respaldos todavía lleva a **Tesoros** (estado revertido a propósito)
- [ ] Chat nuevo en Cursor (Plan para Specify/Plan/Tasks; Agent/edición para Implement)
- [ ] Abrir en el explorer: `.cursor/skills/`, `specs/secondra-spec.yaml`, `docs/sdd/` (la carpeta puede crearse en Tasks)

---

## Fase 1 — Specify (¿qué queremos?)

**Prompt:**

```text
Usa las skills secondra-sdd y secondra-respaldos.
Spec canónico: ./specs/secondra-spec.yaml. BMAD manda. UI en español.

Feature: En Respaldos quiero ver quién dio fe de mí, con nombre y vouchText
(reseñas de confianza, no de producto).

Empieza por Specify. No implementes todavía.
```

**Qué pasa (humano):**  
El agente lee el plano (spec) y el código. Nos dice, en palabras simples, qué falta. Hoy debería decir: “podemos crear un respaldo (POST), pero no hay forma de listar los que me dieron a mí”.

**Qué mostrás:**  
- La app: Respaldos → Tesoros (el “bug” de demo).  
- El YAML: buscar `backings` → solo POST.

**No toca archivos de producto.** Paramás.

**Frase de cierre:**  
> “Specify terminó. Todavía no hay código nuevo. Solo entendimos el hueco.”

---

## Fase 2 — Plan (¿cómo lo hacemos?)

**Prompt:**

```text
Sigue con el Plan técnico BMAD.
Lista archivos a tocar y riesgos.
No codees todavía.
```

**Qué pasa (humano):**  
Armamos el mapa de obra: qué archivo del backend, qué del frontend, en qué orden. Como un presupuesto de trabajo, no una factura pagada.

**Qué mostrás:**  
La lista de archivos en el chat (spec, `BackingService`, `Program.cs`, types, hook, componentes, `index.tsx`).

**No toca archivos.** Paramás.

**Frase de cierre:**  
> “Ya sabemos el camino. Todavía no caminamos.”

---

## Fase 3 — Tasks (¿en qué trozos? + dejar rastro)

**Prompt (importante — transparencia):**

```text
Convierte el Plan en 6–7 tasks numeradas y verificables.
Orden: spec → backend → types/hooks → UI → wire → verify.

Después de listarlas en el chat, escríbelas en docs/sdd/respaldos-tasks.md
(crea la carpeta si no existe). Usa checkboxes [ ].
No implementes todavía. Cuando el archivo esté escrito, para y dime la ruta.
```

**Qué pasa (humano):**  
1. El agente escribe las tareas en el chat.  
2. **Las graba en el repo** en `docs/sdd/respaldos-tasks.md`.  
3. Se detiene.

**Qué mostrás al equipo (esto es el momento estrella):**  
Abrí el archivo en el editor:

> “Esto es lo que otras demos no muestran: las tasks no se evaporan con el chat. Quedan en Git. El equipo puede revisarlas, disputarlas o asignarlas sin volver a preguntarle a la IA.”

**Contenido esperado del markdown:** título, contexto corto, lista `[ ] Task 1…`, definition of done.

**No implementa código de producto.** Paramás.

**Frase de cierre:**  
> “Skill al empezar. Tasks en disco. Ahora sí, con permiso, construimos de a una.”

---

## Fase 4 — Implement (construir un trozo)

Repetí por cada task:

```text
Implementa SOLO la task N de docs/sdd/respaldos-tasks.md.
Al terminar, marca esa task como [x] en el mismo archivo.
Luego para y explica qué cambió y cómo verificarlo.
```

**Qué pasa (humano), task a task:**

| Task | En palabras simples | Archivos típicos |
|------|---------------------|------------------|
| 1 | Actualizamos el plano (spec) | `secondra-spec.yaml` |
| 2 | El servidor sabe listar respaldos | `BackingService.cs`, `Program.cs` |
| 3 | El front habla el mismo idioma que la API | `guardian.ts`, `guardianTrustApi.ts` |
| 4 | Un gancho que pide y guarda la lista | `useReceivedBackings.ts` |
| 5 | Pantalla: cards / vacío / cargando | `components/backings/*` |
| 6 | El tab Respaldos lleva a esa sección | `index.tsx` |

**Qué mostrás:**  
- Diff o archivo abierto.  
- `respaldos-tasks.md` con `[x]` avanzando (transparencia del progreso).

**Frase entre tasks:**  
> “Task N lista. No seguimos hasta que el equipo diga ok.”

---

## Fase 5 — Verify (¿cumplimos lo prometido?)

**Prompt:**

```text
Verify contra secondra-spec.yaml y docs/sdd/respaldos-tasks.md.
Lista qué falta. Sugiere checks manuales. No agregues features nuevas.
```

**Qué probás en vivo:**  
1. `/health` → versión alineada al spec (p. ej. 1.8.0).  
2. Login → tab **Respaldos** → sección de respaldos (ya no Tesoros).  
3. Empty state si no hay nadie.  
4. Todas las tasks en el md en `[x]` (o anotar lo pendiente).

**Engram (opcional, 30 s):**

```text
Guarda en Engram: decisión GET /users/me/backings, path docs/sdd/respaldos-tasks.md, next steps.
```

**Frase de cierre:**  
> “Spec = qué. Skills = cómo. Tasks en `docs/sdd` = rastro humano. Cursor = quién escribió el código. Engram = memoria entre días.”

---

## Prompts en cadena (copiar rápido)

1. Specify (arriba)  
2. Plan (arriba)  
3. Tasks → **escribir** `docs/sdd/respaldos-tasks.md`  
4. `Implementa SOLO la task 1…` (repetir)  
5. Verify (+ Engram opcional)

---

## Qué NO hacer en la demo

- Pedir “hazme toda la feature” de un golpe.  
- Implementar antes de que exista `respaldos-tasks.md`.  
- Editar skills/reglas en medio de la feature.  
- Decir que “gentle-ai construyó” — Cursor construyó siguiendo el método.
