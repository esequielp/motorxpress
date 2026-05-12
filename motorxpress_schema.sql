-- Marcas de vehículos
CREATE TABLE brands (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de vehículo
CREATE TABLE vehicle_types (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(40) NOT NULL UNIQUE
);

-- Transmisiones
CREATE TABLE transmissions (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL UNIQUE
);

-- Combustibles
CREATE TABLE fuels (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL UNIQUE
);

-- Vehículos únicos
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID NOT NULL REFERENCES brands(id),
  model           VARCHAR(80) NOT NULL,
  version         VARCHAR(80),
  vehicle_type_id UUID REFERENCES vehicle_types(id),
  fuel_id         UUID REFERENCES fuels(id),
  transmission_id UUID REFERENCES transmissions(id),
  displacement_cc NUMERIC(5,2),
  power_hp        NUMERIC(6,1),
  doors           SMALLINT,
  year_from       SMALLINT NOT NULL,
  year_to         SMALLINT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías de repuestos
CREATE TABLE part_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(80) NOT NULL UNIQUE,
  icon        VARCHAR(10),
  description TEXT
);

-- Productos (repuestos)
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             VARCHAR(40) NOT NULL UNIQUE,
  name            VARCHAR(200) NOT NULL,
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  category_id     UUID NOT NULL REFERENCES part_categories(id),
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock           INT NOT NULL DEFAULT 0,
  weight_kg       NUMERIC(5,3) DEFAULT 0.5,
  images          TEXT[] DEFAULT '{}',
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices críticos para performance
CREATE INDEX idx_products_vehicle   ON products(vehicle_id);
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_sku       ON products(sku);
CREATE INDEX idx_products_active    ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_brand     ON vehicles(brand_id);
CREATE INDEX idx_vehicles_years     ON vehicles(year_from, year_to);
CREATE INDEX idx_products_fts       ON products
  USING GIN (to_tsvector('spanish', name));

-- Clientes
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    UUID UNIQUE,           -- Supabase Auth UID (null = guest)
  email      VARCHAR(200) NOT NULL,
  first_name VARCHAR(80),
  last_name  VARCHAR(80),
  phone      VARCHAR(20),
  rut        VARCHAR(12),           -- Chilean tax ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direcciones de envío
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  label       VARCHAR(50),          -- "Casa", "Trabajo"
  street      VARCHAR(150) NOT NULL,
  number      VARCHAR(20),
  apartment   VARCHAR(40),
  commune     VARCHAR(80) NOT NULL, -- "Providencia", "Las Condes"
  region      VARCHAR(80) NOT NULL,
  zip_code    VARCHAR(10),
  is_default  BOOLEAN DEFAULT FALSE
);

-- Órdenes
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(20) NOT NULL UNIQUE, -- MX-2024-00001
  customer_id       UUID REFERENCES customers(id),
  guest_email       VARCHAR(200),
  status            VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | paid | preparing | shipped | delivered | cancelled
  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount          NUMERIC(10,2) DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  shipping_address  JSONB NOT NULL,
  billing_info      JSONB,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Items de una orden
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  sku         VARCHAR(40) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  subtotal    NUMERIC(10,2) NOT NULL
);

-- Transacciones de pago (Flow)
CREATE TABLE payment_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id),
  flow_token     VARCHAR(100) UNIQUE, -- token de Flow
  flow_order     VARCHAR(100),        -- commerceOrder de Flow
  status         VARCHAR(30),
  -- pending | accepted | rejected | cancelled | expired | annulled
  amount         NUMERIC(10,2),
  payment_method VARCHAR(50),
  paid_at        TIMESTAMPTZ,
  raw_response   JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Envíos (Chilexpress)
CREATE TABLE shipments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES orders(id),
  tracking_number      VARCHAR(50) UNIQUE,  -- OT de Chilexpress
  service_type         VARCHAR(30),         -- EXPRESS, PRIORITY
  estimated_delivery   DATE,
  status               VARCHAR(40),
  weight_kg            NUMERIC(6,3),
  declared_value       NUMERIC(10,2),
  label_url            TEXT,                -- URL PDF guía
  last_event           TEXT,
  last_event_at        TIMESTAMPTZ,
  raw_response         JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
