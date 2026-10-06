CREATE TYPE "public"."tipo_movimiento_capital" AS ENUM('aporte', 'retiro');--> statement-breakpoint
CREATE TABLE "movimientos_capital" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"tipo" "tipo_movimiento_capital" NOT NULL,
	"monto" numeric(14, 2) NOT NULL,
	"nota" text,
	"estado" "estado_transaccion" DEFAULT 'activa' NOT NULL,
	"anulado_en" timestamp with time zone,
	"anulado_por" text,
	"motivo_anulacion" text,
	"creado_por" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movimientos_capital_monto_positivo" CHECK ("movimientos_capital"."monto" > 0),
	CONSTRAINT "movimientos_capital_anulacion_completa" CHECK (("movimientos_capital"."estado" = 'activa' AND "movimientos_capital"."anulado_en" IS NULL AND "movimientos_capital"."anulado_por" IS NULL AND "movimientos_capital"."motivo_anulacion" IS NULL)
        OR ("movimientos_capital"."estado" = 'anulada' AND "movimientos_capital"."anulado_en" IS NOT NULL AND "movimientos_capital"."anulado_por" IS NOT NULL AND "movimientos_capital"."motivo_anulacion" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "movimientos_capital" ADD CONSTRAINT "movimientos_capital_anulado_por_user_id_fk" FOREIGN KEY ("anulado_por") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_capital" ADD CONSTRAINT "movimientos_capital_creado_por_user_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "movimientos_capital_fecha_idx" ON "movimientos_capital" USING btree ("fecha");