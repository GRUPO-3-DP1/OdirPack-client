# 📦 OdirPack - Sistema de Gestión Logística

<div align="center">

![OdirPack Logo](./public/vite.svg)

**Aplicación web para la gestión integral de operaciones logísticas y optimización de rutas de distribución**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?logo=vite)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/Material--UI-6.1.4-007FFF?logo=mui)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Docker](#-docker)
- [Contribución](#-contribución)

---

## 📝 Descripción

**OdirPack** es una solución web moderna para la gestión de operaciones logísticas en tiempo real. La plataforma permite a las empresas de distribución optimizar sus rutas, gestionar su flota de vehículos, administrar almacenes y oficinas, y realizar simulaciones para mejorar la eficiencia operativa.

### 🎯 Objetivo

Proporcionar una herramienta integral que permita a los gestores logísticos:
- Visualizar operaciones en tiempo real
- Optimizar rutas de entrega
- Gestionar recursos de manera eficiente
- Simular escenarios de distribución
- Tomar decisiones basadas en datos

---

## ✨ Características

### 🚀 Funcionalidades Principales

- **🗺️ Operaciones Día a Día**:  Monitoreo en tiempo real de entregas y rutas activas con integración de Google Maps
- **🎮 Simulaciones**: Motor de simulación para optimizar rutas antes de ejecutarlas
- **🚛 Gestión de Flota**: Control completo de vehículos, mantenimiento y disponibilidad
- **🏢 Almacenes y Oficinas**: Administración de ubicaciones y recursos
- **📦 Gestión de Pedidos**: Seguimiento completo del ciclo de vida de los pedidos
- **⚙️ Configuración**:  Panel de administración y personalización del sistema

### 🎨 Características Técnicas

- ✅ Interfaz responsive y moderna con Material-UI
- ✅ Autenticación y rutas protegidas
- ✅ Gestión de estado con Context API
- ✅ Integración con Google Maps para visualización geoespacial
- ✅ Componentes reutilizables y modulares
- ✅ TypeScript para type-safety
- ✅ Optimización de rendimiento con Vite

---

## 🛠 Tecnologías

### Frontend Core
- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5.5.3** - Superset tipado de JavaScript
- **Vite 5.4.8** - Build tool y dev server

### UI/UX
- **Material-UI (MUI) 6.1.4** - Sistema de diseño
- **@mui/x-data-grid 7.23.1** - Tablas avanzadas
- **@mui/x-date-pickers 7.21.0** - Selectores de fecha
- **@mui/icons-material 6.1.4** - Iconografía

### Maps & Geolocalización
- **@vis.gl/react-google-maps 1.3.0** - Integración con Google Maps

### HTTP & API
- **Axios 1.7.7** - Cliente HTTP

### Routing
- **React Router DOM 6.27.0** - Enrutamiento SPA

### Utilidades
- **Day.js 1.11.13** - Manipulación de fechas
- **@fontsource/roboto 5.1.0** - Tipografía

### Development Tools
- **ESLint** - Linting
- **Vitest** - Testing framework

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado: 

- **Node.js** >= 18.x
- **npm** >= 9.x o **yarn** >= 1.22.x
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/GRUPO-3-DP1/OdirPack-client.git
cd OdirPack-client
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (si es necesario):

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en:  **http://localhost:5173**

---

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run lint` | Ejecuta el linter ESLint |
| `npm run preview` | Preview de la build de producción |
| `npm run test` | Ejecuta los tests con Vitest |

---

## 📁 Estructura del Proyecto

```
OdirPack-client/
├── public/                    # Archivos estáticos
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Dashboard/       # Layout principal
│   │   └── ProtectedRoute/  # HOC para rutas protegidas
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Login/          # Página de autenticación
│   │   ├── OperacionesDiaDia/
│   │   ├── Simulaciones/
│   │   ├── Flota/
│   │   ├── AlmacenesOficinas/
│   │   ├── Pedidos/
│   │   └── Configuracion/
│   ├── context/            # Context API providers
│   │   ├── Archivos/
│   │   ├── Buscador/
│   │   ├── Operacion/
│   │   └── Simulacion/
│   ├── routes/            # Configuración de rutas
│   ├── App.tsx            # Componente raíz
│   └── main.tsx           # Entry point
├── config. ts              # Configuraciones globales
├── Dockerfile             # Configuración Docker
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎯 Funcionalidades Principales

### 🗺️ Operaciones Día a Día
<!-- Aquí incluirás un screenshot o GIF -->
![Operaciones](./docs/screenshots/operaciones. png)

Visualización en tiempo real de: 
- Rutas activas en el mapa
- Estado de entregas
- Ubicación de vehículos
- Alertas y notificaciones

### 🎮 Simulaciones
<!-- Aquí incluirás un screenshot o GIF -->
![Simulaciones](./docs/screenshots/simulaciones.gif)

- Crear escenarios de distribución
- Optimizar rutas antes de ejecutarlas
- Comparar diferentes estrategias
- Análisis de eficiencia

### 🚛 Gestión de Flota
<!-- Aquí incluirás un screenshot o GIF -->
![Flota](https://github.com/user-attachments/assets/1af9bbcf-63f0-47e8-a2ef-c5d067ebff08)

- Registro de vehículos
- Estado de mantenimiento
- Asignación de conductores
- Historial de rutas

### 📦 Pedidos
<!-- Aquí incluirás un screenshot o GIF -->
![Pedidos](https://github.com/user-attachments/assets/1ae1271b-f925-4765-8bac-cb8d15606f7e)

- Listado de pedidos
- Estados de entrega
- Asignación a rutas
- Historial completo

---

## ⚙️ Configuración

### Google Maps API

Para habilitar las funcionalidades de mapas, necesitas:

1. Obtener una API key de [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar las siguientes APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
3. Configurar la key en `src/App.tsx` o en variables de entorno

### Temas y Estilos

El tema personalizado se encuentra en `src/App.tsx`:

```typescript
const customTheme = createTheme({
  palette: {
    primary: {
      main:  "#00A76F",
    },
    secondary: {
      main: "#8E33FF",
    },
  },
  typography: {
    fontFamily: "Public Sans",
  },
});
```

---

## 🐳 Docker

### Build de la imagen

```bash
docker build -t odirpack-client . 
```

### Ejecutar el contenedor

```bash
docker run -p 80:80 odirpack-client
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas.  Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- Seguir las reglas de ESLint configuradas
- Usar TypeScript para type-safety
- Documentar componentes complejos
- Escribir tests para nuevas funcionalidades

---

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

---

## ❤️ Soporte

Para reportar bugs o solicitar features, abre un [issue](https://github.com/GRUPO-3-DP1/OdirPack-client/issues).

---

<div align="center">

Hecho con ❤️ por el equipo GRUPO-3-DP1

⭐ ¡No olvides dar una estrella si te gusta el proyecto! 

</div>
