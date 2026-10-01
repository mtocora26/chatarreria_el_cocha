type AvisoProps = {
  tipo: "exito" | "error";
  children: React.ReactNode;
};

const ESTILOS = {
  exito: "border-green-300 bg-green-50 text-green-900",
  error: "border-red-300 bg-red-50 text-red-900",
} as const;

export function Aviso({ tipo, children }: AvisoProps) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`mb-4 rounded-md border px-4 py-3 text-sm ${ESTILOS[tipo]}`}
    >
      {children}
    </div>
  );
}
