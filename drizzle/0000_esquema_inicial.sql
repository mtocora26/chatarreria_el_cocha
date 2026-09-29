CREATE TYPE "public"."estado_transaccion" AS ENUM('activa', 'anulada');--> statement-breakpoint
CREATE TYPE "public"."origen_peso" AS ENUM('manual', 'bascula');--> statement-breakpoint
CREATE TYPE "public"."tarifa" AS ENUM('minorista', 'mayorista');--> statement-breakpoint
CREATE TYPE "public"."tipo_tercero" AS ENUM('cliente', 'proveedor', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."tipo_transaccion" AS ENUM('compra', 'venta');--> statement-breakpoint
CREATE TABLE "lineas_transaccion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaccion_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"peso_kg" numeric(10, 3) NOT NULL,
	"precio_unitario" numeric(14, 2) NOT NULL,
	"tarifa" "tarifa",
	"origen_peso" "origen_peso" DEFAULT 'manual' NOT NULL,
	"subtotal" numeric(14, 2) NOT NULL,
	CONSTRAINT "lineas_transaccion_peso_positivo" CHECK ("lineas_transaccion"."peso_kg" > 0),
	CONSTRAINT "lineas_transaccion_valores_no_negativos" CHECK ("lineas_transaccion"."precio_unitario" >= 0 AND "lineas_transaccion"."subtotal" >= 0)
);
--> statement-breakpoint
CREATE TABLE "materiales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"precio_compra_minorista" numeric(14, 2) NOT NULL,
	"precio_compra_mayorista" numeric(14, 2) NOT NULL,
	"precio_venta" numeric(14, 2) NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materiales_precios_no_negativos" CHECK ("materiales"."precio_compra_minorista" >= 0 AND "materiales"."precio_compra_mayorista" >= 0 AND "materiales"."precio_venta" >= 0)
);
--> statement-breakpoint
CREATE TABLE "terceros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"documento" text,
	"telefono" text,
	"tipo" "tipo_tercero" NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transacciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consecutivo" integer GENERATED ALWAYS AS IDENTITY (sequence name "transacciones_consecutivo_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tipo" "tipo_transaccion" NOT NULL,
	"tercero_id" uuid,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"total" numeric(14, 2) NOT NULL,
	"medio_pago" text,
	"estado" "estado_transaccion" DEFAULT 'activa' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transacciones_consecutivo_unique" UNIQUE("consecutivo"),
	CONSTRAINT "transacciones_total_no_negativo" CHECK ("transacciones"."total" >= 0)
);
--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD CONSTRAINT "lineas_transaccion_transaccion_id_transacciones_id_fk" FOREIGN KEY ("transaccion_id") REFERENCES "public"."transacciones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD CONSTRAINT "lineas_transaccion_material_id_materiales_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materiales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_tercero_id_terceros_id_fk" FOREIGN KEY ("tercero_id") REFERENCES "public"."terceros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lineas_transaccion_transaccion_idx" ON "lineas_transaccion" USING btree ("transaccion_id");--> statement-breakpoint
CREATE INDEX "lineas_transaccion_material_idx" ON "lineas_transaccion" USING btree ("material_id");--> statement-breakpoint
CREATE UNIQUE INDEX "materiales_nombre_unico" ON "materiales" USING btree (lower("nombre"));--> statement-breakpoint
CREATE INDEX "transacciones_fecha_idx" ON "transacciones" USING btree ("fecha");