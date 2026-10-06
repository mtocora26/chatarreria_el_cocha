import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const authUser = pgTable("user", {
  id: text()
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),
  name: text().notNull(),
  email: text().notNull().unique(),
  // Nombre con el que se inicia sesión; el correo queda como dato interno.
  username: text().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  role: text().notNull().default("user"),
  banned: boolean().notNull().default(false),
  banReason: text(),
  banExpires: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const authSession = pgTable(
  "session",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ipAddress: text(),
    userAgent: text(),
    impersonatedBy: text(),
    userId: text()
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const authAccount = pgTable(
  "account",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const authVerification = pgTable(
  "verification",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// Dinero en COP y peso en kg con gramos. Nunca float: evita errores de redondeo.
const dinero = () => numeric({ precision: 14, scale: 2 });
const pesoKg = () => numeric({ precision: 10, scale: 3 });
const equivalenciaKg = () => numeric({ precision: 10, scale: 6 });

const marcasDeTiempo = {
  creadoEn: timestamp({ withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const tipoTercero = pgEnum("tipo_tercero", ["cliente", "proveedor", "ambos"]);
export const tipoTransaccion = pgEnum("tipo_transaccion", ["compra", "venta"]);
export const estadoTransaccion = pgEnum("estado_transaccion", ["activa", "anulada"]);
export const tarifa = pgEnum("tarifa", ["minorista", "mayorista"]);
export const tipoMovimientoCapital = pgEnum("tipo_movimiento_capital", ["aporte", "retiro"]);
export const origenPeso = pgEnum("origen_peso", ["manual", "bascula"]);

export const materiales = pgTable(
  "materiales",
  {
    id: uuid().primaryKey().defaultRandom(),
    nombre: text().notNull(),
    precioCompraMinorista: dinero(),
    precioCompraMayorista: dinero(),
    precioVenta: dinero(),
    activo: boolean().notNull().default(true),
    ...marcasDeTiempo,
  },
  (t) => [
    uniqueIndex("materiales_nombre_unico").on(sql`lower(${t.nombre})`),
    check(
      "materiales_precios_no_negativos",
      sql`${t.precioCompraMinorista} >= 0 AND ${t.precioCompraMayorista} >= 0 AND ${t.precioVenta} >= 0`,
    ),
  ],
);

export const terceros = pgTable("terceros", {
  id: uuid().primaryKey().defaultRandom(),
  nombre: text().notNull(),
  documento: text(),
  telefono: text(),
  tipo: tipoTercero().notNull(),
  ...marcasDeTiempo,
});

export const transacciones = pgTable(
  "transacciones",
  {
    id: uuid().primaryKey().defaultRandom(),
    // Número del recibo interno; lo asigna la base para que no se repita.
    consecutivo: integer().generatedAlwaysAsIdentity().unique(),
    tipo: tipoTransaccion().notNull(),
    // Opcional en M0; la selección de tercero llega en I09.
    terceroId: uuid().references(() => terceros.id, { onDelete: "restrict" }),
    fecha: timestamp({ withTimezone: true }).notNull().defaultNow(),
    total: dinero().notNull(),
    medioPago: text(),
    estado: estadoTransaccion().notNull().default("activa"),
    // Las operaciones no se borran ni se editan: se anulan dejando quién, cuándo y por qué.
    anuladaEn: timestamp({ withTimezone: true }),
    anuladaPor: text().references(() => authUser.id, { onDelete: "restrict" }),
    motivoAnulacion: text(),
    // Operación anulada que esta reemplaza (flujo "Corregir"); una operación se corrige una vez.
    corrigeA: uuid().references((): AnyPgColumn => transacciones.id, { onDelete: "restrict" }),
    ...marcasDeTiempo,
  },
  (t) => [
    index("transacciones_fecha_idx").on(t.fecha),
    uniqueIndex("transacciones_corrige_a_unico").on(t.corrigeA),
    check("transacciones_total_no_negativo", sql`${t.total} >= 0`),
    check(
      "transacciones_anulacion_completa",
      sql`(${t.estado} = 'activa' AND ${t.anuladaEn} IS NULL AND ${t.anuladaPor} IS NULL AND ${t.motivoAnulacion} IS NULL)
        OR (${t.estado} = 'anulada' AND ${t.anuladaEn} IS NOT NULL AND ${t.anuladaPor} IS NOT NULL AND ${t.motivoAnulacion} IS NOT NULL)`,
    ),
  ],
);

export const lineasTransaccion = pgTable(
  "lineas_transaccion",
  {
    id: uuid().primaryKey().defaultRandom(),
    transaccionId: uuid()
      .notNull()
      .references(() => transacciones.id, { onDelete: "restrict" }),
    // restrict: un material con movimientos se desactiva, no se borra.
    materialId: uuid()
      .notNull()
      .references(() => materiales.id, { onDelete: "restrict" }),
    // Peso normalizado a kg para inventario; cantidad/unidad conservan la captura original.
    pesoKg: pesoKg().notNull(),
    cantidadPeso: pesoKg().notNull(),
    unidadPeso: text().notNull().default("kg"),
    equivalenciaKg: equivalenciaKg().notNull().default("1"),
    // Copia del precio al momento de la operación: editar el material no altera recibos previos.
    precioUnitario: dinero().notNull(),
    // Solo aplica a compras; en ventas queda vacío.
    tarifa: tarifa(),
    origenPeso: origenPeso().notNull().default("manual"),
    subtotal: dinero().notNull(),
  },
  (t) => [
    index("lineas_transaccion_transaccion_idx").on(t.transaccionId),
    index("lineas_transaccion_material_idx").on(t.materialId),
    check("lineas_transaccion_peso_positivo", sql`${t.pesoKg} > 0`),
    check(
      "lineas_transaccion_valores_no_negativos",
      sql`${t.precioUnitario} >= 0 AND ${t.subtotal} >= 0`,
    ),
    check("lineas_transaccion_unidad_peso_valida", sql`${t.unidadPeso} IN ('kg', 'lb', 'otra')`),
    check("lineas_transaccion_cantidad_positiva", sql`${t.cantidadPeso} > 0`),
    check("lineas_transaccion_equivalencia_positiva", sql`${t.equivalenciaKg} > 0`),
  ],
);

export const categoriasGasto = pgTable(
  "categorias_gasto",
  {
    id: uuid().primaryKey().defaultRandom(),
    nombre: text().notNull(),
    // restrict en gastos: una categoría con gastos se desactiva, no se borra.
    activo: boolean().notNull().default(true),
    ...marcasDeTiempo,
  },
  (t) => [uniqueIndex("categorias_gasto_nombre_unico").on(sql`lower(${t.nombre})`)],
);

export const gastos = pgTable(
  "gastos",
  {
    id: uuid().primaryKey().defaultRandom(),
    fecha: timestamp({ withTimezone: true }).notNull(),
    categoriaId: uuid()
      .notNull()
      .references(() => categoriasGasto.id, { onDelete: "restrict" }),
    monto: dinero().notNull(),
    descripcion: text(),
    // A quién se pagó; texto libre porque puede ser un trabajador o un proveedor ocasional.
    pagadoA: text(),
    medioPago: text(),
    estado: estadoTransaccion().notNull().default("activa"),
    // Igual que las operaciones: los gastos no se borran ni se editan, se anulan con rastro.
    anuladoEn: timestamp({ withTimezone: true }),
    anuladoPor: text().references(() => authUser.id, { onDelete: "restrict" }),
    motivoAnulacion: text(),
    creadoPor: text()
      .notNull()
      .references(() => authUser.id, { onDelete: "restrict" }),
    ...marcasDeTiempo,
  },
  (t) => [
    index("gastos_fecha_idx").on(t.fecha),
    index("gastos_categoria_idx").on(t.categoriaId),
    check("gastos_monto_positivo", sql`${t.monto} > 0`),
    check(
      "gastos_anulacion_completa",
      sql`(${t.estado} = 'activa' AND ${t.anuladoEn} IS NULL AND ${t.anuladoPor} IS NULL AND ${t.motivoAnulacion} IS NULL)
        OR (${t.estado} = 'anulada' AND ${t.anuladoEn} IS NOT NULL AND ${t.anuladoPor} IS NOT NULL AND ${t.motivoAnulacion} IS NOT NULL)`,
    ),
  ],
);

// Aportes (capital inicial, dinero que el dueño pone) y retiros. Se anulan, no se editan.
export const movimientosCapital = pgTable(
  "movimientos_capital",
  {
    id: uuid().primaryKey().defaultRandom(),
    fecha: timestamp({ withTimezone: true }).notNull(),
    tipo: tipoMovimientoCapital().notNull(),
    monto: dinero().notNull(),
    nota: text(),
    estado: estadoTransaccion().notNull().default("activa"),
    anuladoEn: timestamp({ withTimezone: true }),
    anuladoPor: text().references(() => authUser.id, { onDelete: "restrict" }),
    motivoAnulacion: text(),
    creadoPor: text()
      .notNull()
      .references(() => authUser.id, { onDelete: "restrict" }),
    ...marcasDeTiempo,
  },
  (t) => [
    index("movimientos_capital_fecha_idx").on(t.fecha),
    check("movimientos_capital_monto_positivo", sql`${t.monto} > 0`),
    check(
      "movimientos_capital_anulacion_completa",
      sql`(${t.estado} = 'activa' AND ${t.anuladoEn} IS NULL AND ${t.anuladoPor} IS NULL AND ${t.motivoAnulacion} IS NULL)
        OR (${t.estado} = 'anulada' AND ${t.anuladoEn} IS NOT NULL AND ${t.anuladoPor} IS NOT NULL AND ${t.motivoAnulacion} IS NOT NULL)`,
    ),
  ],
);
