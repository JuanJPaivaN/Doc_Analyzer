"use client";

import { useState } from "react";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { generateAnalysisPDF } from '@/utils/generatePDF';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.mjs";

const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState("Resumen");
  const [selectedModel, setSelectedModel] = useState("Gemini");
  const [analysisResult, setAnalysisResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "text/plain" ||
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Por favor, sube un archivo de texto (.txt), PDF (.pdf) o Word (.docx)");
      setSelectedFile(null);
    }
  };

  const splitContentIntoBatches = (content: string, batchSize: number): string[] => {
    const batches: string[] = [];
    for (let i = 0; i < content.length; i += batchSize) {
      batches.push(content.slice(i, i + batchSize));
    }
    return batches;
  };

  const readFileContent = async (file: File, batchSize: number): Promise<string[]> => {
    let content = "";

    if (file.type === "text/plain") {
      content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    } else if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map((item: any) => item.str).join(" ");
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      content = result.value;
    } else {
      throw new Error("Formato de archivo no soportado");
    }

    return splitContentIntoBatches(content, batchSize);
  };

  const handleAnalyze = async () => {
  if (!selectedFile) {
    setError("No has seleccionado ningún archivo.");
    return;
  }

  try {
    setIsLoading(true);
    setError("");

    const batchSize = 10000;
    const batches = await readFileContent(selectedFile, batchSize);
    
    // Unir todos los fragmentos en un solo texto
    const fullContent = batches.join(" ");

    // Hacer solo una petición
    const response = await fetch("/api/analyze-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentContent: fullContent,
        analysisType,
        selectedModel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al analizar el documento");
    }

    const data = await response.json();
    setAnalysisResult(data.result.trim());

  } catch (error: any) {
    console.error("Error al procesar el análisis:", error);
    setError(`Error al procesar el análisis: ${error.message}`);
    setAnalysisResult("");
  } finally {
    setIsLoading(false);
  }
};


  const triggerFileInput = () => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analizador de Documentos</h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona un archivo de texto, PDF o Word
        </label>
        <input
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          ref={(el) => setFileInputRef(el)}
        />
        <div className="flex items-center">
          <button
            onClick={triggerFileInput}
            className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Seleccionar archivo
          </button>
          <div className="flex-1 border border-l-0 border-gray-300 rounded-r-md py-2 px-3 bg-gray-50">
            {selectedFile ? (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-800 truncate">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="ml-auto text-gray-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <span className="text-gray-500">Ningún archivo seleccionado</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de análisis
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          disabled={isLoading}
        >
          <option value="Resumen">Resumen</option>
          <option value="Puntos Clave">Puntos Clave</option>
          <option value="Análisis de Sentimiento">Análisis de Sentimiento</option>
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo de IA
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
        >
          <option value="Gemini">Gemini (Google)</option>
          <option value="OpenAI">GPT (OpenAI)</option>
          <option value="Anthropic">Claude (Anthropic)</option>
        </select>
      </div>

      <button
        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center"
        onClick={handleAnalyze}
        disabled={isLoading || !selectedFile}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analizando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Analizar Documento
          </>
        )}
      </button>

      {error && (
        <div className="mt-5 p-4 border rounded-md bg-red-50 text-red-700 border-red-200">
          <div className="flex items-start">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="mt-5 p-4 border rounded-md bg-gray-800 text-white">
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Resultado del Análisis:</h3>
          <div className="whitespace-pre-line text-gray-100 leading-relaxed">
            {analysisResult}
          </div>
        </div>
      )}
      {/* Botón de exportar */}
      {analysisResult && (
        <button
          onClick={() =>
            generateAnalysisPDF({
              content: analysisResult,
              title: `${analysisType} - ${selectedFile?.name || "Documento"}`,
              filename: `analisis-${Date.now()}.pdf`,
            })
          }
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Exportar a PDF
        </button>
      )}
    </div>
  );
};

export default DocumentAnalyzer;
