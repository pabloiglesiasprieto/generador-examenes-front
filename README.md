# Generador de Exámenes — Frontend

Aplicación móvil multiplataforma construida con **React Native**, **Expo** y **TypeScript**. Se conecta al backend de microservicios a través del Gateway (puerto 8080).

---

## Tecnologías principales

| Tecnología                        | Versión  | Uso                                         |
|-----------------------------------|----------|---------------------------------------------|
| React Native                      | 0.81.5   | Framework de UI multiplataforma             |
| Expo                              | ~54.0    | Toolchain y runtime                         |
| TypeScript                        | ^5.3     | Tipado estático                             |
| React Navigation                  | ^6       | Navegación (stack + bottom tabs)            |
| Axios                             | ^1.13    | Cliente HTTP con interceptores JWT          |
| InversifyJS                       | ^8.1     | Inyección de dependencias (IoC)             |
| AsyncStorage                      | 2.2.0    | Persistencia del token JWT                  |
| jwt-decode                        | ^4.0     | Decodificación y validación de tokens       |
| expo-file-system / expo-sharing   | —        | Descarga y compartición de ficheros         |

---

## Requisitos previos

| Herramienta        | Versión mínima |
|--------------------|----------------|
| Node.js            | 18+            |
| npm                | 9+             |
| Expo CLI           | (`npx expo`)   |
| Android Studio / Xcode | (para emulador) |

El **backend debe estar en marcha** y accesible desde el dispositivo/emulador antes de arrancar la app.

---

## Instalación

```bash
git clone <repository-url>
cd generador-examenes-front
npm install
```

---

## Configuración de la URL del backend

La URL base de la API se define en:

```
src/data/apiconnection/ApiClient.ts
```

```typescript
export const API_BASE_URL = 'http://localhost:8080';
```

Cambia esta URL según el entorno:

| Entorno                    | URL de ejemplo                        |
|----------------------------|---------------------------------------|
| Emulador Android           | `http://10.0.2.2:8080`                |
| Dispositivo físico (LAN)   | `http://192.168.x.x:8080`             |
| LocalTunnel / ngrok        | `https://xxxxx.loca.lt`               |
| Backend en Docker local    | `http://localhost:8080`               |

> Si usas localtunnel, el cliente ya envía la cabecera `bypass-tunnel-reminder: true` automáticamente.

---

## Ejecución

```bash
# Arranca el servidor de desarrollo de Expo (puerto 8085)
npm start

# Directamente en Android
npm run android

# Directamente en iOS
npm run ios

# En el navegador web
npm run web
```

Escanea el QR con la app **Expo Go** en tu dispositivo, o pulsa `a` / `i` en la terminal para abrir el emulador.

---

## Arquitectura del proyecto

La app sigue **Clean Architecture** con cuatro capas bien diferenciadas:

```
src/
├── data/
│   ├── apiconnection/       # ApiClient (Axios) — interceptores JWT, expiración automática
│   └── repositories/        # Implementaciones concretas de los repositorios (llamadas HTTP)
│
├── domain/
│   ├── entities/            # Tipos e interfaces de dominio (DTOs del backend)
│   ├── interfaces/
│   │   ├── repositories/    # Contratos de repositorios (IAuthRepository, etc.)
│   │   └── useCases/        # Contratos de casos de uso por módulo
│   └── useCases/            # Implementaciones de los casos de uso
│       ├── auth/
│       ├── examenes/
│       ├── preguntas/
│       ├── usuarios/
│       └── incidencias/
│
├── infrastructure/
│   └── config/
│       ├── container.ts     # Contenedor IoC de InversifyJS (bindings repositorios ↔ casos de uso)
│       └── types.ts         # Símbolos de inyección de dependencias
│
└── presentation/
    ├── components/          # Componentes reutilizables (ErrorBox, LoadingButton, PasswordInput…)
    ├── navigation/          # Navegadores (RootNavigator, AppNavigator)
    ├── viewmodels/          # Hooks de lógica de pantalla + AuthContext
    └── views/               # Pantallas (una por funcionalidad)
```

### Inyección de dependencias (InversifyJS)

El fichero `container.ts` registra todos los repositorios y casos de uso. Los ViewModels obtienen sus dependencias del contenedor en lugar de instanciarlas directamente, lo que facilita el testing y desacoplamiento.

---

## Navegación

La navegación se divide en dos niveles:

### `RootNavigator` — Autenticación

Comprueba el estado de sesión (token en AsyncStorage) y decide qué mostrar:

- **Sin sesión** → Stack de autenticación (`Login`, `Register`)
- **Con sesión** → `AppNavigator`

### `AppNavigator` — App principal (Bottom Tabs)

| Tab       | Icono           | Rol visible       | Contenido                                   |
|-----------|-----------------|-------------------|---------------------------------------------|
| Juego     | game-controller | Todos             | Mapa de exámenes → Realización → Resultado  |
| Perfil    | person          | Todos             | Datos del usuario → Historial de exámenes   |
| Admin     | settings        | ADMIN / PROFESOR  | Panel de administración                     |

