-- ============================================================
-- TecnoInstalador - Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE plan_type AS ENUM ('FREE', 'PRO', 'PREMIUM');
CREATE TYPE quote_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');
CREATE TYPE review_source AS ENUM ('link_unico', 'manual');

-- ─────────────────────────────────────────────
-- TRADES (Oficios predefinidos)
-- ─────────────────────────────────────────────

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icono TEXT, -- nombre del icono lucide
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO trades (nombre, slug, icono) VALUES
  ('Electricidad', 'electricidad', 'Zap'),
  ('Plomería', 'plomeria', 'Droplets'),
  ('Gas', 'gas', 'Flame'),
  ('Aire Acondicionado', 'aire-acondicionado', 'Wind'),
  ('Pintura', 'pintura', 'PaintBucket'),
  ('Carpintería', 'carpinteria', 'Hammer'),
  ('Albañilería', 'albanileria', 'HardHat'),
  ('Herrería', 'herreria', 'Wrench'),
  ('Cerrajería', 'cerrajeria', 'KeyRound'),
  ('Techista', 'techista', 'Home'),
  ('Jardinería', 'jardineria', 'Leaf'),
  ('Informática', 'informatica', 'Monitor');

-- ─────────────────────────────────────────────
-- SERVICES (Servicios por oficio)
-- ─────────────────────────────────────────────

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trade_id, slug)
);

-- Electricidad
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Instalaciones domiciliarias', 'instalaciones-domiciliarias' FROM trades WHERE slug = 'electricidad';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Tableros eléctricos', 'tableros-electricos' FROM trades WHERE slug = 'electricidad';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Puesta a tierra', 'puesta-a-tierra' FROM trades WHERE slug = 'electricidad';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Iluminación LED', 'iluminacion-led' FROM trades WHERE slug = 'electricidad';

-- Plomería
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de cañerías', 'reparacion-canerias' FROM trades WHERE slug = 'plomeria';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Destapaciones', 'destapaciones' FROM trades WHERE slug = 'plomeria';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Instalación sanitaria', 'instalacion-sanitaria' FROM trades WHERE slug = 'plomeria';

-- Gas
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Instalación de gas natural', 'instalacion-gas-natural' FROM trades WHERE slug = 'gas';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de calefones', 'reparacion-calefones' FROM trades WHERE slug = 'gas';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Instalación de garrafas', 'instalacion-garrafas' FROM trades WHERE slug = 'gas';

-- Aire Acondicionado
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Instalación de split', 'instalacion-split' FROM trades WHERE slug = 'aire-acondicionado';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Mantenimiento', 'mantenimiento' FROM trades WHERE slug = 'aire-acondicionado';
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de equipos', 'reparacion-equipos' FROM trades WHERE slug = 'aire-acondicionado';

-- ─────────────────────────────────────────────
-- INSTALLERS (Perfil profesional)
-- ─────────────────────────────────────────────

CREATE TABLE installers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  nombre_comercial TEXT,
  descripcion TEXT,
  ciudad TEXT NOT NULL,
  provincia TEXT NOT NULL,
  pais TEXT NOT NULL DEFAULT 'Argentina',
  telefono TEXT,
  whatsapp TEXT NOT NULL, -- formato internacional: 5491112345678
  url_slug TEXT NOT NULL UNIQUE,
  plan plan_type NOT NULL DEFAULT 'FREE',
  trial_ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  color_palette TEXT NOT NULL DEFAULT 'azul', -- azul | verde | amarillo | gris
  foto_perfil_url TEXT,
  banner_url TEXT,
  dominio_personalizado TEXT,
  dominio_personalizado_activo BOOLEAN DEFAULT FALSE,
  -- Stats cache
  total_reviews INT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INSTALLER_TRADES (Muchos a muchos)
-- ─────────────────────────────────────────────

CREATE TABLE installer_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(installer_id, trade_id)
);

-- ─────────────────────────────────────────────
-- INSTALLER_SERVICES (Muchos a muchos)
-- ─────────────────────────────────────────────

CREATE TABLE installer_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(installer_id, service_id)
);

-- ─────────────────────────────────────────────
-- GALLERY ITEMS
-- ─────────────────────────────────────────────

CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  titulo TEXT,
  descripcion TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  foto_url TEXT,
  client_name TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  source review_source NOT NULL DEFAULT 'link_unico',
  reply_from_installer TEXT,
  reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar avg_rating en installers
CREATE OR REPLACE FUNCTION update_installer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE installers
  SET 
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE installer_id = NEW.installer_id AND is_public = TRUE),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE installer_id = NEW.installer_id AND is_public = TRUE)
  WHERE id = NEW.installer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_installer_rating();

-- ─────────────────────────────────────────────
-- REVIEW INVITES (Links únicos para reseñas)
-- ─────────────────────────────────────────────

CREATE TABLE review_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  client_email TEXT,
  client_phone TEXT,
  client_name TEXT,
  token_unico TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- QUOTES (Presupuestos) - Solo Pro/Premium
-- ─────────────────────────────────────────────

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  descripcion_trabajo TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]', -- [{concepto, cantidad, precio_unitario, subtotal}]
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status quote_status NOT NULL DEFAULT 'DRAFT',
  whatsapp_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STATS (Analíticas básicas)
-- ─────────────────────────────────────────────

CREATE TABLE stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INT DEFAULT 0,
  whatsapp_clicks INT DEFAULT 0,
  UNIQUE(installer_id, date)
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Installers: el dueño puede hacer todo; público puede leer perfiles activos
CREATE POLICY "installers_public_read" ON installers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "installers_owner_all" ON installers FOR ALL USING (user_id = auth.uid());

-- Trades y services: lectura pública
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trades_public_read" ON trades FOR SELECT USING (TRUE);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (TRUE);

-- installer_trades
CREATE POLICY "installer_trades_public_read" ON installer_trades FOR SELECT USING (TRUE);
CREATE POLICY "installer_trades_owner_write" ON installer_trades FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- installer_services
CREATE POLICY "installer_services_public_read" ON installer_services FOR SELECT USING (TRUE);
CREATE POLICY "installer_services_owner_write" ON installer_services FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- gallery
CREATE POLICY "gallery_public_read" ON gallery_items FOR SELECT USING (TRUE);
CREATE POLICY "gallery_owner_write" ON gallery_items FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- reviews: público puede leer las públicas; cualquiera puede insertar (link único)
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_public = TRUE);
CREATE POLICY "reviews_anyone_insert" ON reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "reviews_owner_update" ON reviews FOR UPDATE
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- review_invites: solo el dueño
CREATE POLICY "review_invites_owner" ON review_invites FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));
CREATE POLICY "review_invites_token_read" ON review_invites FOR SELECT USING (TRUE);

-- quotes: solo el dueño
CREATE POLICY "quotes_owner" ON quotes FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- stats: solo el dueño puede ver
CREATE POLICY "stats_owner" ON stats FOR ALL
  USING (installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────

-- Upsert stats (para registrar visitas)
CREATE OR REPLACE FUNCTION increment_stat(
  p_installer_id UUID,
  p_field TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO stats (installer_id, date, profile_views, whatsapp_clicks)
  VALUES (p_installer_id, CURRENT_DATE, 
    CASE WHEN p_field = 'profile_views' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'whatsapp_clicks' THEN 1 ELSE 0 END
  )
  ON CONFLICT (installer_id, date) DO UPDATE SET
    profile_views = stats.profile_views + CASE WHEN p_field = 'profile_views' THEN 1 ELSE 0 END,
    whatsapp_clicks = stats.whatsapp_clicks + CASE WHEN p_field = 'whatsapp_clicks' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
