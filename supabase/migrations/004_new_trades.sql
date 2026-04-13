-- New trades: bobinador, tornero, tapicero, mecánico de motos, and more

INSERT INTO trades (nombre, slug, icono) VALUES
  ('Bobinador / Técnico en Motores', 'bobinador',         'Rotate'),
  ('Tornero / Fresador',             'tornero',           'Tool'),
  ('Tapicero',                       'tapicero',          'Armchair'),
  ('Mecánico de Motos',              'mecanico-motos',    'Motorbike'),
  ('Técnico en Heladeras',           'tecnico-heladeras', 'Snowflake'),
  ('Técnico en Lavarropas',          'tecnico-lavarropas','WashMachine'),
  ('Veterinario a Domicilio',        'veterinario',       'Paw'),
  ('Maestro Mayor de Obras',         'maestro-obras',     'BuildingSkyscraper')
ON CONFLICT (slug) DO NOTHING;

-- Services for Bobinador
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Rebobinado de motores eléctricos', 'rebobinado-motores' FROM trades WHERE slug = 'bobinador' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de bombas de agua', 'reparacion-bombas' FROM trades WHERE slug = 'bobinador' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de herramientas eléctricas', 'reparacion-herramientas' FROM trades WHERE slug = 'bobinador' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Transformadores y balastos', 'transformadores' FROM trades WHERE slug = 'bobinador' ON CONFLICT DO NOTHING;

-- Services for Tornero
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Torneado de piezas a medida', 'torneado-piezas' FROM trades WHERE slug = 'tornero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Fresado y mecanizado', 'fresado-mecanizado' FROM trades WHERE slug = 'tornero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Fabricación de ejes y bujes', 'ejes-bujes' FROM trades WHERE slug = 'tornero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Roscado y rectificado', 'roscado-rectificado' FROM trades WHERE slug = 'tornero' ON CONFLICT DO NOTHING;

-- Services for Tapicero
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Tapizado de sillones y sofás', 'tapizado-sillones' FROM trades WHERE slug = 'tapicero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Tapizado de sillas y comedores', 'tapizado-sillas' FROM trades WHERE slug = 'tapicero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Tapizado de cabeceras', 'tapizado-cabeceras' FROM trades WHERE slug = 'tapicero' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Restauración de muebles', 'restauracion-muebles' FROM trades WHERE slug = 'tapicero' ON CONFLICT DO NOTHING;

-- Services for Mecánico de Motos
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Service completo de moto', 'service-moto' FROM trades WHERE slug = 'mecanico-motos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Cambio de aceite y filtros', 'aceite-filtros-moto' FROM trades WHERE slug = 'mecanico-motos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de motor', 'reparacion-motor-moto' FROM trades WHERE slug = 'mecanico-motos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Frenos y suspensión', 'frenos-suspension-moto' FROM trades WHERE slug = 'mecanico-motos' ON CONFLICT DO NOTHING;

-- Services for Técnico en Heladeras
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de heladeras domésticas', 'reparacion-heladera' FROM trades WHERE slug = 'tecnico-heladeras' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Carga de gas refrigerante (heladera)', 'carga-gas-heladera' FROM trades WHERE slug = 'tecnico-heladeras' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de freezers', 'reparacion-freezer' FROM trades WHERE slug = 'tecnico-heladeras' ON CONFLICT DO NOTHING;

-- Services for Técnico en Lavarropas
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de lavarropas automáticos', 'reparacion-lavarropas' FROM trades WHERE slug = 'tecnico-lavarropas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Cambio de correas y escobillas', 'correas-escobillas' FROM trades WHERE slug = 'tecnico-lavarropas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Reparación de secarropas', 'reparacion-secarropas' FROM trades WHERE slug = 'tecnico-lavarropas' ON CONFLICT DO NOTHING;
