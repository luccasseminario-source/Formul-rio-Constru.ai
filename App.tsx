import React, { useState, useCallback } from 'react';
import ConstructionForm from './components/ConstructionForm';
import ConfirmationPage from './components/ConfirmationPage';

const App: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFormSuccess = useCallback(() => {
        setIsSubmitted(true);
    }, []);

    const handleReset = useCallback(() => {
        setIsSubmitted(false);
    }, []);

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-all duration-500">
             <div className="w-full max-w-4xl">
                {isSubmitted ? (
                    <ConfirmationPage onReset={handleReset} />
                ) : (
                    <ConstructionForm onSuccess={handleFormSuccess} />
                )}
             </div>
        </div>
    );
};

export default App;