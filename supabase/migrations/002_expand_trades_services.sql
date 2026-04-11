-- ═══════════════════════════════════════════════════════════
-- 002 — Expansión de oficios y servicios
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- SERVICIOS FALTANTES DE OFICIOS EXISTENTES
-- ─────────────────────────────────────────────

-- Electricidad (ampliado)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Automatización del hogar', 'automatizacion-hogar' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cargador para autos eléctricos', 'cargador-auto-electrico' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalaciones trifásicas', 'instalaciones-trifasicas' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Detección de fallas eléctricas', 'deteccion-fallas' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de generadores', 'instalacion-generadores' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Portero eléctrico y videoportero', 'portero-electrico' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Timbres, alarmas y sensores', 'timbres-alarmas' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de extractores y ventiladores', 'extractores-ventiladores' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cableado estructurado', 'cableado-estructurado' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de paneles solares', 'paneles-solares-elec' FROM trades WHERE slug = 'electricidad' ON CONFLICT DO NOTHING;

-- Plomería (ampliado)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de sanitarios', 'instalacion-sanitarios' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Griferías y duchadores', 'griferias-duchadores' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Termotanques y calefones', 'termotanques-calefones' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cámara séptica y pozo absorbente', 'camara-septica' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Bombas y presurizadores', 'bombas-presurizadores' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de filtros de agua', 'filtros-agua' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Conexiones para lavarropas y lavavajillas', 'conexiones-electrodomesticos' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Tanques de agua', 'tanques-agua' FROM trades WHERE slug = 'plomeria' ON CONFLICT DO NOTHING;

-- Gas (ampliado)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cocinas y hornos', 'instalacion-cocinas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de estufas', 'instalacion-estufas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Calefacción central', 'calefaccion-central' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'VTV de gas', 'vtv-gas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Certificados de instalación de gas', 'certificados-gas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Detección de pérdidas de gas', 'deteccion-perdidas-gas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Parrillas a gas', 'parrillas-gas' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de losa radiante', 'losa-radiante' FROM trades WHERE slug = 'gas' ON CONFLICT DO NOTHING;

-- Aire Acondicionado (ampliado)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de equipos inverter', 'instalacion-inverter' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza y desinfección de filtros', 'limpieza-filtros' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Carga de gas refrigerante', 'carga-gas-refrigerante' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cassette y ductos', 'cassette-ductos' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de equipos de ventana', 'reparacion-ventana' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desinstalación y mudanza de equipos', 'desinstalacion-equipo' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Frío comercial e industrial', 'frio-comercial' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Ventilación mecánica', 'ventilacion-mecanica' FROM trades WHERE slug = 'aire-acondicionado' ON CONFLICT DO NOTHING;

