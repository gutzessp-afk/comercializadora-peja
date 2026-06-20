"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearEntrada, type EntradaItem } from "../actions";
import SubirPdf from "./SubirPdf";

type Proveedor = { id: number; nombre: string };
type Producto = { id: number; codigo: string; nombre: string };

export default function EntradaEditor({
  proveedores,
  productos,
}: {
  proveedores: Proveedor[];
  productos: Producto[];
}) {
  const router = useRouter();
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<EntradaItem[]>([
    { producto_id: null, descripcion: "", cantidad: 1, costo_unitario: 0, importe: 0 },
  ]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function actualizar(i: number, campo: keyof EntradaItem, valor: string) {
    setItems((prev) => {
      const copia = [...prev];
      const it = { ...copia[i] };
      if (campo === "producto_id") {
        const pid = valor ? Number(valor) : null;
        it.producto_id = pid;
        const prod = productos.find((p) => p.id === pid);
        if (prod) it.descripcion = prod.nombre;
      } else if (campo === "descripcion") {
        it.descripcion = valor;
      } else if (campo === "cantidad") {
        it.cantidad = parseFloat(valor) || 0;
      } else if (campo === "costo_unitario") {
        it.costo_unitario = parseFloat(valor) || 0;
      }
      it.importe = it.cantidad * it.costo_unitario;
      copia[i] = it;
      return copia;
    });
  }

  function agregar() {
    setItems((p) => [...p, { producto_id: null, descripcion: "", cantidad: 1, costo_unitario: 0, importe: 0 }]);
  }
  function quitar(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  const total = items.reduce((s, i) => s + i.importe, 0);
  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  async function guardar() {
    const validos = items.filter((i) => i.producto_id && i.cantidad > 0);
    if (validos.length === 0) {
      setError("Agrega al menos un producto con cantidad");
      return;
    }
    setGuardando(true);
    setError("");
    const res = await crearEntrada({
      proveedor_id: proveedorId,
      fecha,
      pdf_url: pdfUrl,
      notas,
      items: validos,
    });
    setGuardando(false);
    if (res.ok) router.push("/entradas");
    else setError(res.error ?? "Error");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl border border-[var(--peja-gris)] bg-white p-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Proveedor</label>
          <select
            value={proveedorId ?? ""}
            onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Fecha de llegada</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
          />
        </div>
      </div>

      <div className="mb-4">
        <SubirPdf onSubido={setPdfUrl} />
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-3 py-3 font-semibold">Producto</th>
              <th className="w-24 px-3 py-3 font-semibold">Cant.</th>
              <th className="w-32 px-3 py-3 font-semibold">Costo unit.</th>
              <th className="w-32 px-3 py-3 text-right font-semibold">Importe</th>
              <th className="w-10 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-[var(--peja-gris)]">
                <td className="px-2 py-2">
                  <select
                    value={it.producto_id ?? ""}
                    onChange={(e) => actualizar(i, "producto_id", e.target.value)}
                    className="w-full rounded border border-[var(--peja-gris)] px-2 py-1.5 outline-none focus:border-[var(--peja-azul)]"
                  >
                    <option value="">Selecciona producto...</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={it.cantidad}
                    onChange={(e) => actualizar(i, "cantidad", e.target.value)}
                    className="w-full rounded border border-[var(--peja-gris)] px-2 py-1.5 text-right outline-none focus:border-[var(--peja-azul)]"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={it.costo_unitario}
                    onChange={(e) => actualizar(i, "costo_unitario", e.target.value)}
                    className="w-full rounded border border-[var(--peja-gris)] px-2 py-1.5 text-right outline-none focus:border-[var(--peja-azul)]"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">{fmt(it.importe)}</td>
                <td className="px-2 py-2 text-center">
                  <button onClick={() => quitar(i)} className="text-red-500 hover:text-red-700">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[var(--peja-gris)] p-3">
          <button
            onClick={agregar}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
          >
            + Agregar producto
          </button>
          <div className="text-sm font-bold text-[var(--peja-azul)]">Total: {fmt(total)}</div>
        </div>
      </div>

      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas de la entrada (opcional)"
        rows={2}
        className="mb-4 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => router.push("/entradas")}
          className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-[var(--peja-azul)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Registrar entrada y sumar al inventario"}
        </button>
      </div>
    </div>
  );
}