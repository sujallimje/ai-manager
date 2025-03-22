import React, { useState, useEffect } from 'react';

const EMICalculator = ({ onClose, isOpen }) => {
    const [principal, setPrincipal] = useState(1000000);
    const [rate, setRate] = useState(8.5);
    const [time, setTime] = useState(20);
    const [emi, setEMI] = useState(null);
    
    // Calculate EMI when inputs change
    useEffect(() => {
        calculateEMI();
    }, [principal, rate, time]);
    
    const calculateEMI = () => {
        const P = parseFloat(principal);
        const R = parseFloat(rate) / 12 / 100;
        const N = parseFloat(time) * 12;
        if (P && R && N) {
            const emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            setEMI(emiValue);
        } else {
            setEMI(null);
        }
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    return (
        <div className={`fixed top-1/2 right-0 w-80 bg-white shadow-xl rounded-l-lg overflow-hidden transform -translate-y-1/2 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <h2 className="text-lg font-bold">EMI Calculator</h2>
                <button className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors" onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div className="p-4">
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                        <span className="text-blue-600 font-medium">{formatCurrency(principal)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="100000" 
                        max="10000000" 
                        step="50000" 
                        value={principal} 
                        onChange={(e) => setPrincipal(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹1L</span>
                        <span>₹1Cr</span>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Interest Rate</label>
                        <span className="text-blue-600 font-medium">{rate}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="5" 
                        max="20" 
                        step="0.1" 
                        value={rate} 
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5%</span>
                        <span>20%</span>
                    </div>
                </div>
                
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
                        <span className="text-blue-600 font-medium">{time} Years</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        step="1" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 Year</span>
                        <span>30 Years</span>
                    </div>
                </div>
                
                {emi !== null && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="text-center text-gray-700 font-medium mb-2">Your Monthly EMI</h3>
                        <p className="text-center text-2xl font-bold text-blue-600">{formatCurrency(emi)}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <p className="text-gray-500">Total Interest</p>
                                <p className="font-medium">{formatCurrency(emi * time * 12 - principal)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-medium">{formatCurrency(emi * time * 12)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EMICalculator;