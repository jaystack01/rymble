"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { getErrorMessage } from "@/utils/error";

export default function LoginPage() {
  const { login, user, token } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      router.replace("/chat");
    }
  }, [user, token]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      // The redirect will happen automatically in the effect above
    } catch (err) {
      setError(getErrorMessage(err));
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 focus:outline-none"
        />

        <button
          type="submit"
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
