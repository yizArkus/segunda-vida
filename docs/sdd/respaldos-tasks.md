# Respaldos recibidos — Tasks SDD

Fecha: 2026-08-31. Spec 1.7.0 → 1.8.0. El Guardián autenticado ve quién dio fe de él (nombre + vouchText) en el tab Respaldos.

## Plan técnico (BMAD)

- **Business:** Protocolo de Respaldo del Guardián. El tab Respaldos muestra gente que da la cara; sellos de confianza sobre precio.
- **Model:** Sin entidad nueva. Proyección `GuardianBackingReceived` (nombre y nivel de quien respalda).
- **Architecture:** `GET /users/me/backings` (JWT), `BackingService`, Axios 65s, componentes en `/components/backings` (sin Fat Index).
- **Deployment:** Solo `GET /health` pasa a 1.8.0. Sin cambio de infra.

Riesgos: 401 sin JWT; Fat Index en `index.tsx`; DB in-memory (datos se pierden al reiniciar); hace falta un segundo usuario para ver lista no vacía.

## Tasks

- [x] Task 1 — Spec 1.8.0: `GET /users/me/backings`, DTO `GuardianBackingReceived`, auth, changelog.
  - Done: YAML alineado; `specVersion` y `api.version` = 1.8.0.
- [x] Task 2 — Backend: `BackingService.ListReceivedAsync` + Minimal API auth; health 1.8.0.
  - Done: `200` array (vacío o con nombre/vouchText); `401` sin token.
- [x] Task 3 — Types + Axios: `GuardianBackingReceived` y `fetchReceivedBackings` (65s).
  - Done: tipos y cliente coinciden con el spec.
- [x] Task 4 — Hook `useReceivedBackings`: fetch, loading, empty, error, 401 → login.
  - Done: lógica fuera de `index.tsx`.
- [x] Task 5 — UI: header, cards (nombre, vouchText, fecha, sello), estados lista/vacío/carga/error. Español.
  - Done: componentes en `frontend/components/backings/`.
- [x] Task 6 — Wire: tab `respaldos` va a la sección (ya no a Tesoros).
  - Done: `index.tsx` solo orquesta layout/scroll.
- [x] Task 7 — Verify: spec vs código, `/health` 1.8.0, empty + lista con datos de prueba.
  - Done: credenciales de demo documentadas abajo.

## Verify — cuentas de prueba (local, efímeras)

La BD in-memory se borra al reiniciar la API. Credenciales throwaway, no de producción.

Sembradas el 2026-08-31 contra `http://localhost:5000` (mientras esa instancia siga viva):

| Rol | Email | Password |
|-----|--------|----------|
| Recibe respaldos (login para el demo) | `ana.guardiana@secondra.dev` | `AnaDemo1` |
| Da fe (vouchText) | `luis.vecino@secondra.dev` | `LuisDemo1` |

Checks API:

- `GET /health` → `Healthy` / `1.8.0`
- `GET /users/me/backings` sin token → 401
- Ana sin respaldos → `[]`; después del vouch de Luis → card con nombre Luis Vecino + vouchText
- Luis → lista vacía (él da fe, no recibe)

Check UI: login como Ana → tab Respaldos → sección «Quién da la cara por ti» (no Tesoros).
