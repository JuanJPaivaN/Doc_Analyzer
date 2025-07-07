import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { documentContent, analysisType, selectedModel } = await req.json();
    const model = selectedModel?.toLowerCase();

    // Construir prompt
    let prompt = '';
    switch (analysisType) {
      case 'Resumen':
        prompt = `Por favor, proporciona un resumen conciso del siguiente documento:\n\n${documentContent}`;
        break;
      case 'Puntos Clave':
        prompt = `Identifica y enumera los puntos clave del siguiente documento:\n\n${documentContent}`;
        break;
      case 'Análisis de Sentimiento':
        prompt = `Realiza un análisis de sentimiento del siguiente texto, identificando el tono general y las emociones principales:\n\n${documentContent}`;
        break;
      default:
        prompt = `Analiza el siguiente documento y proporciona insights relevantes:\n\n${documentContent}`;
    }

    let responseText = '';

    if (model === 'gemini') {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview" });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();

    } else if (model === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const msg = await anthropic.messages.create({
        model: "claude-3.5-Haiku",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });
      if (msg.content[0].type === "text") {
        responseText = msg.content[0].text;
      } else {
        responseText = JSON.stringify(msg.content[0]); // fallback
      }

    } else if (model === 'openai') {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const chat = await openai.chat.completions.create({
        model: "gpt-3.5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      responseText = chat.choices[0].message.content || '';

    } else {
      throw new Error("Modelo de IA no soportado");
    }


    const analysis = await prisma.documentAnalysis.create({
      data: {
        documentContent,
        analysisType,
        result: responseText,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ result: responseText, analysis });
  } catch (error: any) {
    console.error('Error en el análisis:', error);
    return NextResponse.json(
      { message: 'Error al analizar el documento', error: error.message },
      { status: 500 }
    );
  }
}
