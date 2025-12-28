// app/page.tsx
import Link from "next/link";
import { Hash, MessageSquare, Users, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top Nav */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">Rymble</div>

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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight">Rymble</h1>

        <p className="mt-4 max-w-2xl text-zinc-400 leading-relaxed">
          A real-time, workspace-based chat application focused on system
          design, state consistency, and real-time communication.
        </p>

        <p className="mt-2 max-w-2xl text-zinc-500 text-sm">
          Built using Node.js, Socket.io, MongoDB, and Next.js to explore
          authentication boundaries and multi-tenant data flow.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/demo"
            className="rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium hover:bg-zinc-700 transition"
          >
            Try Demo Workspace
          </Link>

          <Link
            href="/register"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium hover:bg-zinc-900 transition"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<MessageSquare size={18} />}
            title="Real-time Messaging"
            description="Live message delivery using Socket.io with optimistic UI updates."
          />
          <Feature
            icon={<Users size={18} />}
            title="Workspace Isolation"
            description="Channels, members, and permissions scoped per workspace."
          />
          <Feature
            icon={<Hash size={18} />}
            title="Channel Lifecycle"
            description="Create, manage, and archive channels without losing history."
          />
          <Feature
            icon={<Activity size={18} />}
            title="Presence Awareness"
            description="Online status synced across workspaces and conversations."
          />
        </div>
      </section>

      {/* Demo Explanation */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-xl font-semibold tracking-tight">
            Explore without signing up
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400 leading-relaxed">
            The demo workspace lets you explore the full application flow
            without creating an account. It simulates users, channels, and
            messages so you can observe real-time state changes and permissions.
          </p>

          <Link
            href="/demo"
            className="mt-6 inline-block rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium hover:bg-zinc-700 transition"
          >
            Enter Demo Workspace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-zinc-500">
          Node.js · Express · MongoDB · Socket.io · Next.js · React · Tailwind
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-zinc-200">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
