import Link from "next/link";

export default function AuthHeader() {
  return (
    <main className="bg-zinc-950 text-zinc-200">
      {/* Top Nav */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Rymble</Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition"
            >
              Register
            </Link>
          </div>
        </div>
      </header>
    </main>
  );
}
