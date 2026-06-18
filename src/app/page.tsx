import { supabaseAdmin } from "@/lib/supabase/admin";

async function contar(tabla: string) {
  const { count } = await supabaseAdmin
    .from(tabla)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function Home() {
  const [clientes, proveedores, productos, documentos] = await Promise.all([
    contar("clientes"),
    contar("proveedores"),
    contar("productos"),
    contar("documentos"),
  ]);

  const cards = [
    { label: "Clientes", valor: clientes, href: "/clientes" },
    { label: "Proveedores", valor: proveedores, href: "/proveedores" },
    { label: "Productos", valor: productos, href: "/inventario" },
    { label: "Documentos", valor: documentos, href: "/documentos" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--peja-azul)]">
        Panel de control
      </h1>
      <p className="mb-8 text-sm text-[var(--peja-pizarra)]">
        Resumen general del sistema
      </p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <a key={c.label} href={c.href} className="rounded-xl border border-[var(--peja-gris)] bg-white p-5 transition-shadow hover:shadow-md">
            <div className="text-3xl font-bold text-[var(--peja-azul)]">{c.valor}</div>
            <div className="mt-1 text-sm font-medium text-[var(--peja-pizarra)]">{c.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}