// src/app/api/history/route.ts
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Obtener todos los análisis ordenados por fecha (más recientes primero)
        const analyses = await prisma.documentAnalysis.findMany({
            orderBy: {
                timestamp: 'desc'
            },
            // Opcional: Incluir información del usuario si tienes autenticación
            // include: {
            //     user: true
            // }
        });

        return NextResponse.json({ 
            analyses,
            count: analyses.length
        });
    } catch (error: any) {
        console.error('Error al obtener historial:', error);
        return NextResponse.json(
            { message: 'Error al obtener el historial de análisis', error: error.message }, 
            { status: 500 }
        );
    }
}