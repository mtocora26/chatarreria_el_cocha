type CampoProps = {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
};

/** Etiqueta + control + mensaje de error asociado por aria-describedby (`<id>-error`). */
export function Campo({ id, etiqueta, error, ayuda, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-stone-500">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
