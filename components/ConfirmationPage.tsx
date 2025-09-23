import React from 'react';

interface ConfirmationPageProps {
    onReset: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ onReset }) => {
    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl shadow-2xl shadow-orange-500/10 p-8 sm:p-10 lg:p-12 text-center flex flex-col items-center animate-fade-in">
            <CheckIcon />
            <h1 className="text-3xl sm:text-4xl font-bold text-orange-400 mt-6">Envio Concluído!</h1>
            <p className="text-zinc-200 mt-4 max-w-md">
                Seus dados foram recebidos e a análise de IA foi concluída com sucesso. Entraremos em contato em breve.
            </p>
            <button
                onClick={onReset}
                className="mt-8 px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
            >
                Enviar Outro Formulário
            </button>
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ConfirmationPage;