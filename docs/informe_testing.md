# Informe de Testing y Validación — Analizador de Chat de WhatsApp

**Chat de prueba usado:** `Chat_de_WhatsApp_con_Grupo_Ing__de_soft__3.txt`

---

## 1. Pruebas con chat real

Se ejecutó el flujo completo `validator.js → parser.js → metrics.js` sobre el archivo real exportado de WhatsApp (Android, formato D/M/YYYY HH:MM).

**Resultado: el sistema no rompe.** Procesó las 308 líneas sin errores, incluyendo:

- 3 mensajes de sistema (cifrado de extremo a extremo, creación del grupo, ingreso al grupo) → correctamente descartados, no se asignan a ningún usuario.
- 6 mensajes multilínea (saltos de línea dentro de un mismo mensaje, ej. los datos de GitHub de Noelia y Agustín) → correctamente concatenados al mensaje anterior.
- 1 mensaje con etiqueta `<Se editó este mensaje.>` → la etiqueta se eliminó correctamente y el contenido quedó limpio ("Evitamos pensar de más también xd").
- 7 mensajes `<Multimedia omitido>` → detectados y marcados con `esMultimedia: true`.
- 0 mensajes `Se eliminó este mensaje.` en este chat (no había ninguno).
- Emojis dentro de mensajes (👍, 😉, ✨) → detectados y contados correctamente.

---

## 2. Validación de coherencia de métricas

Se realizó un conteo manual sobre el `.txt` original y se comparó contra la salida de `metrics.js`.

| Verificación | Conteo manual | Resultado del sistema | ¿Coincide? |
|---|---|---|---|
| Mensajes de Ivana | 104 | 104 | ✅ |
| Mensajes de Diego | 48 | 48 | ✅ |
| Mensajes de Agas | 62 | 62 | ✅ |
| Mensajes de Noelia | 75 | 75 | ✅ |
| Suma del ranking (M1) | 289 | 104+75+62+48 = 289 | ✅ |
| Suma de mensajes por hora (M3) | 289 | 289 | ✅ |
| Suma de mensajes por día de semana (M4) | 289 | 289 | ✅ |
| Mensajes el 13/4/2026 (top 1 del top5 días) | 46 | 46 | ✅ |
| Apariciones de 👍 en el chat | 19 | 19 (1° en ranking de emojis) | ✅ |
| Palabra más frecuente en word cloud (M5) | "buenas": 25 | "buenas": 25 | ✅ |

**Top 1 de cada métrica (M1–M5):**
- M1 — Usuario con más mensajes: **Ivana (104)**, correcto, ranking ordenado de mayor a menor.
- M2 — Emoji más usado: **👍 (19)**, muy por encima del segundo (😉, 1) y tercero (✨, 1).
- M3 — Hora pico: **20:00–20:59 (47 mensajes)**.
- M4 — Día con más mensajes: **13/4/2026 (46)**; día de la semana con más actividad: **Martes (103)**.
- M5 — Palabra más frecuente: **"buenas" (25)**. El top 50 incluye palabras como "clase", "viernes", "tareas", "trello" y "github", que reflejan fielmente el contenido del chat. Las stopwords están correctamente excluidas, las menciones y URLs no aparecen, y todas las palabras están normalizadas a minúsculas.

**Conclusión:** todas las métricas verificadas son **consistentes y correctas**.

---

## 3. Testing de interfaz de usuario (UI)

Se recorrió la app completa simulando el flujo de un usuario final (carga de archivo → visualización de resultados).

### Funciona correctamente
- Carga de archivo `.txt` vía click sobre la tarjeta de carga.
- Mensaje de estado actualizado: "¡Éxito! Se detectaron 4 usuarios y 289 mensajes."
- Tabla de participantes y ranking de mensajes se renderizan correctamente.
- Tabla de horas (0-23) y gráfico de barras "Mensajes por Hora".
- Tabla de top 5 días y de actividad por día de semana.
- Tabla de ranking de emojis se completa correctamente.
- Nube de palabras se genera con tamaños proporcionales a la frecuencia.
- Manejo de errores: si se sube un archivo que no es `.txt`, vacío, o que no respeta el formato de WhatsApp, `validator.js` lanza el error correspondiente.

---

## Resumen final

| Aspecto | Estado |
|---|---|
| El sistema procesa un chat real sin romperse | ✅ OK (289/289 mensajes, sin errores) |
| Casos especiales (multimedia, editado, multilínea, sistema) | ✅ Todos manejados correctamente |
| Coherencia de métricas (M1-M5) vs conteo manual | ✅ 100% coincidente |
| Emoji top realmente es el más frecuente | ✅ 👍 con 19 |
| UI — flujo principal | ✅ Funciona |


El sistema está **funcionalmente correcto y las métricas son coherentes**.
