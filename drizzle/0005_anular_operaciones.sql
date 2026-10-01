ALTER TABLE "transacciones" ADD COLUMN "anulada_en" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transacciones" ADD COLUMN "anulada_por" text;--> statement-breakpoint
ALTER TABLE "transacciones" ADD COLUMN "motivo_anulacion" text;--> statement-breakpoint
ALTER TABLE "transacciones" ADD COLUMN "corrige_a" uuid;--> statement-breakpoint
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_anulada_por_user_id_fk" FOREIGN KEY ("anulada_por") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_corrige_a_transacciones_id_fk" FOREIGN KEY ("corrige_a") REFERENCES "public"."transacciones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "transacciones_corrige_a_unico" ON "transacciones" USING btree ("corrige_a");--> statement-breakpoint
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_anulacion_completa" CHECK (("transacciones"."estado" = 'activa' AND "transacciones"."anulada_en" IS NULL AND "transacciones"."anulada_por" IS NULL AND "transacciones"."motivo_anulacion" IS NULL)
        OR ("transacciones"."estado" = 'anulada' AND "transacciones"."anulada_en" IS NOT NULL AND "transacciones"."anulada_por" IS NOT NULL AND "transacciones"."motivo_anulacion" IS NOT NULL));