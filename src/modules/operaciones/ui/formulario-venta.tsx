"use client";

import { useActionState, useState } from "react";
import { parsearPesos, type Pesos } from "@/shared/dominio/dinero";
import {
  calcularSubtotal,
  convertirAPesoGramos,
  formatearKg,
  formatearKgResumido,
  type Gramos,
} from "@/shared/dominio/peso";
import { Aviso } from "@/shared/ui/aviso";
import { claseBotonSecundario, claseTarjeta } from "@/shared/ui/estilos";
import {
  BarraTotal,
  BloqueCorreccion,
  CampoPrecio,
  CamposCantidad,
  EncabezadoLinea,
  type CorreccionEnCurso,
} from "./campos-linea";
import { useErroresVisibles } from "./errores";
import type { AccionFormularioOperacion } from "./estado-formulario";
import { useLineas, type DatosLinea } from "./lineas";
import { SelectorMaterial, type OpcionMaterial } from "./selector-material";
import { SelectorTercero } from "./selector-tercero";

export type MaterialParaVenta = {
  id: string;
  nombre: string;
  precioVenta: Pesos | null;
  stock: Gramos;
};

type FormularioVentaProps = {
  accion: AccionFormularioOperacion;
  materiales: MaterialParaVenta[];
  /** Clientes elegibles. */
  terceros: OpcionMaterial[];
  inicial?: { lineas: DatosLinea[]; terceroId: string };
  correccion?: CorreccionEnCurso;
};

export function FormularioVenta({
  accion,
  materiales,
  terceros,
  inicial,
  correccion,
}: FormularioVentaProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const [terceroId, setTerceroId] = useState(inicial?.terceroId ?? "");
  const { lineas, agregar, quitar, actualizar } = useLineas(inicial?.lineas);
  const { hayErrores, error, marcarEditado } = useErroresVisibles(estado);

  const materialDe = (id: string) => materiales.find((m) => m.id === id);
  // Vista previa; el servidor recalcula y vuelve a validar el stock al guardar.
  const subtotales = lineas.map((l) =>
    calcularSubtotal(
      convertirAPesoGramos(l.pesoKg, l.unidadPeso, l.equivalenciaKg) ?? 0,
      parsearPesos(l.precioPorKg) ?? 0,
    ),
  );
  const total = subtotales.reduce((suma, s) => suma + s, 0);
  // Solo se puede vender lo que hay: sin stock, el material aparece pero no se elige.
  const opciones = materiales.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    detalle: m.stock > 0 ? formatearKgResumido(m.stock) : "Sin stock",
    deshabilitado: m.stock <= 0,
  }));

  return (
    <form action={enviar} className="space-y-5" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}
      {hayErrores && !estado.mensaje && <Aviso tipo="error">Revisa los campos marcados.</Aviso>}

      {correccion && (
        <BloqueCorreccion tipo="venta" correccion={correccion} error={error("motivo")} />
      )}

      <SelectorTercero
        tipo="venta"
        opciones={terceros}
        valor={terceroId}
        onElegir={(id) => {
          setTerceroId(id);
          marcarEditado("terceroId");
        }}
        error={error("terceroId")}
      />

      <fieldset className="space-y-3">
        <legend className="sr-only">Materiales</legend>
        {lineas.map((linea, indice) => {
          const rutaMaterial = `lineas.${indice}.materialId`;
          const rutaPeso = `lineas.${indice}.pesoKg`;
          const rutaPrecio = `lineas.${indice}.precioPorKg`;
          const material = materialDe(linea.materialId);
          // Suma lo pedido del mismo material en las líneas anteriores, igual que el servidor.
          const pedido = lineas
            .slice(0, indice + 1)
            .filter((l) => l.materialId === linea.materialId)
            .reduce(
              (suma, l) =>
                suma + (convertirAPesoGramos(l.pesoKg, l.unidadPeso, l.equivalenciaKg) ?? 0),
              0,
            );
          const superaStock = material !== undefined && pedido > material.stock;
          const errorPeso =
            error(rutaPeso) ??
            (superaStock ? `Supera el stock: hay ${formatearKg(material.stock)}.` : undefined);

          return (
            <div key={linea.clave} className={`${claseTarjeta} p-4`}>
              <EncabezadoLinea
                indice={indice}
                subtotal={subtotales[indice]}
                puedeQuitar={lineas.length > 1}
                onQuitar={() => quitar(linea.clave)}
              />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
                <div>
                  <SelectorMaterial
                    id={`material-${linea.clave}`}
                    etiqueta="Material"
                    opciones={opciones}
                    valor={linea.materialId}
                    onElegir={(id) => {
                      const elegido = materialDe(id);
                      actualizar(linea.clave, {
                        materialId: id,
                        precioPorKg:
                          elegido?.precioVenta == null ? "" : String(elegido.precioVenta),
                      });
                      marcarEditado(rutaMaterial);
                    }}
                    invalido={Boolean(error(rutaMaterial))}
                  />
                  {material && (
                    <p className="mt-1 text-xs text-stone-500">
                      Disponible: {formatearKg(material.stock)}
                    </p>
                  )}
                  {error(rutaMaterial) && (
                    <p className="mt-1 text-sm text-red-700">{error(rutaMaterial)}</p>
                  )}
                </div>
                <CamposCantidad
                  linea={linea}
                  indice={indice}
                  error={errorPeso}
                  onCambiar={(cambios) => {
                    actualizar(linea.clave, cambios);
                    marcarEditado(rutaPeso);
                  }}
                />
                <CampoPrecio
                  linea={linea}
                  error={error(rutaPrecio)}
                  onCambiar={(precioPorKg) => {
                    actualizar(linea.clave, { precioPorKg });
                    marcarEditado(rutaPrecio);
                  }}
                />
              </div>
            </div>
          );
        })}
        {error("lineas") && <p className="text-sm text-red-700">{error("lineas")}</p>}
        <button
          type="button"
          onClick={agregar}
          className={`${claseBotonSecundario} w-full sm:w-auto`}
        >
          + Agregar otro material
        </button>
      </fieldset>

      <BarraTotal
        total={total}
        enviando={enviando}
        textoBoton={correccion ? "Guardar corrección" : "Registrar venta"}
      />
    </form>
  );
}
