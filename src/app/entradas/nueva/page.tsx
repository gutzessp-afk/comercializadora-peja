import { supabaseAdmin } from "@/lib/supabase/admin";
import EntradaEditor from "./EntradaEditor";

export default async function NuevaEntradaPage() {
  const { data: proveedores } = await supabaseAdmin
    .from("proveedores")
    .select("id, nombre")
    .order("nombre");

  const { data: productos } = await supabaseAdmin
    .from("productos")
    .select("id, codigo, nombre")
    .order("nombre");

  const { data: categorias } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre")
    .order("nombre");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--peja-azul)]">Nueva entrada de material</h1>
      <p className="mb-6 text-sm text-[var(--peja-pizarra)]">
        Sube el PDF y captura lo que llego. Se sumara al inventario.
      </p>
      <EntradaEditor
        proveedores={proveedores ?? []}
        productos={productos ?? []}
        categorias={categorias ?? []}
      />
    </div>
  );
}