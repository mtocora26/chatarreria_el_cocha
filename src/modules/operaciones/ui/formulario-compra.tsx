"use client";

import { useActionState, useState } from "react";
import type { Tarifa } from "@/modules/materiales/domain/material";
import { formatearCOP, parsearPesos, type Pesos } from "@/shared/dominio/dinero";
import { calcularSubtotal, convertirAPesoGramos } from "@/shared/dominio/peso";
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
import { DialogoNuevoMaterial, type ResultadoNuevoMaterial } from "./dialogo-nuevo-material";
import { useErroresVisibles } from "./errores";
import type { AccionFormularioOperacion } from "./estado-formulario";
import { useLineas, type DatosLinea } from "./lineas";
import { SelectorMaterial, type OpcionMaterial } from "./selector-material";
import { SelectorTercero } from "./selector-tercero";

export type MaterialParaCompra = {
  id: string;
  nombre: string;
  precioCompraMinorista: Pesos | null;
  precioCompraMayorista: Pesos | null;
};

type FormularioCompraProps = {
  accion: AccionFormularioOperacion;
  materiales: MaterialParaCompra[];
  /** Proveedores elegibles. */
  terceros: OpcionMaterial[];
  crearMaterial: (nombre: string, precio: string) => Promise<ResultadoNuevoMaterial>;
  reactivarMaterial: (id: string) => Promise<ResultadoNuevoMaterial>;
  inicial?: { tarifa: Tarifa; lineas: DatosLinea[]; terceroId: string };
  correccion?: CorreccionEnCurso;
};

const TARIFAS: { valor: Tarifa; etiqueta: string }[] = [
  { valor: "minorista", etiqueta: "Minorista" },
  { valor: "mayorista", etiqueta: "Mayorista" },
];

const precioSegun = (material: MaterialParaCompra | undefined, tarifa: Tarifa) =>
  (tarifa === "mayorista" ? material?.precioCompraMayorista : material?.precioCompraMinorista) ??
  null;

