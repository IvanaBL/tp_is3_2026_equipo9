# Formato del archivo de chat

El sistema acepta exclusivamente archivos `.txt` exportados desde WhatsApp en Android con las siguientes características:

| Propiedad | Valor |
|---|---|
| Tipo de archivo | `.txt` (texto plano) |
| Codificación | UTF-8 |
| Sistema operativo | Android |
| Formato de hora | 24 horas (HH:MM), sin segundos |
| Formato de fecha | D/M/YYYY (sin cero inicial en día ni mes) |
| Separador | ` - ` entre timestamp y contenido |
| Idioma del sistema | Español |

> **Limitación aceptada:** No se soporta el formato iOS (con AM/PM o con segundos).

---

## Estructura de una línea válida

Cada mensaje de usuario ocupa una línea con la siguiente estructura:

```
D/M/YYYY, HH:MM - NombreUsuario: texto del mensaje
```

### Componentes de la línea

| Componente | Descripción | Ejemplo |
|---|---|---|
| **Día** | D o DD, sin cero inicial si < 10 | `1`, `13` |
| **Mes** | M o MM, sin cero inicial si < 10 | `4`, `12` |
| **Año** | Siempre 4 dígitos | `2026` |
| **Separador fecha-hora** | Coma seguida de espacio | `, ` |
| **Hora** | HH:MM en 24 hs, sin segundos | `22:45` |
| **Separador hora-contenido** | Espacio, guion, espacio | ` - ` |
| **Nombre de usuario** | Texto libre (nombre o número de teléfono) | `Noelia`, `+54 9 264 484-1343` |
| **Separador nombre-mensaje** | Dos puntos seguidos de espacio | `: ` |
| **Texto del mensaje** | Texto libre, emoji, URL o tag especial | — |

---

## Tipos de línea

### Mensaje de usuario
Línea que sigue el patrón completo (fecha, separador, nombre con dos puntos).  
**Acción:** extraer fecha, hora, usuario y texto. Contar como mensaje.

```
1/4/2026, 22:45 - Noelia: Hola a todos! Me sumo al grupo para is3
```

### Mensaje del sistema
Línea con fecha y separador, pero sin nombre de usuario ni dos puntos. Son mensajes automáticos de WhatsApp.  
**Acción:** descartar. No se asigna a ningún usuario ni se cuenta.

```
1/4/2026, 12:19 - Diego creó el grupo "Grupo Ing. de soft. 3".
1/4/2026, 22:44 - Te uniste mediante el enlace de invitación de este grupo.
```

### Mensaje multimedia
Mensaje de usuario cuyo texto es exactamente `<Multimedia omitido>`.  
**Acción:** contar como mensaje del usuario, pero excluir del análisis de palabras y word cloud.

```
9/4/2026, 14:43 - +54 9 264 484-1343: <Multimedia omitido>
```

### Mensaje eliminado
Mensaje de usuario cuyo texto es exactamente `Se eliminó este mensaje.`  
**Acción:** contar como mensaje del usuario, pero excluir del análisis de palabras y word cloud.

```
10/4/2026, 15:43 - Noelia: Se eliminó este mensaje.
```

### Mensaje editado
Mensaje de usuario cuyo texto termina con la etiqueta `<Se editó este mensaje.>`  
**Acción:** contar como mensaje del usuario, eliminar la etiqueta antes de procesar y analizar el contenido restante normalmente.

```
13/4/2026, 17:31 - +54 9 11 3235-8837: Yo curso ahora <Se editó este mensaje.>
```

### Línea multilínea
Línea que no comienza con una fecha. Ocurre cuando un usuario envía un mensaje con saltos de línea.  
**Acción:** concatenar al texto del mensaje anterior. No genera un nuevo registro.

```
8/4/2026, 22:51 - Noelia: Buenas! Acá paso los míos.
Nombre y apellido: Noelia Lezcano, usuario de GitHub: NoeliaLezcano
```
> La segunda línea es continuación del mensaje de Noelia y debe unirse a él.

---

## Identificación de usuarios

Se detectaron dos formatos de nombre de usuario:

- **Nombre guardado** — aparece cuando el contacto está en la agenda al exportar. Ejemplo: `Noelia`
- **Número de teléfono** — aparece cuando el contacto no está guardado. Ejemplo: `+54 9 264 484-1343`

---

## Estructura del objeto mensaje

Cada mensaje parseado se representará con el siguiente objeto:

```json
{
  "fecha": "1/4/2026",
  "hora": "22:45",
  "remitente": "Noelia",
  "contenido": "Hola a todos! Me sumo al grupo para is3",
  "esMultimedia": false,
  "esEliminado": false,
  "timestamp": "Date"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `fecha` | string | Fecha original tal como aparece en el archivo |
| `hora` | string | Hora en formato HH:MM |
| `remitente` | string | Nombre o número del usuario |
| `contenido` | string | Texto del mensaje (sin sufijo de editado) |
| `esMultimedia` | boolean | `true` si el contenido es `<Multimedia omitido>` |
| `esEliminado` | boolean | `true` si el contenido es `Se eliminó este mensaje.` |
| `timestamp` | Date | Objeto Date construido a partir de fecha + hora |

---

## Notas

- El formato fue validado contra un chat real exportado desde WhatsApp (Argentina, abril 2026).
- Se contempla únicamente el formato de exportación sin cifrado (`.txt` plano).
- No se contempla el formato `.zip` con multimedia adjunta.
