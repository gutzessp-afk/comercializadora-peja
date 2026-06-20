import { supabaseAdmin } from "@/lib/supabase/admin";
import InventarioTabla from "./InventarioTabla";

export default async function InventarioPage() {
  const { data: productos } = await supabaseAdmin
    .from("productos")
    .select("*, categorias(nombre)")
    .order("nombre");

  const { data: categorias } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre")
    .order("nombre");

  const lista = (productos ?? []).map((p) => {
    const cat = Array.isArray(p.categorias) ? p.categorias[0] : p.categorias;
    return { ...p, categoria_nombre: cat?.nombre };
  });

  const marcas = Array.from(
    new Set(lista.map((p) => p.marca).filter(Boolean))
  ).sort() as string[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--peja-azul)]">Inventario</h1>
      <p className="mb-6 text-sm text-[var(--peja-pizarra)]">
        Control de existencias - Plomeria, tlapaleria y ferreteria
      </p>
      <InventarioTabla
        productos={lista}
        categorias={categorias ?? []}
        marcas={marcas}
      />
    </div>
  );
}