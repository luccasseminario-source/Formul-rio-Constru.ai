export interface FormData {
    fullName: string;
    email: string;
    suppliesContactName: string;
    suppliesContactPhone: string;
    city: string;
    state: string;
    projectName: string;
    address: string;
    floorCount: string;
    startDate: string;
    endDate: string;
    projectDescription: string;
    currentPhaseDescription: string;
    materialManagementDifficulty: string;
    currentSituationImage: File[] | null;
    finalProjectImage: File[] | null;
}

export interface AIAnalysis {
    dadosDoFormulario: string;
    interpretacaoImagemAtual: {
        faseExecutiva: string;
        materiaisVisiveis: string;
        materiaisProvaveis: string;
    };
    interpretacaoImagemProjeto: {
        caracteristicas: string;
        fasesExecutivas: string;
    };
    analiseAvancoFisico: string;
    recomendacoes: string;
}


export interface SupabaseData extends Omit<FormData, 'currentSituationImage' | 'finalProjectImage'> {
    currentSituationImageUrl: string[];
    finalProjectImageUrl: string[];
    aiAnalysis: AIAnalysis;
}

export type FormErrors = {
    [key in keyof FormData]?: string;
};