"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function entrar() {
    if (!email || !password) {
      setError("Ingresa correo y contraseña");
      return;
    }
    setCargando(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--peja-neutro)] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <Logo size={56} />
          <div className="mt-3 text-center">
            <div className="text-lg font-bold text-[var(--peja-azul)]">Comercializadora Peja</div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-[var(--peja-pizarra)]">
              OPERACIONES INDUSTRIALES
            </div>
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="mb-4 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={entrar}
          disabled={cargando}
          className="w-full rounded-md bg-[var(--peja-azul)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
        >
          {cargando ? "Entrando..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}