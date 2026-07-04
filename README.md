

# ProDesign

Plataforma desarrollada con **React** y **Vite** para un rendimiento optimizado en desarrollo y producción.

### 📋 Requisitos

* **Node.js** v20.20.0

### 🛠️ Tecnologías principales

* Vite, React, NPM.

### [DOCUMENTACIÓN] Actualizaciones Recientes: Modernización de Interfaz (UI/UX)
Se han implementado cambios en la plataforma para cumplir con los estándares de diseño moderno y nuevos requisitos:
- **Tema Base**: Transición al "Modo Claro Premium" (estilo minimalista) y uso de la tipografía **Inter** en toda la aplicación.
- **Paleta de Colores**: Uso de fondos ultra claros (`#F8FAFC` slate-50) con acentos en azul vibrante (`#2563eb`) y textos en pizarra (`#0F172A`).
- **AuthLayout Dinámico**: El banner estático de autenticación ha sido reemplazado por un layout dinámico que conserva la imagen limpia como fondo y dibuja los elementos de bienvenida y beneficios con código HTML/CSS, permitiendo su edición y mejorando la responsividad.
- **Identidad Corporativa en AuthLayout**: Se agregó soporte para un logo dinámico con efecto *hover* en la esquina superior izquierda, alternando entre versiones claro/oscuro. Además, se integró una sección informativa "Quiénes Somos" dentro del panel de presentación.
- **Edición de Proyectos (Nombre, Cliente y Responsable)**:
  - **Ficheros modificados**:
    - [projectSlice.js](file:///c:/Users/HP/Desktop/ProDesign/prodesign/src/redux/projects/projectSlice.js): Se añadió la acción reductora `updateProject` para actualizar de inmediato la información de un proyecto o versión editado en el store global.
    - [TableProjects.jsx](file:///c:/Users/HP/Desktop/ProDesign/prodesign/src/app/components/GridData/TableProjects.jsx): Se agregó el botón con icono de edición en la columna "Acciones" tanto para proyectos principales como para versiones, desplegando un modal de SweetAlert2 estilizado para capturar el nombre, cliente y responsable del proyecto, llamando al servicio de actualización del backend y despachando al store de Redux.

### 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Vite)
npm run dev

```

> Por defecto en: `http://192.168.18.200:5199/`

### ⚙️ Variables de Entorno (.env)

* `VITE_API_BASE_URL`: URL base del servicio API.
* `VITE_READ_EXCEL`: Variable de configuración para lectura de archivos.