export function FormularioCompra({
  accion,
  materiales,
  terceros,
  crearMaterial,
  reactivarMaterial,
  inicial,
  correccion,
}: FormularioCompraProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const [terceroId, setTerceroId] = useState(inicial?.terceroId ?? "");
  const [tarifa, setTarifa] = useState<Tarifa>(inicial?.tarifa ?? "minorista");
  // Los materiales creados desde aquí se suman sin recargar la página.
  const [catalogo, setCatalogo] = useState(materiales);
  const [creando, setCreando] = useState<{ clave: number; nombre: string } | null>(null);
  const { lineas, agregar, quitar, actualizar } = useLineas(inicial?.lineas);
  const { hayErrores, error, marcarEditado } = useErroresVisibles(estado);

  const materialDe = (id: string) => catalogo.find((m) => m.id === id);
  // Vista previa; el servidor vuelve a calcular al guardar.
  const subtotales = lineas.map((l) =>
    calcularSubtotal(
      convertirAPesoGramos(l.pesoKg, l.unidadPeso, l.equivalenciaKg) ?? 0,
      parsearPesos(l.precioPorKg) ?? 0,
    ),
  );
  const total = subtotales.reduce((suma, s) => suma + s, 0);
  const opciones = catalogo.map((m) => {
    const precio = precioSegun(m, tarifa);
    return {
      id: m.id,
      nombre: m.nombre,
      detalle: precio === null ? undefined : `${formatearCOP(precio)}/kg`,
    };
  });

  function elegirMaterial(clave: number, indice: number, material: MaterialParaCompra | undefined) {
    const precio = precioSegun(material, tarifa);
    actualizar(clave, {
      materialId: material?.id ?? "",
      precioPorKg: precio === null ? "" : String(precio),
    });
    marcarEditado(`lineas.${indice}.materialId`);
  }

  return (
    <form action={enviar} className="space-y-5" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}
      {hayErrores && !estado.mensaje && <Aviso tipo="error">Revisa los campos marcados.</Aviso>}

      {correccion && (
        <BloqueCorreccion tipo="compra" correccion={correccion} error={error("motivo")} />
      )}

      <SelectorTercero
        tipo="compra"
        opciones={terceros}
        valor={terceroId}
        onElegir={(id) => {
          setTerceroId(id);
          marcarEditado("terceroId");
        }}
        error={error("terceroId")}
      />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-stone-700">Tarifa de compra</legend>
        <div className="inline-grid grid-cols-2 rounded-lg border border-stone-300 bg-white p-1">
          {TARIFAS.map(({ valor, etiqueta }) => (
            <label
              key={valor}
              className="has-checked:bg-marca-900 has-focus-visible:ring-oro-500 flex min-h-10 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium text-stone-600 has-checked:text-white has-focus-visible:ring-2"
            >
              <input
                type="radio"
                name="tarifa"
                value={valor}
                checked={tarifa === valor}
                onChange={() => {
                  // Las líneas con el precio del catálogo pasan a la tarifa nueva;
                  // los precios escritos a mano se respetan.
                  for (const linea of lineas) {
                    const material = materialDe(linea.materialId);
                    const anterior = precioSegun(material, tarifa);
                    if (
                      material &&
                      (linea.precioPorKg === "" || linea.precioPorKg === String(anterior))
                    ) {
                      const nuevo = precioSegun(material, valor);
                      actualizar(linea.clave, { precioPorKg: nuevo === null ? "" : String(nuevo) });
                    }
                  }
                  setTarifa(valor);
                  marcarEditado("tarifa");
                }}
                className="sr-only"
              />
              {etiqueta}
            </label>
          ))}
        </div>
        {error("tarifa") && <p className="mt-1 text-sm text-red-700">{error("tarifa")}</p>}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="sr-only">Materiales</legend>
        {lineas.map((linea, indice) => {
          const rutaPeso = `lineas.${indice}.pesoKg`;
          const rutaPrecio = `lineas.${indice}.precioPorKg`;
          const precioCatalogo = precioSegun(materialDe(linea.materialId), tarifa);
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
                    onElegir={(id) => elegirMaterial(linea.clave, indice, materialDe(id))}
                    onCrear={(nombre) => setCreando({ clave: linea.clave, nombre })}
                    invalido={Boolean(error(`lineas.${indice}.materialId`))}
                  />
                  {error(`lineas.${indice}.materialId`) && (
                    <p className="mt-1 text-sm text-red-700">
                      {error(`lineas.${indice}.materialId`)}
                    </p>
                  )}
                </div>
                <CamposCantidad
                  linea={linea}
                  indice={indice}
                  error={error(rutaPeso)}
                  onCambiar={(cambios) => {
                    actualizar(linea.clave, cambios);
                    marcarEditado(rutaPeso);
                  }}
                />
                <CampoPrecio
                  linea={linea}
                  error={error(rutaPrecio)}
                  ayuda={
                    linea.materialId && precioCatalogo === null
                      ? "Sin precio en el catálogo"
                      : undefined
                  }
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
        textoBoton={correccion ? "Guardar corrección" : "Registrar compra"}
      />

      {creando && (
        <DialogoNuevoMaterial
          nombreInicial={creando.nombre}
          crear={crearMaterial}
          reactivar={reactivarMaterial}
          onCerrar={() => setCreando(null)}
          onCreado={(material) => {
            setCatalogo((actual) =>
              [...actual.filter((m) => m.id !== material.id), material].sort((a, b) =>
                a.nombre.localeCompare(b.nombre, "es"),
              ),
            );
            const indice = lineas.findIndex((l) => l.clave === creando.clave);
            elegirMaterial(creando.clave, indice, material);
            setCreando(null);
          }}
        />
      )}
    </form>
  );
}
