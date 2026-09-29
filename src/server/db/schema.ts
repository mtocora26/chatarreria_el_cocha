import { sql } from "drizzle-orm";
import {
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

// Dinero en COP y peso en kg con gramos. Nunca float: evita errores de redondeo.
const dinero = () => numeric({ precision: 14, scale: 2 });
const pesoKg = () => numeric({ precision: 10, scale: 3 });

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
export const origenPeso = pgEnum("origen_peso", ["manual", "bascula"]);

export const materiales = pgTable(
  "materiales",
  {
    id: uuid().primaryKey().defaultRandom(),
    nombre: text().notNull(),
    precioCompraMinorista: dinero().notNull(),
    precioCompraMayorista: dinero().notNull(),
    precioVenta: dinero().notNull(),
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
    ...marcasDeTiempo,
  },
  (t) => [
    index("transacciones_fecha_idx").on(t.fecha),
    check("transacciones_total_no_negativo", sql`${t.total} >= 0`),
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
    pesoKg: pesoKg().notNull(),
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
  ],
);
