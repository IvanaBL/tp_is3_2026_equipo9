# Reglas generales de procesamiento

Antes de calcular cualquier métrica, se aplican las siguientes reglas sobre el conjunto de mensajes parseados:

| Regla | Descripción |
|---|---|
| **Excluir mensajes del sistema** | Se descartan todas las líneas sin remitente identificable |
| **Excluir multimedia** | Los mensajes `<Multimedia omitido>` se cuentan para actividad, pero se excluyen del análisis de texto |
| **Excluir mensajes eliminados** | Los mensajes `Se eliminó este mensaje.` se cuentan para actividad, pero se excluyen del análisis de texto |
| **Limpieza del contenido** | Se elimina el sufijo de editado, menciones `@...` y URLs (`http://` / `https://`) |

---

## Métricas requeridas

### M1 · Usuario con más mensajes enviados

**Descripción:** Identifica qué participante envió la mayor cantidad de mensajes.

**Regla:**
- Contar mensajes por remitente (incluyendo multimedia, excluyendo sistema).
- Ordenar de mayor a menor.
- Mostrar ranking completo y destacar el primero.

---

### M2 · Emoji más utilizado

**Descripción:** Identifica el emoji con mayor frecuencia de aparición en todo el chat.

**Regla:**
- Extraer todos los emojis de todos los mensajes de usuario (excluir multimedia).
- Cada aparición cuenta individualmente (si un mensaje tiene 👍👍, cuenta 2).
- Ordenar por frecuencia descendente.
- Mostrar top 3.

---

### M3 · Franja horaria con mayor actividad

**Descripción:** Determina en qué hora del día se concentran más mensajes.

**Regla:**
- Agrupar los mensajes por hora exacta (0 a 23) usando el campo `hora` del timestamp.
- Contar mensajes por hora.
- Mostrar las 24 horas en un gráfico de barras, destacando la de mayor actividad.

---

### M4 · Días con mayor cantidad de mensajes

**Descripción:** Muestra qué fechas y días de la semana tuvieron más actividad.

#### Por fecha exacta:
- Agrupar mensajes por fecha (usando el campo `fecha` del objeto mensaje).
- Contar mensajes por día.
- Ordenar de mayor a menor.
- Mostrar top 5 días.

#### Por día de la semana:
- Agrupar mensajes por día de la semana (Lunes, Martes... Domingo).
- Contar el total de mensajes acumulados por cada día.
- Mostrar los 7 días en un gráfico, destacando el de mayor actividad.

---

### M5 · Nube de palabras (Word Cloud)

**Descripción:** Visualización de las palabras más frecuentes en el chat.

**Regla:**
1. Tomar el contenido de todos los mensajes de usuario (excluir multimedia y sistema).
2. Limpiar contenido: eliminar sufijo de editado, menciones y URLs.
3. Convertir a minúsculas.
4. Eliminar signos de puntuación: `. , ; : ! ? ¿ ¡ " ' ( ) [ ]`
5. Eliminar stopwords (ver `stopwords.md`).
6. Eliminar palabras de longitud menor a 2 caracteres.
7. Contar frecuencia de cada palabra restante.
8. Mostrar las top 50 palabras con tamaño proporcional a su frecuencia.
