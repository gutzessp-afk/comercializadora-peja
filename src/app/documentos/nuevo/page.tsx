import { supabaseAdmin } from "@/lib/supabase/admin";
import DocumentoEditor from "./DocumentoEditor";

export default async function NuevoDocumentoPage() {
  const { data: clientes } = await supabaseAdmin
    .from("clientes")
    .select("id, nombre, empresa")
    .order("nombre");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--peja-azul)]">Nuevo documento</h1>
      <p className="mb-6 text-sm text-[var(--peja-pizarra)]">
        Cotizacion, nota o remision
      </p>
      <DocumentoEditor clientes={clientes ?? []} />
    </div>
  );
}