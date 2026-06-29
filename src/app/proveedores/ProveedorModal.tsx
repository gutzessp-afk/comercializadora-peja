"use client";

import { useState } from "react";
import { crearProveedor, actualizarProveedor, type ProveedorInput } from "./actions";

type Proveedor = ProveedorInput & { id?: number };

export default function ProveedorModal({
  proveedor,
  onClose,
}: {
  proveedor?: Proveedor;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProveedorInput>({
    nombre: proveedor?.nombre ?? "",
    empresa: proveedor?.empresa ?? "",
    telefono: proveedor?.telefono ?? "",
    email: proveedor?.email ?? "",
    direccion: proveedor?.direccion ?? "",
    rfc: proveedor?.rfc ?? "",
    notas: proveedor?.notas ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function set(campo: keyof ProveedorInput, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    setError("");
    const res = proveedor?.id
      ? await actualizarProveedor(proveedor.id, form)
      : await crearProveedor(form);
    setGuardando(false);
    if (res.ok) onClose();
    else setError(res.error ?? "Error");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-[var(--peja-azul)]">
          {proveedor?.id ? "Editar proveedor" : "Nuevo proveedor"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nombre *" value={form.nombre} onChange={(v) => set("nombre", v)} full />
          <Campo label="Empresa" value={form.empresa ?? ""} onChange={(v) => set("empresa", v)} />
          <Campo label="Telefono" value={form.telefono ?? ""} onChange={(v) => set("telefono", v)} />
          <Campo label="Email" value={form.email ?? ""} onChange={(v) => set("email", v)} />
          <Campo label="RFC" value={form.rfc ?? ""} onChange={(v) => set("rfc", v)} />
          <Campo label="Direccion" value={form.direccion ?? ""} onChange={(v) => set("direccion", v)} full />
          <Campo label="Notas" value={form.notas ?? ""} onChange={(v) => set("notas", v)} full />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, full }: { label: string; value: string; onChange: (v: string) => void; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
    </div>
  );
}