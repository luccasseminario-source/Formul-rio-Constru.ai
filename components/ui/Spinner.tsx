
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div
            className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"
            role="status"
            aria-live="polite"
        >
          <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
