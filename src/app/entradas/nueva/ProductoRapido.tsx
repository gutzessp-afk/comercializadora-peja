"use client";

import { useState } from "react";
import { crearProducto } from "@/app/inventario/actions";

type Categoria = { id: number; nombre: string };

export default function ProductoRapido({
  categorias,
  onCreado,
  onClose,
}: {
  categorias: Categoria[];
  onCreado: (prod: { id: number; codigo: string; nombre: string }) => void;
  onClose: () => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [marca, setMarca] = useState("");
  const [unidad, setUnidad] = useState("pieza");
  const [precioVenta, setPrecioVenta] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (!codigo.trim() || !nombre.trim()) {
      setError("Codigo y nombre son obligatorios");
      return;
    }
    setGuardando(true);
    setError("");
    const res = await crearProducto({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      categoria_id: categoriaId,
      marca,
      unidad,
      precio_compra: 0,
      precio_venta: parseFloat(precioVenta) || 0,
      stock: 0,
      stock_minimo: 0,
      activo: true,
    });
    setGuardando(false);
    if (res.ok && res.id) {
      onCreado({ id: res.id, codigo: codigo.trim(), nombre: nombre.trim() });
    } else {
      setError(res.error ?? "Error al crear (revisa que el codigo no exista)");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-[var(--peja-azul)]">Nuevo producto rapido</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Codigo *</label>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Marca</label>
            <input value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Categoria</label>
            <select value={categoriaId ?? ""} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]">
              <option value="">Sin categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Unidad</label>
            <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]">
              {["pieza","tramo","metro","kg","litro","caja","cubeta","bote","saco","rollo","juego","par","paquete","bolsa"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Precio de venta (opcional)</label>
            <input type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50">
            {guardando ? "Creando..." : "Crear y usar"}
          </button>
        </div>
      </div>
    </div>
  );
}