-- Pintura (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pintura interior', 'pintura-interior' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pintura exterior y fachadas', 'pintura-exterior' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Enduído y preparación de superficies', 'enduido-preparacion' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Texturados y estucos', 'texturados-estucos' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pintura de rejas y metales', 'pintura-metales' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Barnizado y lustrado de maderas', 'barnizado-maderas' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Impermeabilización con pintura', 'impermeabilizacion-pintura' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pintura decorativa y artística', 'pintura-decorativa' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pintura de locales y comercios', 'pintura-comercios' FROM trades WHERE slug = 'pintura' ON CONFLICT DO NOTHING;

-- Carpintería (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Muebles a medida', 'muebles-medida-carp' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Puertas y ventanas de madera', 'puertas-ventanas' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Closets y placards', 'closets-placards' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cocinas de madera', 'cocinas-madera' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Decks y pérgolas', 'decks-pergolas' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de pisos flotantes', 'pisos-flotantes' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de muebles', 'reparacion-muebles' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Escaleras de madera', 'escaleras-madera' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Marcos, zócalos y molduras', 'marcos-zocalos' FROM trades WHERE slug = 'carpinteria' ON CONFLICT DO NOTHING;

-- Albañilería (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Construcción de muros y tabiques', 'construccion-muros' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de cerámicos y porcelanato', 'ceramicos-porcelanato' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Revoque fino y grueso', 'revoque-fino-grueso' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Contrapiso y carpeta de cemento', 'contrapiso-carpeta' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de grietas y fisuras', 'grietas-fisuras' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mampostería en seco (Durlock)', 'durlock' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Demoliciones y escombros', 'demoliciones' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Ampliaciones y reformas', 'ampliaciones-reformas' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cordones, veredas y zanjeos', 'cordones-veredas' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Construcción de asados y fogones', 'asados-fogones' FROM trades WHERE slug = 'albanileria' ON CONFLICT DO NOTHING;

-- Herrería (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Rejas de seguridad', 'rejas-seguridad' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Portones de hierro', 'portones-hierro' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Escaleras metálicas', 'escaleras-metalicas' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Estructuras metálicas', 'estructuras-metalicas' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Techos de chapa y estructura', 'techos-chapa-herreria' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mesas y muebles de hierro', 'muebles-hierro' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Puertas de chapa', 'puertas-chapa' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de herrería en general', 'reparacion-herreria' FROM trades WHERE slug = 'herreria' ON CONFLICT DO NOTHING;

-- Cerrajería (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Apertura de puertas sin llave', 'apertura-puertas' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cambio y reparación de cerraduras', 'cambio-cerraduras' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Duplicado de llaves', 'duplicado-llaves' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cerraduras de alta seguridad', 'cerraduras-alta-seguridad' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cerraduras electrónicas y biométricas', 'cerraduras-electronicas' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cajas de seguridad', 'cajas-seguridad' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cortinas de enrollar', 'cortinas-enrollar' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Blindaje de puertas', 'blindaje-puertas' FROM trades WHERE slug = 'cerrajeria' ON CONFLICT DO NOTHING;

-- Techista (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Techos de chapa (zinc, galvanizada)', 'techos-chapa-zinc' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Techos de tejas cerámicas', 'techos-tejas' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Impermeabilización de losa', 'impermeabilizacion-losa' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de filtraciones', 'reparacion-filtraciones' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Canaletas y bajadas pluviales', 'canaletas-bajadas' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Techos de policarbonato y acrílico', 'techos-policarbonato' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Membrana asfáltica', 'membrana-asfaltica' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Techos verdes', 'techos-verdes' FROM trades WHERE slug = 'techista' ON CONFLICT DO NOTHING;

-- Jardinería (servicios)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Diseño de jardines', 'diseno-jardines' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mantenimiento y corte de césped', 'mantenimiento-cesped' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Poda de árboles y arbustos', 'poda-arboles' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de riego automático', 'riego-automatico' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Plantación y transplante', 'plantacion' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de terrenos', 'limpieza-terrenos' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Jardines verticales', 'jardines-verticales' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Piletas y estanques', 'piletas-estanques' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Fumigación de jardines', 'fumigacion-jardines' FROM trades WHERE slug = 'jardineria' ON CONFLICT DO NOTHING;

-- Informática (servicios ampliados y más específicos)
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de PCs y notebooks', 'reparacion-pc-notebook' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Formateo e instalación de Windows/Linux', 'formateo-windows-linux' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de virus y malware', 'limpieza-virus' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Recuperación de datos', 'recuperacion-datos' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Actualización y upgrade de hardware', 'upgrade-hardware' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de redes y Wi-Fi', 'config-redes-wifi' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de programas y Office', 'instalacion-software' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de celulares y tablets', 'reparacion-celulares-tab' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cámaras IP', 'camaras-ip' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación Starlink', 'instalacion-starlink' FROM trades WHERE slug = 'informatica' ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- NUEVOS OFICIOS
-- ─────────────────────────────────────────────
INSERT INTO trades (nombre, slug, icono) VALUES
  ('Técnico PC y Notebooks',           'tecnico-pc',              'Monitor'),
  ('Técnico en Celulares',             'tecnico-celulares',       'Smartphone'),
  ('Redes e Internet',                 'redes-internet',          'Wifi'),
  ('Cámaras y Seguridad CCTV',         'camaras-seguridad',       'Camera'),
  ('Muebles a Medida / MDF',           'muebles-medida',          'Package'),
  ('Domótica y Smart Home',            'domotica',                'Cpu'),
  ('Portones y Automatismos',          'portones-automatismos',   'DoorOpen'),
  ('Pisos y Revestimientos',           'pisos-revestimientos',    'Layers'),
  ('Impermeabilización',               'impermeabilizacion',      'Shield'),
  ('Vidriería y Aberturas',            'vidrieria',               'Square'),
  ('Reparación de Electrodomésticos',  'electrodomesticos',       'Tv'),
  ('Antenas y TV',                     'antenas-tv',              'Radio'),
  ('Mudanzas y Fletes',                'mudanzas-fletes',         'Truck'),
  ('Fumigación y Control de Plagas',   'fumigacion',              'Bug'),
  ('Energías Renovables',              'energias-renovables',     'Sun'),
  ('Soldadura',                        'soldadura',               'Flame'),
  ('Limpieza Profesional',             'limpieza',                'Sparkles'),
  ('Pintor de Automóviles',            'pintura-automotriz',      'Car'),
  ('Mecánica del Hogar',               'mecanica-hogar',          'Settings')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- SERVICIOS PARA NUEVOS OFICIOS
-- ─────────────────────────────────────────────

-- Técnico PC y Notebooks
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de hardware (placa madre, RAM, disco)', 'reparacion-hardware' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación y reinstalación de Windows', 'instalacion-windows' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de Linux (Ubuntu, Mint, etc.)', 'instalacion-linux' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza interna y pasta térmica', 'limpieza-pasta-termica' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Recuperación de datos y backup', 'recuperacion-backup' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Upgrade: SSD, RAM, GPU', 'upgrade-ssd-ram' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Armado de PC a medida', 'armado-pc-medida' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de pantallas de notebook', 'reparacion-pantalla-notebook' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Eliminar virus, ransomware y malware', 'eliminar-virus' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soporte remoto por TeamViewer/AnyDesk', 'soporte-remoto' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de Office y Microsoft 365', 'config-office' FROM trades WHERE slug = 'tecnico-pc' ON CONFLICT DO NOTHING;

-- Técnico en Celulares
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cambio de pantalla (iPhone, Samsung, Motorola)', 'cambio-pantalla' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cambio de batería', 'cambio-bateria' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de puerto de carga', 'reparacion-puerto-carga' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Recuperación de datos del celular', 'recuperacion-datos-cel' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desbloqueo de celulares', 'desbloqueo-celular' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de cámara trasera/delantera', 'reparacion-camara-cel' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de tablets y iPads', 'reparacion-tablets' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza interna y reparación por humedad', 'limpieza-humedad' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Actualización de software y reseteo de fábrica', 'reset-fabrica' FROM trades WHERE slug = 'tecnico-celulares' ON CONFLICT DO NOTHING;

-- Redes e Internet
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de Starlink', 'instalacion-starlink-redes' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de router y Wi-Fi', 'config-router-wifi' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Extensión de cobertura Wi-Fi (mesh)', 'extension-cobertura-wifi' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cableado de red (Cat5e, Cat6)', 'cableado-red' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de fibra óptica domiciliaria', 'fibra-optica' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de antenas WiMAX/LTE', 'antenas-wimax-lte' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de NAS y servidores', 'config-nas-servidor' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Red para empresas y comercios (rack, switch)', 'red-empresas' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Repetidores y puntos de acceso', 'repetidores-ap' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soporte y diagnóstico de conectividad', 'soporte-conectividad' FROM trades WHERE slug = 'redes-internet' ON CONFLICT DO NOTHING;

-- Cámaras y Seguridad CCTV
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cámaras IP (WiFi)', 'camaras-ip-wifi' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cámaras análogas CCTV', 'camaras-analogas-cctv' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de DVR/NVR', 'instalacion-dvr-nvr' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Visualización remota desde el celular', 'vision-remota-celular' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cámaras con detección de movimiento', 'camaras-deteccion-movimiento' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de alarmas perimetrales', 'alarmas-perimetrales' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Control de acceso y teclados', 'control-acceso' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de videoportero IP', 'videoportero-ip' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mantenimiento y limpieza de cámaras', 'mantenimiento-camaras' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cámaras de seguridad para autos', 'camaras-autos' FROM trades WHERE slug = 'camaras-seguridad' ON CONFLICT DO NOTHING;

-- Muebles a Medida / MDF
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Armado de muebles de MDF', 'armado-mdf' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Diseño y fabricación de closets', 'diseno-closets' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Muebles de cocina a medida', 'muebles-cocina-medida' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Roperos con puerta corrediza', 'roperos-corredizos' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Estantes y bibliotecas', 'estantes-bibliotecas' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Placares y bajo escalera', 'placares-bajo-escalera' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mesas y escritorios a medida', 'mesas-escritorios' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mobiliario para comercios y oficinas', 'mobiliario-comercios' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Armado de muebles de IKEA/Easy/Sodimac', 'armado-muebles-fabrica' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación y restauración de muebles', 'restauracion-muebles' FROM trades WHERE slug = 'muebles-medida' ON CONFLICT DO NOTHING;

-- Domótica y Smart Home
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de luces inteligentes', 'luces-inteligentes' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de Alexa y Google Home', 'alexa-google-home' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de termostatos inteligentes', 'termostatos-smart' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Enchufes y llaves inteligentes', 'enchufes-llaves-smart' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Control de persianas y cortinas automáticas', 'cortinas-automaticas' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de cerraduras inteligentes', 'cerraduras-smart' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Sistema Home Assistant (open source)', 'home-assistant' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Automatización de garaje y portón', 'automatizacion-garage' FROM trades WHERE slug = 'domotica' ON CONFLICT DO NOTHING;

-- Portones y Automatismos
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de motor para portón corredizo', 'motor-porton-corredizo' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de motor para portón abatible', 'motor-porton-abatible' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de barrera vehicular', 'barrera-vehicular' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de portones automáticos', 'reparacion-portones' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de garaje automático', 'garaje-automatico' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Control de acceso vehicular', 'acceso-vehicular' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Automatización de persianas de enrollar', 'persianas-automaticas' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Controles remotos y app', 'controles-remotos-app' FROM trades WHERE slug = 'portones-automatismos' ON CONFLICT DO NOTHING;

-- Pisos y Revestimientos
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de cerámicos y porcelanato', 'colocacion-ceramicos' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de pisos flotantes laminados', 'pisos-laminados' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de pisos de madera (parquet)', 'pisos-parquet' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de pisos vinílicos y SPC', 'pisos-vinilicos' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Microcemento', 'microcemento' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Revestimientos de pared (subway tile, metro)', 'revestimientos-pared' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pulido y plastificado de pisos', 'pulido-pisos' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de zócalos y terminaciones', 'zocalos-terminaciones' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pisos de cemento alisado', 'cemento-alisado' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de juntas y grietas en pisos', 'reparacion-juntas' FROM trades WHERE slug = 'pisos-revestimientos' ON CONFLICT DO NOTHING;

-- Impermeabilización
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Impermeabilización de losa y azoteas', 'impermeabilizacion-losa-azoteas' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Membrana líquida y acrílica', 'membrana-liquida-acrilica' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Inyección en muros (humedad ascendente)', 'inyeccion-muros' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Impermeabilización de baños y piletas', 'impermeabilizacion-banos' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Sellado de juntas y fisuras', 'sellado-juntas-fisuras' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Membrana asfáltica con aluminio', 'membrana-asfaltica-aluminio' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Impermeabilización de sótanos y subsuelos', 'impermeabilizacion-sotanos' FROM trades WHERE slug = 'impermeabilizacion' ON CONFLICT DO NOTHING;

-- Vidriería y Aberturas
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Colocación de vidrios de ventanas y puertas', 'colocacion-vidrios' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Ventanas y puertas de aluminio', 'ventanas-aluminio' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Vidrio templado y laminado', 'vidrio-templado' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación y cambio de vidrios rotos', 'cambio-vidrios-rotos' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mamparas de baño', 'mamparas-bano' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Espejos a medida', 'espejos-medida' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Puertas y frentes de vidrio', 'puertas-frentes-vidrio' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Ventanas DVH (doble vidriado)', 'ventanas-dvh' FROM trades WHERE slug = 'vidrieria' ON CONFLICT DO NOTHING;

-- Reparación de Electrodomésticos
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de lavarropas', 'reparacion-lavarropas' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de heladeras y freezers', 'reparacion-heladeras' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de hornos y cocinas', 'reparacion-hornos-cocinas' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de lavavajillas', 'reparacion-lavavajillas' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de microondas', 'reparacion-microondas' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de TV y monitores', 'reparacion-tv' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de aspiradoras', 'reparacion-aspiradoras' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación y conexión de electrodomésticos', 'instalacion-electrodomesticos' FROM trades WHERE slug = 'electrodomesticos' ON CONFLICT DO NOTHING;

-- Antenas y TV
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de antena de aire (TDA/digital)', 'antena-aire-tda' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de antena parabólica satelital', 'antena-parabolica' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de decodificador y STB', 'config-decodificador' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de TV cable y fibra', 'instalacion-tv-cable' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Distribución de señal de TV por la casa', 'distribucion-senal-tv' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Configuración de Smart TV y streaming', 'config-smart-tv' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de antena de radio (FM/AM)', 'antena-radio-fm' FROM trades WHERE slug = 'antenas-tv' ON CONFLICT DO NOTHING;

-- Mudanzas y Fletes
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mudanzas locales', 'mudanzas-locales' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Mudanzas a otras provincias', 'mudanzas-interprovinciales' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Flete de muebles y electrodomésticos', 'flete-muebles' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Embalaje y desembalaje profesional', 'embalaje-profesional' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Guardamuebles temporario', 'guardamuebles' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Traslado de materiales de construcción', 'traslado-materiales' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Montaje y desmontaje de muebles', 'montaje-desmontaje' FROM trades WHERE slug = 'mudanzas-fletes' ON CONFLICT DO NOTHING;

-- Fumigación y Control de Plagas
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desinsectación (cucarachas, hormigas, pulgas)', 'desinsectacion' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desratización (ratas y ratones)', 'desratizacion' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Control de termitas', 'control-termitas' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Fumigación de jardines y plantas', 'fumigacion-jardines-plagas' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desinfección de ambientes (COVID, bacterias)', 'desinfeccion-ambientes' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Control de murciélagos y palomas', 'control-palomas-murcielagos' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Certificado de fumigación', 'certificado-fumigacion' FROM trades WHERE slug = 'fumigacion' ON CONFLICT DO NOTHING;

-- Energías Renovables
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de paneles solares fotovoltaicos', 'paneles-solares-fv' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Sistema solar off-grid (aislado de red)', 'solar-offgrid' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Sistema solar on-grid (inyección a red)', 'solar-ongrid' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Instalación de baterías de litio y acumuladores', 'baterias-litio' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Calefón solar termosifón', 'calefon-solar' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Molinos y aerogeneradores', 'aerogeneradores' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Auditoría energética del hogar', 'auditoria-energetica' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Cargadores solares para vehículos eléctricos', 'cargadores-solares-ev' FROM trades WHERE slug = 'energias-renovables' ON CONFLICT DO NOTHING;

-- Soldadura
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soldadura MIG/MAG', 'soldadura-mig-mag' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soldadura TIG (acero inoxidable, aluminio)', 'soldadura-tig' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soldadura de arco eléctrico', 'soldadura-arco' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soldadura autógena (oxiacetilénica)', 'soldadura-autogena' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Reparación de piezas metálicas', 'reparacion-piezas-metal' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Fabricación de estructuras y marcos', 'fabricacion-estructuras' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Soldadura de cañerías (gas, agua, industrial)', 'soldadura-cañerias' FROM trades WHERE slug = 'soldadura' ON CONFLICT DO NOTHING;

-- Limpieza Profesional
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de hogares y departamentos', 'limpieza-hogares' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de oficinas y comercios', 'limpieza-oficinas' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza post-obra y post-mudanza', 'limpieza-post-obra' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Lavado de alfombras y tapizados', 'lavado-alfombras-tapizados' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de tanques de agua', 'limpieza-tanques-agua' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Desinfección y sanitización', 'desinfeccion-sanitizacion' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Limpieza de vidrios en altura', 'limpieza-vidrios-altura' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
INSERT INTO services (trade_id, nombre, slug) SELECT id, 'Pulido y encerado de pisos', 'pulido-encerado-pisos' FROM trades WHERE slug = 'limpieza' ON CONFLICT DO NOTHING;
