import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GeneratePDFProps {
  content: string;
  title?: string;
  filename?: string;
}

export const generateAnalysisPDF = ({
  content,
  title = 'Análisis de Documento',
  filename = 'analisis_documento.pdf'
}: GeneratePDFProps) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Contenido del análisis
  const lines = doc.splitTextToSize(content, 180); // Ajuste automático
  doc.setFontSize(12);
  doc.text(lines, 14, 35);

  // Guardar el PDF
  doc.save(filename);
};

// Versión alternativa que usa HTML (para cuando tengas componentes complejos)
export const generateHTMLToPDF = async (elementId: string, filename = 'documento.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};