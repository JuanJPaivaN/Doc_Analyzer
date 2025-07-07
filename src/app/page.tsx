import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-xl w-full mx-auto text-center bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Bienvenido a la Plataforma de IA
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Selecciona una opción para comenzar a interactuar con documentos o revisar tus análisis previos.
        </p>

        <nav className="flex flex-col gap-4">
          <Link
            href="/chat"
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-center"
          >
            Ir al Chat con IA
          </Link>

          <Link
            href="/history"
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-md transition-colors text-center"
          >
            Ir al Historial
          </Link>
        </nav>
      </div>
    </div>
  );
}
