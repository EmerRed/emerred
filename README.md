# emerred

Sistema de contacto para catástrofes (Fases 1 a 3) que conecta a afectados y voluntarios in-situ con fuentes oficiales. Funciona con o sin Internet y cuenta con un agente de IA especializado que actúa como mediador, guía a los afectados y coordinador del auxilio en tiempo real.

## Producto para esta hackatón

Para la entrega de 16 h construiremos un **prototipo demostrable en React Native con Expo**. No será un sistema real, sino una simulación funcional de la arquitectura completa: alerta CBS, GPS puntual, red mesh Bluetooth, triage con IA y coordinación de voluntarios.

Todo lo que requiere permisos de operadoras, fabricantes o acuerdos institucionales se **simula** en la app. En el pitch se explica qué es demo y qué sería escalado a producción.

## Arquitectura

```
Alerta CBS (simulada)
       │
       ▼
App React Native (Expo)
  ├─ Botón "Autorizar asistencia"
  ├─ GPS puntual (expo-location)
  ├─ Chat con agente de IA
  ├─ Red mesh simulada
  ├─ Panel de voluntario
  └─ Fuentes oficiales mock
       │
       ▼
Backend (Vercel/Express)
  ├─ POST /triage
  ├─ GET  /reports
  ├─ POST /assign
  └─ GET  /alerts
       │
       ▼
IA (OpenAI/Claude)
```

## Componentes del sistema

### 1. Alerta CBS simulada

El **Cell Broadcast Service** permite a las autoridades enviar mensajes masivos a todos los celulares de una zona sin internet y sin contactos previos.

En el prototipo, un botón dispara una pantalla de alerta con un mensaje de ejemplo. En producción, esto sería reemplazado por el broadcast real.

### 2. GPS puntual

El usuario autoriza el uso del GPS **una sola vez** al presionar el botón de asistencia. Se usa `expo-location` con `getCurrentPositionAsync`. No hay rastreo continuo para ahorrar batería y proteger privacidad.

### 3. Red mesh Bluetooth simulada

Una red mesh permite que los dispositivos se comuniquen entre sí sin torres celulares ni internet. En Expo no se puede implementar un mesh real de BLE en 16 h, por lo que se simula: la app genera nodos cercanos y muestra cómo un mensaje "salta" entre dispositivos hasta llegar a uno con conexión.

### 4. Agente de IA

El agente guía al afectado con preguntas, asigna una prioridad y entrega instrucciones. El frontend nunca llama a OpenAI directamente. El backend actúa como proxy:

- Frontend `POST /triage` con los mensajes.
- Backend llama a OpenAI o a un fallback por reglas.
- Backend devuelve JSON con campos Markdown.
- Frontend renderiza Markdown con `react-native-markdown-display`.

### 5. Panel de voluntario

Una pantalla dentro de la misma app permite ver reportes activos, filtrar por prioridad y presionar "Atender" para asignar un caso.

### 6. Fuentes oficiales

Mock de alertas oficiales (`GET /alerts`) que se muestran en la app y se asocian a los reportes por ubicación o palabras clave.

## Contrato de la IA

El backend devuelve siempre este JSON:

```json
{
  "prioridad": "alta",
  "fin_triage": false,
  "respuesta_markdown": "¿Cuántas personas están contigo?",
  "instrucciones_markdown": "- No muevas a la persona.\n- Mantén la calma."
}
```

El frontend usa `prioridad` para colores y acciones, y renderiza los campos Markdown para el usuario.

## Stack

- **Frontend**: React Native con Expo.
- **Navegación**: React Navigation.
- **Ubicación**: `expo-location`.
- **Almacenamiento offline**: `AsyncStorage`.
- **Markdown**: `react-native-markdown-display`.
- **Backend**: Express o Vercel Function.
- **IA**: OpenAI `gpt-4o-mini` con fallback por reglas.
- **Demo**: Expo Go en celulares del equipo.

## Estructura de carpetas propuesta

