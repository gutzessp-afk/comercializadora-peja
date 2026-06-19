const MAP: Record<string, { label: string; clase: string }> = {
  pagado: { label: "Pagado", clase: "bg-green-100 text-green-700" },
  parcial: { label: "A cuenta", clase: "bg-amber-100 text-amber-700" },
  pendiente: { label: "Pendiente", clase: "bg-red-100 text-red-700" },
};

export default function EstadoPago({ estado }: { estado: string }) {
  const e = MAP[estado] ?? MAP.pendiente;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.clase}`}>
      {e.label}
    </span>
  );
}