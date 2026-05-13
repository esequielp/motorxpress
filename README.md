# MotorXpress - E-Commerce de Repuestos Automotrices

MotorXpress es una plataforma de comercio electrónico moderna, rápida y oscura, diseñada específicamente para la venta de repuestos, lubricantes y accesorios para automóviles. Su diseño está orientado a la conversión y en la usabilidad, ofreciendo a los usuarios una experiencia de compra fluida desde la búsqueda del producto hasta el seguimiento de su pedido, integrando además un **panel administrativo completo** para la tienda y un agente de soporte basado en IA.

## Características Principales

### Frontend (Vista Cliente)
* **Página de Inicio:** Carruseles de marcas, banners, productos destacados, ofertas exclusivas y novedades. Integración de Newsletter (boletín).
* **Catálogo de Productos:** Exploración de productos por categoría y marca de vehículo. Filtros rápidos y diseño atractivo de tarjetas de productos.
* **Página de Producto de Alta Conversión:** Vista detallada de cada producto basada en técnicas de neuroventas (estilo Alex Hormozi), uso de copys persuasivos, garantías e indicativos de escasez/urgencia (stock).
* **Carrito de Compras y Checkout:** Gestión de carrito integrada y un flujo de compra de 3 pasos (Envío, Pago, Confirmación).
* **Cotización de Envíos:** Flujo simulado adaptado para envíos por integraciones (ej: Chilexpress) o envíos a precio fijo.
* **Sistema de Búsqueda:** Barra de búsqueda en tiempo real.
* **Asistente de IA (Chatbot):** Soporte en línea 24/7 simulado utilizando Google Gemini Flash, preparado para dar consejos mecánicos.
* **Dashboard de Usuario:** Portal de cuenta de usuario donde pueden registrarse, iniciar sesión, ver su historial de pedidos y los detalles de cada orden con seguimiento de estado.
* **Páginas Informativas:** Privacidad, Devoluciones, Tiempos de Envío, Términos y Condiciones.
* **Diseño Responsivo:** "Dark Mode" con acentos en rojo deportivo (`#E31C25`).

### Backend (Vista Administrador y API)
* **Panel de Administración (`/admin`):**
  * **Dashboard Principal:** Resumen de métricas de ventas y pedidos.
  * **Gestión de Productos (CRUD):** Creación, edición y eliminación de productos y categorías. Subida de imágenes y marcado especial (Destacados, En Ofertas, Recién Llegados).
  * **Gestión de Pedidos:** Listado de órdenes con la capacidad de modificar el estado de avance del envío (Pendiente, Pagado, En Camino, Entregado, etc).
  * **Gestión de Usuarios Multi-roles:** Separación entre gestión de Clientes y Staff Administrativo/Ejecutivo, con roles específicos.
  * **Configuración del Sitio:** Ajustes dinámicos guardados en base de datos de los métodos de pago (Flow.cl) y opciones de envíos.
* **Base de Datos SQLite:** Integrada y configurada automáticamente tras el inicio, gestionada vía `better-sqlite3`.

## Arquitectura y Patrones

* **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Zustand (para manejo global del estado como el Carrito de Compras).
* **Backend:** Node.js con Express, acoplado en un entorno integrado usando Vite Middleware para desarrollo, transformado a CommonJS para despliegue.
* **Persistencia:** Base de datos SQLite (`database.sqlite`) con `better-sqlite3`. Inicializada automáticamente con Seed Data (datos falsos de demostración).
* **IA API:** Módulo Google GenAI (`@google/genai`) para la funcionalidad del botón de ayuda experto, que analiza vehículos y aconseja repuestos.
* **Design System:** Interfaz modo oscuro (Dark Theme) con Tailwind, énfasis en modales personalizados y componentes funcionales (Hero Sections, Productos, Dashboards).

## Endpoints de la API (`/api/`)

* `/products` - GET, POST, PUT, DELETE para manejo del catálogo.
* `/products/:id` - GET para visualización individual con copy de ventas.
* `/categories` & `/brands` - Metadatos de agrupaciones.
* `/orders` - Creación de pedidos por parte del cliente y lectura de historial.
* `/orders/:id/status` - Actualización de estado del pedido por el admin.
* `/auth/login` - Autenticación basada en base de datos.
* `/users` - Registro de nuevos usuarios y lectura de listado por roles.
* `/settings` - Guarda credenciales de Flow y Chilexpress configurables desde el dashboard de Administrador.
* `/newsletter` - Gestión de suscripciones al boletín de noticias.
* `/chat` - Endpoint que se comunica con Gemini Flash para el soporte de la tienda.

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

## Credenciales Base

Para probar el **Panel de Control**:
1. Accede a la vista 'Mi Cuenta' (`/cuenta`).
2. Digita:
   - **Correo:** `admin@motorxpress.cl`
   - **Contraseña:** `admin123`
3. Haz clic en "Panel de Administración" para navegar al gestor de la tienda.