```
emerred/
├─ app/                    # Código de React Native con Expo
│  ├─ screens/
│  │  ├─ HomeScreen.tsx       # Simulador CBS
│  │  ├─ AuthorizeScreen.tsx  # GPS puntual
│  │  ├─ ChatScreen.tsx       # Chat con IA
│  │  ├─ ReportScreen.tsx     # Resumen del reporte
│  │  ├─ VolunteerScreen.tsx  # Panel de voluntario
│  │  ├─ MeshScreen.tsx       # Mesh simulado
│  │  └─ AlertsScreen.tsx     # Fuentes oficiales
│  ├─ components/
│  ├─ hooks/
│  ├─ services/            # Llamadas a /triage, /reports, /alerts
│  ├─ utils/               # Almacenamiento offline, parseos
│  └─ App.tsx
├─ api/                    # Backend
│  ├─ index.ts
│  ├─ routes/
│  │  ├─ triage.ts
│  │  ├─ reports.ts
│  │  └─ alerts.ts
│  └─ lib/
│     └─ openai.ts
└─ README.md
```

## Proceso para las 16 h

### Fase 1 — Setup y estructura (16:30 – 19:00)

- 16:30 – 17:00: crear repositorio, iniciar Expo, decidir backend.
- 17:00 – 18:00: estructura de navegación con todas las pantallas vacías.
- 18:00 – 19:00: simular alerta CBS y botón de autorización con GPS.

### Fase 2 — IA y chat del afectado (19:00 – 23:00)

- 19:00 – 20:30: backend `POST /triage` con OpenAI o fallback.
- 20:30 – 22:00: chat con input, render de Markdown y guardado en AsyncStorage.
- 22:00 – 23:00: resumen del reporte y generación de objeto de reporte.

### Fase 3 — Voluntario y mesh simulado (23:00 – 02:00)

- 23:00 – 00:30: panel de voluntario con lista de reportes y "Atender".
- 00:30 – 02:00: mesh simulado con nodos y contador de saltos.

### Fase 4 — Fuentes oficiales, integración y entrega (02:00 – 08:30)

- 02:00 – 03:30: mock de `GET /alerts` y pantalla de fuentes oficiales.
- 03:30 – 04:30: prueba de flujo completo y corrección de errores.
- 04:30 – 06:00: descanso opcional.
- 06:00 – 07:30: README, pitch y diapositivas.
- 07:30 – 08:15: ensayo con los celulares del equipo.
- 08:15 – 08:30: entrega.

## Tareas del frontend (tu rol)

1. Pantalla de inicio con simulador de CBS.
2. Pantalla de autorización con GPS puntual.
3. Chat del afectado con render de Markdown.
4. Pantalla de resumen del reporte.
5. Panel de voluntario con lista y botón de "Atender".
6. Pantalla de mesh simulado.
7. Pantalla de fuentes oficiales.
8. Persistencia con `AsyncStorage`.

## Tareas del backend

1. `POST /triage`: recibe mensajes y devuelve JSON con Markdown.
2. `GET /reports`: lista de reportes.
3. `POST /assign`: asigna un voluntario a un reporte.
4. `GET /alerts`: alertas oficiales mock.

## Funcionalidades mínimas para cerrar la demo

1. Simular alerta CBS.
2. Capturar GPS una vez.
3. Chat con IA que responde con prioridad y Markdown.
4. Generar un reporte.
5. Ver reportes en modo voluntario y aceptar uno.
6. Visualizar mesh simulado.
7. Mostrar fuentes oficiales mock.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| No hay clave de OpenAI | `/triage` con reglas simples. |
| Expo Go no corre en un celular | Probar temprano en los dispositivos del equipo. |
| Permisos de ubicación fallan | Tener coordenadas fijas como respaldo. |
| No se puede hacer mesh real | Simular nodos y saltos con datos estáticos. |
| Se acaba el tiempo | Priorizar CBS, GPS, chat y voluntario; dejar mesh/alertas si es necesario. |

## Próximos pasos inmediatos

1. Inicializar el proyecto Expo.
2. Instalar React Navigation, `expo-location`, `AsyncStorage` y `react-native-markdown-display`.
3. Crear la estructura de carpetas.
4. Construir el backend `/triage` mockeado.
5. Empezar con la pantalla de inicio y el simulador de CBS.
