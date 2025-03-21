import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { documentContent, analysisType } = await req.json();
        
        // Inicializar la API de Google AI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

        // Construir el prompt según el tipo de análisis
        let prompt = '';
        switch (analysisType) {
            case 'Resumen':
                prompt = `Por favor, proporciona un resumen conciso del siguiente documento: ${documentContent}`;
                break;
            case 'Puntos Clave':
                prompt = `Identifica y enumera los puntos clave del siguiente documento: ${documentContent}`;
                break;
            case 'Análisis de Sentimiento':
                prompt = `Realiza un análisis de sentimiento del siguiente texto, identificando el tono general y las emociones principales: ${documentContent}`;
                break;
            default:
                prompt = `Analiza el siguiente documento y proporciona insights relevantes: ${documentContent}`;
        }

        // Generar el análisis
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Guardar en la base de datos
        const analysis = await prisma.documentAnalysis.create({
            data: {
                documentContent,
                analysisType,
                result: response,
                timestamp: new Date(),
            },
        });

        // Devolver el resultado
        return NextResponse.json({ 
            result: response,
            analysis 
        });
    } catch (error: any) {
        console.error('Error en el análisis:', error);
        return NextResponse.json(
            { message: 'Error al analizar el documento', error: error.message }, 
            { status: 500 }
        );
    }
}