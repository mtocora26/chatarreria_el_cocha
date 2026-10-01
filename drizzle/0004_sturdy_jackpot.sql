ALTER TABLE "materiales" ALTER COLUMN "precio_compra_minorista" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "materiales" ALTER COLUMN "precio_compra_mayorista" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "materiales" ALTER COLUMN "precio_venta" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD COLUMN "cantidad_peso" numeric(10, 3) DEFAULT '0' NOT NULL;--> statement-breakpoint
UPDATE "lineas_transaccion" SET "cantidad_peso" = "peso_kg" WHERE "cantidad_peso" = '0';--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD COLUMN "unidad_peso" text DEFAULT 'kg' NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD COLUMN "equivalencia_kg" numeric(10, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD CONSTRAINT "lineas_transaccion_unidad_peso_valida" CHECK ("unidad_peso" IN ('kg', 'lb', 'otra'));--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD CONSTRAINT "lineas_transaccion_cantidad_positiva" CHECK ("cantidad_peso" > 0);--> statement-breakpoint
ALTER TABLE "lineas_transaccion" ADD CONSTRAINT "lineas_transaccion_equivalencia_positiva" CHECK ("equivalencia_kg" > 0);