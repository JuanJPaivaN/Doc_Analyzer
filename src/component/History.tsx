"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { generateAnalysisPDF } from "@/utils/generatePDF";

interface Analysis {
  id: number;
  analysisType: string;
  timestamp: string;
  documentContent: string;
  result: string;
}

const History = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  // Cargar el historial de análisis cuando se monte el componente
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/history");

        if (!response.ok) {
          throw new Error("Error al cargar el historial");
        }

        const data = await response.json();
        setAnalyses(data.analyses);
      } catch (err: any) {
        setError(err.message || "Error al cargar el historial");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  // Formatear la fecha para mejor visualización
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Truncar texto largo para la vista previa
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Exportar análisis seleccionado a PDF
  const handleExport = () => {
  if (!selectedAnalysis) return;

  // Exportar SOLO el resultado del análisis (hecho por la IA)
  generateAnalysisPDF({
    content: selectedAnalysis.result,
    title: `Análisis - ${selectedAnalysis.analysisType}`,
    filename: `analisis-${selectedAnalysis.id}-${Date.now()}.pdf`,
  });
};

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-300">Historial de Análisis</h1>

      {error && (
        <div className="mb-5 p-4 border rounded-md bg-red-50 text-red-700 border-red-200">
          <div className="flex items-start">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista de análisis (2/5) */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md h-[calc(100vh-160px)] overflow-y-auto">
            {analyses.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {analyses.map((analysis) => (
                  <li
                    key={analysis.id}
                    className={`py-4 cursor-pointer hover:bg-gray-50 ${
                      selectedAnalysis?.id === analysis.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600">{analysis.analysisType}</span>
                      <span className="text-sm text-gray-500">{formatDate(analysis.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{truncateText(analysis.documentContent)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No hay análisis previos</p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear nuevo análisis
                </Link>
              </div>
            )}
          </div>

          {/* Detalle del análisis (3/5) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md h-[calc(100vh-160px)] overflow-y-auto">
            {selectedAnalysis ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{selectedAnalysis.analysisType}</h2>
                  <span className="text-sm text-gray-500">{formatDate(selectedAnalysis.timestamp)}</span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido original:</h3>
                  <div className="p-3 bg-gray-50 rounded-md text-gray-700 text-sm max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-line">{selectedAnalysis.documentContent}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Resultado del análisis:</h3>
                  <div className="p-4 bg-gray-800 text-white rounded-md">
                    <p className="whitespace-pre-line">{selectedAnalysis.result}</p>
                  </div>
                </div>

                {/* Botón de exportar */}
                <button
                  onClick={handleExport}
                  className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Exportar a PDF
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Selecciona un análisis para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;