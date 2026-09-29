type EncabezadoPaginaProps = {
  titulo: string;
  descripcion?: string;
};

export function EncabezadoPagina({ titulo, descripcion }: EncabezadoPaginaProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{titulo}</h1>
      {descripcion && <p className="mt-1 text-stone-600">{descripcion}</p>}
    </header>
  );
}
