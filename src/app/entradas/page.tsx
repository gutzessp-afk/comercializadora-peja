import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function EntradasPage() {
  const { data: entradas } = await supabaseAdmin
    .from("entradas")
    .select("id, folio, fecha, total, pdf_url, proveedores(nombre)")
    .order("id", { ascending: false });

  const fmt = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--peja-azul)]">Entradas de material</h1>
          <p className="text-sm text-[var(--peja-pizarra)]">
            Material nuevo que llega, separado por remesa
          </p>
        </div>
        <Link
          href="/entradas/nueva"
          className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
        >
          + Nueva entrada
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Folio</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Proveedor</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-center font-semibold">PDF</th>
            </tr>
          </thead>
          <tbody>
            {!entradas || entradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Aun no hay entradas registradas
                </td>
              </tr>
            ) : (
              entradas.map((e) => {
                const prov = Array.isArray(e.proveedores)
                  ? e.proveedores[0]?.nombre
                  : (e.proveedores as { nombre?: string } | null)?.nombre;
                return (
                  <tr key={e.id} className="border-t border-[var(--peja-gris)]">
                    <td className="px-4 py-3 font-semibold text-[var(--peja-azul)]">{e.folio}</td>
                    <td className="px-4 py-3">{new Date(e.fecha + "T00:00:00").toLocaleDateString("es-MX")}</td>
                    <td className="px-4 py-3 text-[var(--peja-pizarra)]">{prov || "-"}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(e.total)}</td>
                    <td className="px-4 py-3 text-center">
                      {e.pdf_url ? (
                        <a href={e.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="rounded px-2 py-1 text-xs font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]">
                          Ver PDF
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}