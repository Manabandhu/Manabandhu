import Link from "next/link";
import { getBackendStatus } from "@/lib/backend-status";
import { WEB_API_BASE_URL } from "@/lib/env";

export default async function Home() {
  const backendStatus = await getBackendStatus();

  return (
    <main className="shell">
      <section className="hero">
        <p className="badge">Web: Next.js | Mobile: Expo</p>
        <h1>ManaBandhu Frontend Split by Platform</h1>
        <p className="subtitle">
          Next.js now powers the web frontend. Expo remains the mobile runtime
          for iOS and Android.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Backend</h2>
          <p className="meta">
            API Base URL: <code>{WEB_API_BASE_URL}</code>
          </p>
          <p>
            Health status: <strong>{backendStatus}</strong>
          </p>
        </article>

        <article className="card">
          <h2>Developer Commands</h2>
          <ul>
            <li>
              <code>npm run web</code> starts Next.js web app.
            </li>
            <li>
              <code>npm run mobile</code> starts Expo mobile app.
            </li>
            <li>
              <code>npm run dev:all</code> runs backend + web + mobile.
            </li>
          </ul>
        </article>
      </section>

      <footer className="footer">
        <Link href="/">Web Home</Link>
      </footer>
    </main>
  );
}
