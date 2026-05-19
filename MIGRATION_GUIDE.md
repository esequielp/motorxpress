# Guía de Migración y Arquitectura del Proyecto (White-label & Backend)

Este documento sirve como guía completa para migrar la arquitectura actual a un modelo escalable (Antigravity / PostgreSQL) y empaquetar el ecosistema completo para funcionar como una PWA multi-negocio (Ferretería, Ropa, Electrónica) mediante Docker.

## 1. Experiencia Mobile-First y PWA (Progressive Web App)
Para que el e-commerce ofrezca una experiencia similar a una app nativa:
- **Tecnología PWA:** Integrar `vite-plugin-pwa` para generar automáticamente el *Service Worker* y el Web Manifest.
- **Manifesto Dinámico:** El archivo `manifest.json` debe alimentarse de las variables de entorno del negocio (Icono de la tienda, Nombre, Color de tema, Color de fondo de la Splash Screen).
- **Offline / Caché:** Los assets (imágenes de la UI, logos, CSS en caché) deben servirse localmente. El carrito de compras (`zustand`) actualmente ya sobrevive en `localStorage`, lo que permite interacciones estables con redes inestables o intermitentes.
- **Prompt de Instalación:** Implementar un pop-up nativo (A2HS - Add to Home Screen) motivando la descarga de la app directamente desde el navegador de iOS o Android.

## 2. Arquitectura "Marca Blanca" (Template Universal)
El objetivo es que este código funcione para diferentes rubros sin tener que tocar componentes individualmente.
- **Parametrización Visual:** Mover los "amarillos", iconos de autos, y marcas directas a un archivo maestro (ej. `theme.config.js` o `.env`). Tailwind en `tailwind.config.mjs` lee estas variables e inyecta los colores dinámicamente (`process.env.VITE_THEME_PRIMARY`).
- **Base de Datos Dinámica:** Reestructurar atributos específicos. Eliminar ataduras a 'motor', 'vehículo' en el schema de persistencia genérico y reemplazar por relaciones de tipo "Tag", "Atributo" y "Categoría". (Ej. *Talla* en ropa equivale a *Transmisión* en repuestos automotrices).

## 3. Despliegue Configurable y Dockerización
Generar un despliegue repetible utilizando contenedores. Esto permite lanzar una nueva tienda para un cliente en un par de minutos, aislado en su propio servidor o clúster.

- **Dockerfile Multi-Stage:**
  - *Stage 1 (Build):* Instala las dependencias y construye Vite con las variables inyectables del cliente.
  - *Stage 2 (Runtime):* Levanta la API en Node/Antigravity enviando los estáticos al usuario servidos a través del backend o Nginx.
  
- **Docker Compose (Entorno Aislado):**
  Un archivo `docker-compose.yml` que provisione:
  1. Contenedor de Base de datos (PostgreSQL oficial).
  2. Contenedor Frontend / SSR
  3. Contenedor Backend / Edge API
  
  *Ejemplo de flujo:* `THEME_NAME=Ferreteria docker-compose up -d` despliega instantáneamente todo el stock temático y configuración propia del negocio.

## 4. Migración de Base de Datos y Backend (PostgreSQL / Supabase / Antigravity)
Actualmente el frontend está desacoplado y estructurado para consumir una API RESTful (`/api/*`).

### Base de Datos y Auth
- Deberás importar el esquema a tu nueva base en PostgreSQL (Supabase, Railway o auto-hosteado).
- Reemplazar la autenticación local por **Supabase Auth** o servicios nativos. Reemplazar `.then(login)` en el front por llamadas al SDK `@supabase/supabase-js`.

### Rutas Core Requeridas (A migrar a Antigravity)
Remplaza estos endpoints de SQLite a funciones en Edge/Serverless o mediante código Node PostgreSQL:
- `GET /api/products` (Habilitado para búsquedas y paginación)
- `POST /api/orders` (Integración de pasarelas de pago, validación de stock y creación de pedido).
- Webhooks de confirmación (`/api/payments/webhook`) para la pasarela (Flow / MercadoPago).
- Panel Administrativo (Peticiones POST, PUT y DELETE para productos, clientes y órdenes con roles definidos).

**Conclusión y Pasos Prácticos:** 
1. Completar la inclusión total del plugin PWA en Vite.
2. Contenerizar la aplicación completa creando su un `Dockerfile` de cara a producción.
3. Generar el pipeline backend reemplazando los endpoints locales (`server/routes.ts`) por llamadas a una fuente remota segura conectada a PostgreSQL.
