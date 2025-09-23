import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { AIAnalysis, FormData } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        dadosDoFormulario: {
            type: Type.STRING,
            description: "Resumo dos insumos disponíveis, materiais críticos e prazos de reposição, baseado nos dados do formulário."
        },
        interpretacaoImagemAtual: {
            type: Type.OBJECT,
            properties: {
                faseExecutiva: { type: Type.STRING, description: "Identificação da fase executiva da obra com base na imagem atual." },
                materiaisVisiveis: { type: Type.STRING, description: "Lista dos principais materiais visíveis em uso na imagem atual." },
                materiaisProvaveis: { type: Type.STRING, description: "Projeção dos próximos insumos a serem aplicados, com base na fase atual." }
            },
            required: ["faseExecutiva", "materiaisVisiveis", "materiaisProvaveis"]
        },
        interpretacaoImagemProjeto: {
            type: Type.OBJECT,
            properties: {
                caracteristicas: { type: Type.STRING, description: "Descrição do tipo de construção (residencial, comercial, etc.) e quantidade de pavimentos, com base na imagem do projeto final." },
                fasesExecutivas: { type: Type.STRING, description: "Lista das principais etapas executivas previstas no projeto." }
            },
            required: ["caracteristicas", "fasesExecutivas"]
        },
        analiseAvancoFisico: {
            type: Type.STRING,
            description: "Análise comparativa entre o planejamento (dados do formulário, projeto final) e o progresso real (imagem atual), focando na gestão de materiais e almoxarifado."
        },
        recomendacoes: {
            type: Type.STRING,
            description: "Insights e recomendações práticas para otimização do almoxarifado, gestão de estoque e continuidade da obra."
        }
    },
    required: ["dadosDoFormulario", "interpretacaoImagemAtual", "interpretacaoImagemProjeto", "analiseAvancoFisico", "recomendacoes"]
};


/**
 * Generates a comprehensive analysis of a construction project using text and image data.
 * @returns A structured AIAnalysis object.
 */
export const generateComprehensiveAnalysis = async (
    formData: FormData,
    currentImagesBase64: string[],
    currentImagesMimeTypes: string[],
    finalImagesBase64: string[],
    finalImagesMimeTypes: string[],
): Promise<AIAnalysis> => {
    try {
        const currentImageParts = currentImagesBase64.map((base64, index) => ({
            inlineData: { data: base64, mimeType: currentImagesMimeTypes[index] },
        }));

        const finalImageParts = finalImagesBase64.map((base64, index) => ({
            inlineData: { data: base64, mimeType: finalImagesMimeTypes[index] },
        }));

        const textPrompt = `
            Como um especialista em análise de dados de gestão de estoque para construção civil, sua tarefa é criar um relatório técnico e formal.
            Analise de forma integrada todas as informações fornecidas: os dados do formulário, a imagem da fase atual da obra e a imagem do projeto final.
            O seu público-alvo é um Analista de Dados de Gestão de Estoque, então seja explicativo, técnico e apresente insights claros.
            Preencha o schema JSON a seguir com sua análise completa.

            **Instruções Detalhadas para cada campo do JSON:**

            1.  **dadosDoFormulario**: Com base nos dados do formulário, resuma as informações mais relevantes de estoque e almoxarifado. Destaque materiais críticos, se mencionados nas dificuldades.
            2.  **interpretacaoImagemAtual**:
                -   **faseExecutiva**: Olhando a imagem da situação ATUAL, identifique em qual fase executiva a obra se encontra (ex: fundação, estrutura, alvenaria, acabamento).
                -   **materiaisVisiveis**: Liste os principais materiais que você vê em uso ou armazenados no canteiro na imagem atual.
                -   **materiaisProvaveis**: Com base na fase atual identificada, projete quais materiais serão necessários em seguida.
            3.  **interpretacaoImagemProjeto**:
                -   **caracteristicas**: Olhando a imagem do projeto FINALIZADO, descreva o tipo de construção (residencial, comercial, industrial) e a quantidade de pavimentos. Se não houver imagem do projeto, infira a partir da descrição e do número de pavimentos informado.
                -   **fasesExecutivas**: Com base no tipo de projeto, liste as principais fases executivas esperadas para a conclusão da obra.
            4.  **analiseAvancoFisico**: Conecte todas as informações. Compare o progresso real (visto na imagem atual) com o planejamento (informações do formulário e projeto). Analise como a gestão de materiais (descrita nas dificuldades) pode estar impactando o avanço físico.
            5.  **recomendacoes**: Forneça insights práticos e recomendações para otimizar a gestão do almoxarifado, garantir o fluxo de suprimentos e a continuidade da obra com base em sua análise completa.

            **Dados do Formulário para Análise:**
            - Nome do Projeto: ${formData.projectName}
            - Número de Pavimentos (informado): ${formData.floorCount}
            - Descrição do Projeto: ${formData.projectDescription}
            - Descrição da Fase Atual (pelo usuário): ${formData.currentPhaseDescription}
            - Dificuldades com Gestão de Materiais: ${formData.materialManagementDifficulty}

            As imagens a seguir são da **SITUAÇÃO ATUAL** da obra. Use-as para a seção 'interpretacaoImagemAtual'.
            ${currentImageParts.length === 0 ? "Nenhuma imagem da situação atual foi fornecida." : ""}

            As imagens a seguir são do **PROJETO FINALIZADO** (se houver). Use-as para a seção 'interpretacaoImagemProjeto'.
            ${finalImageParts.length === 0 ? "Nenhuma imagem do projeto finalizado foi fornecida." : ""}
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: textPrompt },
                    ...currentImageParts,
                    ...finalImageParts,
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const analysisResult = JSON.parse(jsonText) as AIAnalysis;
        return analysisResult;

    } catch (error) {
        console.error('Error generating comprehensive analysis:', error);
        throw new Error('Falha na análise completa pela IA.');
    }
};