---

## Pantallas

| Pantalla             | Ruta / Stack    | Rol             | Descripción                                                    |
|----------------------|-----------------|-----------------|----------------------------------------------------------------|
| `LoginScreen`        | Auth            | —               | Formulario de inicio de sesión con recuperación de contraseña  |
| `RegisterScreen`     | Auth            | —               | Registro de nueva cuenta (rol ALUMNO)                          |
| `MapScreen`          | GameTab         | Todos           | Lista de exámenes disponibles en formato visual                |
| `ExamScreen`         | GameTab         | Todos           | Realización del examen pregunta a pregunta                     |
| `ResultScreen`       | GameTab         | Todos           | Resultado inmediato tras entregar el examen                    |
| `ProfileScreen`      | ProfileTab      | Todos           | Datos del usuario y opción de cambiar contraseña               |
| `HistoryScreen`      | ProfileTab      | Todos           | Historial de exámenes realizados con notas                     |
| `AdminHomeScreen`    | AdminTab        | ADMIN/PROFESOR  | Menú principal del panel de administración                     |
| `QuestionsScreen`    | AdminTab        | ADMIN/PROFESOR  | Gestión del banco de preguntas (CRUD + importar CSV)           |
| `UsersScreen`        | AdminTab        | ADMIN           | Gestión de usuarios y roles                                    |
| `IncidenciasScreen`  | AdminTab        | ADMIN           | Listado de incidencias del sistema                             |
| `DashboardScreen`    | AdminTab        | ADMIN/PROFESOR  | Estadísticas y ranking de alumnos                             |
| `ExamResultsScreen`  | AdminTab        | ADMIN/PROFESOR  | Resultados de todos los alumnos en un examen concreto          |

---

## Autenticación y gestión del token

El flujo de autenticación está centralizado en `AuthContext`:

1. Al arrancar, se lee el token de `AsyncStorage`.
2. Se decodifica con `jwt-decode` para extraer el rol (`authorities`), el ID de usuario (`id_usuario`) y la expiración.
3. El `ApiClient` incluye un **interceptor de request** que:
   - Comprueba la expiración antes de cada llamada.
   - Adjunta la cabecera `Authorization: Bearer <token>`.
   - Si el token está caducado o es inválido, lo elimina y cierra sesión.
4. Un **interceptor de response** cierra sesión automáticamente ante cualquier `401`.

### Recuperación de contraseña

La pantalla de login incluye un flujo de recuperación en tres pasos:

1. Introduce el email → se envía un código de 6 dígitos al correo.
2. Introduce el código recibido → se valida contra el backend.
3. Introduce la nueva contraseña → se confirma el cambio.

Este flujo está gestionado por el ViewModel `useForgotPassword`.

---

## Componentes reutilizables

| Componente      | Descripción                                                           |
|-----------------|-----------------------------------------------------------------------|
| `ErrorBox`      | Muestra mensajes de error con estilo consistente                      |
| `LoadingButton` | Botón que muestra un spinner mientras la acción está en curso         |
| `PasswordInput` | Campo de contraseña con toggle de visibilidad                         |
| `ExamNode`      | Representación visual de un examen en el mapa (estado, nota, etc.)   |

---

## Módulos de funcionalidad

### Exámenes
- Listar exámenes disponibles (por rol)
- Ver detalle de un examen
- Crear examen (PROFESOR/ADMIN) — solicita preguntas aleatorias al backend
- Realizar examen y recibir corrección inmediata
- Ver resultados de todos los alumnos en un examen
- Exportar listado a Excel o PDF

### Preguntas
- Listar banco de preguntas con ordenación
- Crear, editar y eliminar preguntas con sus respuestas
- Importar preguntas desde CSV

### Usuarios
- Listar usuarios y roles
- Asignar/quitar roles (ADMIN)
- Editar y desactivar usuarios
- Ver historial de resultados de un alumno

### Incidencias
- Listar incidencias del sistema con filtro por clase Java (solo ADMIN)

### Dashboard
- Estadísticas globales de exámenes
- Ranking de alumnos por nota
- Estadísticas por pregunta

---

## Estructura de ficheros clave

```
App.tsx                          # Punto de entrada — proveedores globales
src/data/apiconnection/
  ApiClient.ts                   # Axios + interceptores JWT
src/infrastructure/config/
  container.ts                   # Bindings InversifyJS
  types.ts                       # Símbolos de inyección
src/presentation/viewmodels/
  AuthContext.tsx                 # Estado global de sesión
  useForgotPassword.ts           # Lógica de recuperación de contraseña
  useExamSession.ts              # Lógica de realización de examen
  useDashboardScreen.ts          # Estadísticas y ranking
  useQuestionsScreen.ts          # CRUD de preguntas
  useUsersScreen.ts              # Gestión de usuarios
  useHistoryScreen.ts            # Historial del alumno
  useLoginForm.ts                # Formulario de login
```
