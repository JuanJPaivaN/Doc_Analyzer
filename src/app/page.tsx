import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Bienvenido a la Plataforma de IA</h1>
      <nav>
        <ul>
          <li><Link href="/history">Ir al Historial</Link></li>
          <li><Link href="/chat">Ir al Chat con IA</Link></li>
        </ul>
      </nav>
    </div>
  );
}

