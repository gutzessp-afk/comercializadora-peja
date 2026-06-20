"use client";

import { useState } from "react";
import { actualizarProducto, crearProducto } from "./actions";

type Categoria = { id: number; nombre: string };

type Producto = {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number | null;
  marca?: string;
  unidad: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  ubicacion?: string;
  activo: boolean;
};

export default function ProductoModal({
  producto,
  categorias,
  onClose,
}: {
  producto?: Producto;
  categorias: Categoria[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<Producto>({
    codigo: producto?.codigo ?? "",
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    categoria_id: producto?.categoria_id ?? null,
    marca: producto?.marca ?? "",
    unidad: producto?.unidad ?? "pieza",
    precio_compra: producto?.precio_compra ?? 0,
    precio_venta: producto?.precio_venta ?? 0,
    stock: producto?.stock ?? 0,
    stock_minimo: producto?.stock_minimo ?? 0,
    ubicacion: producto?.ubicacion ?? "",
    activo: producto?.activo ?? true,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof Producto>(campo: K, valor: Producto[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar() {
    if (!form.codigo.trim() || !form.nombre.trim()) {
      setError("Codigo y nombre son obligatorios");
      return;
    }
    setGuardando(true);
    setError("");
    const res = producto?.id
      ? await actualizarProducto(producto.id, form)
      : await crearProducto(form);
    setGuardando(false);
    if (res.ok) onClose();
    else setError(res.error ?? "Error");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-[var(--peja-azul)]">
          {producto?.id ? "Editar producto" : "Nuevo producto"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Codigo *" value={form.codigo} onChange={(v) => set("codigo", v)} />
          <Campo label="Nombre *" value={form.nombre} onChange={(v) => set("nombre", v)} />
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Categoria</label>
            <select
              value={form.categoria_id ?? ""}
              onChange={(e) => set("categoria_id", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            >
              <option value="">Sin categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <Campo label="Marca" value={form.marca ?? ""} onChange={(v) => set("marca", v)} />
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Unidad</label>
            <select
              value={form.unidad}
              onChange={(e) => set("unidad", e.target.value)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            >
              {["pieza","tramo","metro","kg","litro","caja","cubeta","bote","saco","rollo","juego","par","paquete","bolsa"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <Campo label="Ubicacion" value={form.ubicacion ?? ""} onChange={(v) => set("ubicacion", v)} />
          <CampoNum label="Precio compra" value={form.precio_compra} onChange={(v) => set("precio_compra", v)} />
          <CampoNum label="Precio venta" value={form.precio_venta} onChange={(v) => set("precio_venta", v)} />
          <CampoNum label="Stock actual" value={form.stock} onChange={(v) => set("stock", v)} />
          <CampoNum label="Stock minimo" value={form.stock_minimo} onChange={(v) => set("stock_minimo", v)} />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
      />
    </div>
  );
}

function CampoNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
      />
    </div>
  );
}