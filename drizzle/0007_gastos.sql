CREATE TABLE "categorias_gasto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gastos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"categoria_id" uuid NOT NULL,
	"monto" numeric(14, 2) NOT NULL,
	"descripcion" text,
	"pagado_a" text,
	"medio_pago" text,
	"estado" "estado_transaccion" DEFAULT 'activa' NOT NULL,
	"anulado_en" timestamp with time zone,
	"anulado_por" text,
	"motivo_anulacion" text,
	"creado_por" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gastos_monto_positivo" CHECK ("gastos"."monto" > 0),
	CONSTRAINT "gastos_anulacion_completa" CHECK (("gastos"."estado" = 'activa' AND "gastos"."anulado_en" IS NULL AND "gastos"."anulado_por" IS NULL AND "gastos"."motivo_anulacion" IS NULL)
        OR ("gastos"."estado" = 'anulada' AND "gastos"."anulado_en" IS NOT NULL AND "gastos"."anulado_por" IS NOT NULL AND "gastos"."motivo_anulacion" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_categoria_id_categorias_gasto_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_gasto"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_anulado_por_user_id_fk" FOREIGN KEY ("anulado_por") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_creado_por_user_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_gasto_nombre_unico" ON "categorias_gasto" USING btree (lower("nombre"));--> statement-breakpoint
CREATE INDEX "gastos_fecha_idx" ON "gastos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "gastos_categoria_idx" ON "gastos" USING btree ("categoria_id");--> statement-breakpoint
INSERT INTO "categorias_gasto" ("nombre") VALUES
  ('Pago a trabajadores'),
  ('Transporte y fletes'),
  ('Servicios públicos'),
  ('Arriendo'),
  ('Mantenimiento y herramientas'),
  ('Insumos'),
  ('Impuestos y trámites'),
  ('Otros');
