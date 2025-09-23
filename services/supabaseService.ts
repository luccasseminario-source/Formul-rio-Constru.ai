import { supabase } from '../supabaseClient';
import { FormData, AIAnalysis } from '../types';

const BUCKET_NAME = 'project-images';

/**
 * Sanitizes a filename to be URL and path friendly.
 * @param name The original filename.
 * @returns A sanitized filename.
 */
const sanitizeFileName = (name: string): string => {
    const decomposed = name.normalize("NFD");
    const withoutAccents = decomposed.replace(/[\u0300-\u036f]/g, "");
    const sanitized = withoutAccents.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_');
    return sanitized;
};


/**
 * Uploads an array of files to a specified Supabase Storage bucket.
 * @param files The array of File objects to upload.
 * @returns A promise that resolves with an array of public URLs for the uploaded files.
 */
const uploadImages = async (files: File[] | null): Promise<string[]> => {
    if (!files || files.length === 0) {
        return [];
    }

    const uploadPromises = files.map(async (file) => {
        const sanitizedFileName = sanitizeFileName(file.name);
        const filePath = `public/${Date.now()}-${sanitizedFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError.message);
            if (uploadError.message.toLowerCase().includes("bucket not found")) {
                throw new Error("Erro de Configuração: O bucket 'project-images' não foi encontrado no Supabase. Por favor, crie o bucket público no painel do seu projeto.");
            }
            throw new Error(`Falha ao enviar a imagem: ${file.name}`);
        }

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        if (!data?.publicUrl) {
            throw new Error(`Falha ao obter URL pública para a imagem: ${file.name}`);
        }
        
        return data.publicUrl;
    });

    return Promise.all(uploadPromises);
};


/**
 * Saves the complete form data, including uploading images and storing AI analysis, to Supabase.
 *
 * @param formData The raw form data including File objects.
 * @param aiAnalysis The result of the AI analysis.
 * @returns A promise that resolves when the save operation is complete.
 */
export const saveFormData = async (formData: FormData, aiAnalysis: AIAnalysis): Promise<{ success: true }> => {
    console.log('--- STARTING SUPABASE SAVE ---');
    try {
        const [currentSituationImageUrls, finalProjectImageUrls] = await Promise.all([
            uploadImages(formData.currentSituationImage),
            uploadImages(formData.finalProjectImage)
        ]);
        
        console.log('Image URLs:', { currentSituationImageUrls, finalProjectImageUrls });

        // Map application's camelCase fields to the new database snake_case columns.
        const dataToInsert = {
            nome_usuario: formData.fullName,
            email_usuario: formData.email,
            nome_do_contato_de_suprimentos: formData.suppliesContactName,
            suprimentos_telefone_de_contato: formData.suppliesContactPhone,
            nome_obra: formData.projectName,
            endereco: formData.address,
            cidade: formData.city,
            estado: formData.state,
            numero_de_pavimentos: parseInt(formData.floorCount, 10),
            data_inicio_obra: formData.startDate,
            data_final_obra_prevista: formData.endDate,
            descricao_da_obra: formData.projectDescription,
            fase_obra: formData.currentPhaseDescription,
            dificuldade_de_gerenciamento_de_materiais: formData.materialManagementDifficulty,
            URL_imagem_fase_atual: currentSituationImageUrls,
            URL_imagem_projeto_final: finalProjectImageUrls,
            descricao_ia_fase_obra: aiAnalysis,
        };

        const { error: insertError } = await supabase
            .from('cadastro_obra')
            .insert([dataToInsert]);
        
        if (insertError) {
            console.error('Error inserting data into Supabase:', insertError.message);
            throw new Error('Falha ao salvar os dados do projeto no banco de dados.');
        }

        console.log('--- SUPABASE SAVE COMPLETE ---');
        return { success: true };

    } catch (error) {
        console.error('An error occurred during the save process:', error);
        throw error;
    }
};