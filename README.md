# Plantilla Libre

Este es un proyecto de plantilla libre para una aplicación web server-side rendered (SSR) construida con Cloudflare Workers y Supabase. La aplicación cuenta con un sistema de autenticación y control de acceso basado en roles.

## Características

- **Autenticación de Usuarios:** Registro, inicio y cierre de sesión.
- **Control de Acceso Basado en Roles (RBAC):** Diferentes roles de usuario (superadmin, admin, vendedor, tramitador) con acceso a distintas vistas y funcionalidades.
- **Renderizado del Lado del Servidor (SSR):** Las páginas HTML se generan en el servidor para un mejor rendimiento y SEO.
- **Integración con Supabase:** Utiliza Supabase para la base de datos y la autenticación.
- **Despliegue Sencillo:** Configurado para un despliegue rápido en Cloudflare Workers.

## Tecnologías Utilizadas

- **Cloudflare Workers:** Plataforma para ejecutar el código del lado del servidor.
- **Supabase:** Backend como servicio (BaaS) para la base de datos y autenticación.
- **JavaScript (ESM):** Lenguaje de programación principal.
- **Wrangler:** Herramienta de línea de comandos para el desarrollo y despliegue de Cloudflare Workers.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [npm](https://www.npmjs.com/) (generalmente se instala con Node.js)
- Una cuenta de [Cloudflare](https://www.cloudflare.com/)
- Una cuenta de [Supabase](https://supabase.com/)

## Instalación

1.  **Clona el repositorio:**

    ```bash
    git clone <URL-del-repositorio>
    cd plantillalibre
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**

    Crea un archivo `.dev.vars` en la raíz del proyecto y añade las siguientes variables de entorno de Supabase:

    ```
    SUPABASE_URL="tu-url-de-supabase"
    SUPABASE_KEY="tu-anon-key-de-supabase"
    ```

    Puedes encontrar estas claves en la configuración de tu proyecto de Supabase (Settings > API).

## Uso

Para iniciar el servidor de desarrollo local, ejecuta el siguiente comando:

```bash
npm run dev
```

Esto iniciará un servidor local (generalmente en `http://localhost:8787`) que se recargará automáticamente al guardar cambios en los archivos.

## Despliegue

Para desplegar la aplicación en Cloudflare Workers, ejecuta el siguiente comando:

```bash
npm run deploy
```

Este comando empaquetará y desplegará tu aplicación en tu cuenta de Cloudflare.

## Estructura del Proyecto

```
.
├── src/
│   ├── index.js                # Punto de entrada principal, enrutador y lógica de la aplicación
│   ├── client-scripts.js       # Scripts para el lado del cliente (si son necesarios)
│   ├── utils.js                # Funciones de utilidad
│   ├── services/
│   │   ├── email.js            # Lógica para el envío de correos (ejemplo)
│   │   └── supabase.js         # Cliente y funciones de Supabase
│   └── templates/
│       ├── layout.js           # Plantilla principal de la aplicación
│       ├── components/         # Componentes reutilizables
│       └── pages/              # Plantillas para cada página de la aplicación
├── .gitignore
├── package.json                # Dependencias y scripts del proyecto
├── wrangler.toml               # Configuración de Cloudflare Workers
└── README.md                   # Este archivo
```
