# Documentación del Proyecto: MotorXpress (E-commerce)

Este documento detalla todas las funcionalidades implementadas hasta el momento en el proyecto de e-commerce MotorXpress.

## 1. Interfaz Principal de Usuario (Storefront)

### Página de Inicio (Home)
- Banner principal destacado para ofertas o productos estrella.
- Secciones de productos destacados (ej. los más vendidos, novedades).
- Acceso rápido a las categorías principales de repuestos o accesorios.

### Búsqueda y Navegación Header
- **Buscador global avanzado**: Permite buscar productos por nombre, marca, modelo o SKU desde cualquier vista de la tienda.
- **Menú de navegación**: Proporciona enlaces rápidos a las distintas secciones principales ("Catálogo", "Mi Cuenta", etc.).
- **Indicador de carrito**: El icono del carrito en el header muestra un contador en tiempo real con la cantidad total de artículos agregados.

### Catálogo de Productos
- Visualización en grilla de todos los productos disponibles.
- **Filtros dinámicos**: Los usuarios pueden filtrar el catálogo por:
  - Marca del producto.
  - Categoría específica.
- **Ordenación (Sorting)**: 
  - Por Relevancia.
  - Por precio (Ascendente y Descendente).
  - Alfabéticamente (A-Z y Z-A).
- Botón rápido para limpiar todos los filtros aplicados.
- Estados vacíos ("No se encontraron productos") cuando la combinación de filtros no produce resultados.

### Detalle de Producto
- Vista ampliada de un producto específico.
- Galería de imágenes (si el producto tiene más de una).
- Información detallada: Precio (precio normal y ofertas especiales), SKU, descripción, marca.
- Control de cantidades y botón para "Agregar al carrito".
- Información sobre tiempos y métodos de envío.

## 2. Proceso de Compra (Checkout)

### Carrito de Compras (Drawer/Panel Lateral)
- Panel deslizante para gestionar el pedido en cualquier momento sin abandonar la página actual.
- Modificación de cantidades (+ / -) y eliminación de articulos.
- Cálculo automático de subtotales.
- **Venta Cruzada (Cross-Selling) Inteligente**: Sugiere ofertas exclusivas y productos recomendados directamente en el panel para agregarlos con un solo clic.

### Checkout Paso a Paso
- **Paso 1: Datos de Envío**:
  - Formulario para datos personales del comprador (email, teléfono, RUT).
  - Selector y formulario de dirección de despacho (Región, Comuna, calle).
  - Opciones de método de envío calculadas (ej. Chilexpress Prioritario, u otras opciones configuradas).
- **Paso 2: Pago**:
  - Resumen completo de la compra (Subtotal, Costo de envío, Total).
  - Nuevamente presenta productos sugeridos de "venta cruzada" (Ofertas exclusivas para tu pedido).
  - Posibilidad de **"Volver a Datos de Envío"** de manera intuitiva para modificar información.
  - Integración de pasarela de pago (Flow / Webpay: débito, crédito, transferencia).
- **Paso 3: Confirmación**:
  - Página de éxito detallando el número de orden y confirmación del pago recibido y en proceso.

## 3. Administración (Admin Dashboard)

- **Panel de Control (Dashboard)**: Métricas principales, resumen de ventas y estado de la tienda en un vistazo.
- **Gestión del Catálogo**:
  - Agregar, editar y eliminar Productos.
  - Actualización de inventario, precios, categorización, y subida de imágenes.
- **Gestión de Marcas y Categorías**: Creación y organización de la taxonomía del catálogo.
- **Gestión de Pedidos**: Visualización de órdenes de compra recibidas, detalle del comprador, e iteración en el estado del envío para seguimiento logístico.

## 4. Tecnologías y Aspectos Técnicos Destacados
- **Arquitectura**: Frontend en React utilizando Hooks, Context API o gestor global de estado (para el cart store), y react-router-dom para el enrutamiento.
- **Estilos**: Tailwind CSS con tema personalizado oscuro/amarillo para alto contraste y diseño "automotriz".
- **Responsive Design**: Interfaces plenamente optimizadas e interactivas en dispositivos móviles y de escritorio.
- **Iconografía**: Utilización de iconos modernos (Lucide React) para clarificar acciones en la interfaz de usuario.
