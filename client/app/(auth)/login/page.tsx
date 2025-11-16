"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { parseFieldError } from "@/utils/error";

export default function LoginPage() {
  const { login, user, token } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) router.replace("/chat");
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (!email || !password) {
      setFormError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const parsed = parseFieldError(err);
      if (parsed.field === "form") setFormError(parsed.message);
      else setFieldErrors({ [parsed.field]: parsed.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors({ ...fieldErrors, email: "" });
          }}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-xs">{fieldErrors.email}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors({ ...fieldErrors, password: "" });
          }}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.password && (
          <p className="text-red-500 text-xs">{fieldErrors.password}</p>
        )}

        <button
          disabled={loading}
          className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-purple-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
