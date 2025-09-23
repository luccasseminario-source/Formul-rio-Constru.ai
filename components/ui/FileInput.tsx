import React, { InputHTMLAttributes, ChangeEvent, useState, useEffect } from 'react';

// Omit 'value' and 'onChange' from standard input attributes to define our own.
interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    label: string;
    error?: string;
    value: File[];
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}

const RemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FileInput: React.FC<FileInputProps> = ({ label, name, error, required, value, onChange, onRemove, ...props }) => {
    const errorClasses = error ? 'border-red-500' : 'border-zinc-600 hover:border-orange-400';
    const uploadPrompt = value.length < 5 ? 'Clique para adicionar imagens' : 'Limite de 5 imagens atingido';
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        // Create a new array of object URLs for the current files
        const newUrls = value.map(file => URL.createObjectURL(file));
        setPreviewUrls(newUrls);

        // Cleanup function to revoke the object URLs when component unmounts or files change
        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [value]);

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-white">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            
            {previewUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3 animate-fade-in">
                    {previewUrls.map((url, index) => (
                        <div key={url} className="relative group aspect-square">
                            <img
                                src={url}
                                alt={`Pré-visualização da imagem ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg shadow-md border-2 border-zinc-700"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-2 text-white bg-red-600/80 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 transition-all transform hover:scale-110"
                                    aria-label={`Remover imagem ${index + 1}`}
                                >
                                    <RemoveIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <label htmlFor={name} className={`relative flex items-center justify-center w-full px-4 py-5 bg-zinc-900/50 text-zinc-300 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-300 mt-2 ${errorClasses} ${value.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="mt-2 block text-xs font-semibold">{uploadPrompt}</span>
                </div>
            </label>
            <input
                id={name}
                name={name}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                onChange={onChange}
                disabled={value.length >= 5}
                {...props}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default FileInput;