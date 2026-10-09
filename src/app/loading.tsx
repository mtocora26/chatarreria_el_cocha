// Se muestra al instante mientras la pantalla consulta la base de datos.
export default function Cargando() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse">
      <span className="sr-only">Cargando…</span>
      <div className="mb-2 h-4 w-40 rounded bg-stone-200" />
      <div className="mb-6 h-8 w-56 rounded bg-stone-200" />
      <div className="mb-4 h-24 rounded-2xl bg-stone-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-xl bg-stone-200" />
        <div className="h-24 rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}
