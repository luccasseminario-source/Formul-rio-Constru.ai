import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';

import { FormData, FormErrors } from '../types';
import { BRAZILIAN_STATES } from '../constants';
import { generateComprehensiveAnalysis } from '../services/geminiService';
import { saveFormData } from '../services/supabaseService';
import { fileToBase64 } from '../utils/fileUtils';

import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import FileInput from './ui/FileInput';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface ConstructionFormProps {
    onSuccess: () => void;
}

const initialFormData: FormData = {
    fullName: '',
    email: '',
    suppliesContactName: '',
    suppliesContactPhone: '',
    city: '',
    state: '',
    projectName: '',
    address: '',
    floorCount: '',
    startDate: '',
    endDate: '',
    projectDescription: '',
    currentPhaseDescription: '',
    materialManagementDifficulty: '',
    currentSituationImage: [],
    finalProjectImage: [],
};

const ConstructionForm: React.FC<ConstructionFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Nome completo é obrigatório.';
        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Formato de e-mail inválido.';
        }
        if (!formData.suppliesContactName) newErrors.suppliesContactName = 'Nome do contato é obrigatório.';
        if (!formData.suppliesContactPhone) newErrors.suppliesContactPhone = 'Telefone do contato é obrigatório.';
        if (!formData.projectName) newErrors.projectName = 'Nome do projeto é obrigatório.';
        if (!formData.address) newErrors.address = 'Endereço é obrigatório.';
        if (!formData.city) newErrors.city = 'Cidade é obrigatória.';
        if (!formData.state) newErrors.state = 'Estado é obrigatório.';
        if (!formData.floorCount) newErrors.floorCount = 'Número de pavimentos é obrigatório.';
        if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória.';
        if (!formData.endDate) newErrors.endDate = 'Data de término é obrigatória.';
        if (!formData.projectDescription) newErrors.projectDescription = 'Descrição do projeto é obrigatória.';
        if (!formData.currentPhaseDescription) newErrors.currentPhaseDescription = 'Descrição da fase atual é obrigatória.';
        if (!formData.materialManagementDifficulty) newErrors.materialManagementDifficulty = 'Descrição das dificuldades é obrigatória.';

        if (!formData.currentSituationImage || formData.currentSituationImage.length === 0) {
            newErrors.currentSituationImage = 'Pelo menos uma imagem da situação atual é obrigatória.';
        }

        return newErrors;
    };

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && (name === 'currentSituationImage' || name === 'finalProjectImage')) {
            const newFiles = Array.from(files);
            if (newFiles.length === 0) return;
    
            setFormData(prev => {
                const existingFiles = prev[name] || [];
                const combined = [...existingFiles, ...newFiles].slice(0, 5);
                return { ...prev, [name]: combined };
            });
    
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: undefined }));
            }
        }
    }, [errors]);
    
    const handleRemoveFile = useCallback((name: 'currentSituationImage' | 'finalProjectImage', index: number) => {
        setFormData(prev => {
            const files = prev[name] as File[];
            if (!files) return prev;
            const updatedFiles = files.filter((_, i) => i !== index);
            return { ...prev, [name]: updatedFiles };
        });
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);

        try {
            const [currentImagesBase64, finalImagesBase64] = await Promise.all([
                Promise.all((formData.currentSituationImage || []).map(file => fileToBase64(file))),
                Promise.all((formData.finalProjectImage || []).map(file => fileToBase64(file)))
            ]);

            const currentImagesMimeTypes = (formData.currentSituationImage || []).map(file => file.type);
            const finalImagesMimeTypes = (formData.finalProjectImage || []).map(file => file.type);
            
            const aiAnalysis = await generateComprehensiveAnalysis(
                formData,
                currentImagesBase64,
                currentImagesMimeTypes,
                finalImagesBase64,
                finalImagesMimeTypes
            );
            
            await saveFormData(formData, aiAnalysis);
            
            onSuccess();
        } catch (error) {
            console.error("Submission failed:", error);
            setFormError(error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl shadow-2xl shadow-orange-500/10 p-8 sm:p-10 lg:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-orange-400 mb-2">Formulário de Acompanhamento de Obra</h1>
            <p className="text-zinc-300 text-center mb-8">Preencha os dados abaixo para que nossa IA possa analisar seu projeto.</p>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <legend className="text-xl font-semibold text-white mb-4 w-full col-span-1 md:col-span-2 border-b border-zinc-700 pb-2">Informações de Contato</legend>
                    <Input label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
                    <Input label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                    <Input label="Nome do Contato (Suprimentos)" name="suppliesContactName" value={formData.suppliesContactName} onChange={handleChange} error={errors.suppliesContactName} required />
                    <Input label="Telefone do Contato (Suprimentos)" name="suppliesContactPhone" type="tel" value={formData.suppliesContactPhone} onChange={handleChange} error={errors.suppliesContactPhone} required />
                </fieldset>

                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <legend className="text-xl font-semibold text-white mb-4 w-full col-span-1 md:col-span-2 border-b border-zinc-700 pb-2">Detalhes do Projeto</legend>
                    <Input className="md:col-span-2" label="Nome do Projeto" name="projectName" value={formData.projectName} onChange={handleChange} error={errors.projectName} required />
                    <Input className="md:col-span-2" label="Endereço Completo da Obra" name="address" value={formData.address} onChange={handleChange} error={errors.address} required />
                    <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} error={errors.city} required />
                    <Select label="Estado" name="state" value={formData.state} onChange={handleChange} error={errors.state} options={BRAZILIAN_STATES} required />
                    <Input label="Número de Pavimentos" name="floorCount" type="number" value={formData.floorCount} onChange={handleChange} error={errors.floorCount} required />
                    <div className="grid grid-cols-2 gap-6">
                        <Input label="Data de Início" name="startDate" type="date" value={formData.startDate} onChange={handleChange} error={errors.startDate} required />
                        <Input label="Data de Término Prevista" name="endDate" type="date" value={formData.endDate} onChange={handleChange} error={errors.endDate} required />
                    </div>
                </fieldset>

                <fieldset className="space-y-6">
                    <legend className="text-xl font-semibold text-white mb-4 w-full border-b border-zinc-700 pb-2">Descrição e Status</legend>
                    <Textarea label="Descrição Detalhada do Projeto" name="projectDescription" value={formData.projectDescription} onChange={handleChange} error={errors.projectDescription} required placeholder="Descreva os objetivos, escopo e principais características da construção." />
                    <Textarea label="Descrição da Fase Atual" name="currentPhaseDescription" value={formData.currentPhaseDescription} onChange={handleChange} error={errors.currentPhaseDescription} required placeholder="Se souber, descreva em que pé está a obra (ex: fundação, alvenaria, acabamento)." />
                    <Textarea label="Dificuldades com Gestão de Materiais" name="materialManagementDifficulty" value={formData.materialManagementDifficulty} onChange={handleChange} error={errors.materialManagementDifficulty} required placeholder="Descreva qualquer desafio logístico, de armazenamento ou de fornecimento que esteja enfrentando." />
                </fieldset>
                
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <legend className="text-xl font-semibold text-white mb-4 w-full col-span-1 md:col-span-2 border-b border-zinc-700 pb-2">Mídia do Projeto</legend>
                    <FileInput 
                        label="Imagens da Situação Atual (Máx 5)" 
                        name="currentSituationImage"
                        value={formData.currentSituationImage || []}
                        onChange={handleFileChange}
                        onRemove={(index) => handleRemoveFile('currentSituationImage', index)}
                        error={errors.currentSituationImage}
                        required
                    />
                     <FileInput 
                        label="Imagens do Projeto Finalizado (Opcional)" 
                        name="finalProjectImage"
                        value={formData.finalProjectImage || []}
                        onChange={handleFileChange}
                        onRemove={(index) => handleRemoveFile('finalProjectImage', index)}
                    />
                </fieldset>
                
                {formError && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{formError}</p>}
                
                <div className="pt-4 flex justify-center">
                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? <><Spinner /> Analisando com IA...</> : 'Enviar para Análise'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ConstructionForm;