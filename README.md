# MotorXpress - E-Commerce de Repuestos Automotrices

MotorXpress es una plataforma de comercio electrónico moderna, rápida y oscura, diseñada específicamente para la venta de repuestos, lubricantes y accesorios para automóviles. Su diseño está orientado a la conversión y en la usabilidad, ofreciendo a los usuarios una experiencia de compra fluida desde la búsqueda del producto hasta el seguimiento de su pedido, integrando además un **panel administrativo completo** para la tienda.

## Características Principales

### Frontend (Vista Cliente)
* **Página de Inicio:** Carruseles de marcas, banners y categorías destacadas.
* **Catálogo de Productos:** Exploración de productos por categoría y marca de vehículo. Filtros rápidos y diseño atractivo de tarjetas de productos.
* **Carrito de Compras y Checkout:** Gestión de carrito integrada y un flujo de compra de 3 pasos (Envío, Pago, Confirmación).
* **Cotización de Envíos:** Flujo simulado adaptado para envíos por integraciones (ej: Chilexpress) o envíos a precio fijo.
* **Sistema de Búsqueda:** Barra de búsqueda en tiempo real.
* **Dashboard de Usuario:** Portal de cuenta de usuario donde pueden registrarse, iniciar sesión, ver su historial de pedidos y los detalles de cada orden con seguimiento de estado.
* **Páginas Informativas:** Privacidad, Devoluciones, Tiempos de Envío, Términos y Condiciones.
* **Diseño Responsivo:** "Dark Mode" con acentos en rojo deportivo (`#E31C25`).

### Backend (Vista Administrador y API)
* **Panel de Administración (`/admin`):**
  * **Dashboard Principal:** Resumen de métricas de ventas y pedidos.
  * **Gestión de Productos (CRUD):** Creación, edición y eliminación de productos y categorías. Subida de imágenes locales.
  * **Gestión de Pedidos:** Listado de órdenes con la capacidad de modificar el estado de avance del envío (Pendiente, Pagado, En Camino, Entregado, etc).
  * **Gestión de Usuarios:** Ver clientes registrados en la plataforma.
  * **Configuración del Sitio:** Ajustes dinámicos guardados en base de datos de los métodos de pago (Flow.cl) y opciones de envíos.
* **Base de Datos SQLite:** Integrada y configurada automáticamente tras el inicio, gestionada vía `better-sqlite3`.

## Arquitectura

* **Frontend:** React 18 (Client-side rendering, Vite), Tailwind CSS, Lucide React (Íconos)
* **Backend:** Node.js con Express Server
* **Persistencia:** Archivo SQLite (`database.sqlite` en ruta raíz).
* **Compilación:** `npm run build` construye los archivos estáticos de Vite y transpila el backend (ESBuild) a `server.cjs` para despliegue nativo.

## Endpoints de la API (`/api/`)

* `/products` - GET, POST, PUT, DELETE para manejo del catálogo.
* `/categories` & `/brands` - Metadatos de agrupaciones.
* `/orders` - Creación de pedidos por parte del cliente y lectura de historial.
* `/orders/:id/status` - Actualización de estado del pedido por el admin.
* `/auth/login` - Autenticación JWT / Basada en base de datos.
* `/users` - Registro de nuevos usuarios y lectura de listado.
* `/settings` - Guarda credenciales de Flow y Chilexpress configurables desde el dashboard de Administrador.

## Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar entorno de desarrollo (Inicia Vite Dev Server + API Integrada)**:
   ```bash
   npm run dev
   ```

3. **Construir para producción**:
   ```bash
   npm run build
   ```

4. **Ejecutar producción**:
   ```bash
   npm run start
   ```
   Levanta en entorno cerrado el servidor Express, cargando los assets generados en el directorio `dist`.

## Credenciales Base

Al levantar el servicio web, la base de datos es sembrada (seeded) automáticamente con productos de muestra y un usuario administrador.

Para acceder al Panel de Control:
1. Accede a la vista 'Mi Cuenta' (`/cuenta`).
2. Digita:
   - **Correo:** `admin@motorxpress.cl`
   - **Contraseña:** `admin123`
3. Un botón de "Panel de Administración" aparecerá para permitirte administrar todo el sistema E-Commerce backend.
