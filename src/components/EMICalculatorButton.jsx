import React, { useState } from 'react';
import EMICalculator from './EMICalculator';

const EMICalculatorButton = () => {
  const [showCalculator, setShowCalculator] = useState(false);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  return (
    <>
      <div 
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-10 transition-transform duration-300 ${showCalculator ? 'translate-x-80' : 'translate-x-0'}`}
      >
        <button 
          onClick={toggleCalculator}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-l-xl shadow-lg transition-all duration-300"
          style={{ 
            writingMode: 'vertical-lr', 
            transform: 'rotate(180deg)',
            padding: '1.5rem 0.75rem',
            borderTopRightRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
        >
          <span className="text-lg font-semibold">Calculate EMI</span>
        </button>
      </div>
      
      <EMICalculator 
        onClose={toggleCalculator} 
        isOpen={showCalculator}
      />
    </>
  );
};

export default EMICalculatorButton;