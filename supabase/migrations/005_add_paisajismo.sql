-- Agregar servicio Paisajismo bajo el trade Jardinería
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Paisajismo', 'paisajismo'
FROM trades
WHERE slug = 'jardineria'
ON CONFLICT DO NOTHING;
