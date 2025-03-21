"use client";
import { useState, useRef, useEffect } from "react";

const LoanTypeSelector = ({ onSelect }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedLoanType, setSelectedLoanType] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const loanTypes = [
    {
      id: "personal",
      title: "Personal Loan",
      description: "For personal expenses like travel, wedding, or medical emergencies",
      interestRate: "10.99% - 18.00%",
      amount: "₹50,000 - ₹20,00,000",
    },
    {
      id: "home",
      title: "Home Loan",
      description: "For purchasing or renovating a house or apartment",
      interestRate: "7.50% - 9.50%",
      amount: "₹5,00,000 - ₹5,00,00,000",
    },
    {
      id: "business",
      title: "Business Loan",
      description: "For business expansion, equipment purchase, or working capital",
      interestRate: "12.00% - 18.00%",
      amount: "₹1,00,000 - ₹50,00,000",
    },
    {
      id: "education",
      title: "Education Loan",
      description: "For higher education expenses, tuition fees, and study materials",
      interestRate: "8.50% - 12.50%",
      amount: "₹50,000 - ₹75,00,000",
    },
    {
      id: "vehicle",
      title: "Vehicle Loan",
      description: "For purchasing a new or used car, motorcycle, or other vehicle",
      interestRate: "9.50% - 14.00%",
      amount: "₹50,000 - ₹50,00,000",
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          processVoiceInput();
        };
        
        recognitionRef.current.onerror = (event) => {
          setIsListening(false);
          setError("Error occurred in recognition: " + event.error);
        };
      } else {
        setError("Your browser doesn't support speech recognition. Please type your choice instead.");
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    setError("");
    setTranscript("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceInput = () => {
    if (!transcript) return;
    
    // Convert transcript to lowercase for easier matching
    const lowerTranscript = transcript.toLowerCase();
    
    // Try to match the transcript to a loan type
    let matchedLoan = null;
    
    for (const loan of loanTypes) {
      const loanTitle = loan.title.toLowerCase();
      const loanId = loan.id.toLowerCase();
      
      if (lowerTranscript.includes(loanTitle) || lowerTranscript.includes(loanId)) {
        matchedLoan = loan.id;
        break;
      }
    }
    
    if (matchedLoan) {
      setSelectedLoanType(matchedLoan);
      setError("");
    } else {
      setError("Sorry, couldn't recognize the loan type. Please try again or click on your choice.");
    }
  };

  const handleManualSelect = (loanType) => {
    setSelectedLoanType(loanType);
    setError("");
  };

  const handleSubmit = () => {
    if (selectedLoanType) {
      onSelect(selectedLoanType);
    } else {
      setError("Please select a loan type to continue");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl text-blue-600 font-bold mb-2">
          Select Loan Type
        </h3>
        <p className="text-gray-600">
          Please select the type of loan you're interested in. You can click directly or speak your choice.
        </p>
      </div>

      <div className="mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
          <div className="text-blue-600 mr-3 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-blue-800 text-sm">
              <strong>Voice Selection:</strong> Click the microphone button and clearly say the loan type you want, 
              such as "Personal Loan" or "Home Loan".
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loanTypes.map((loan) => (
            <div
              key={loan.id}
              onClick={() => handleManualSelect(loan.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedLoanType === loan.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <h4 className="font-medium text-lg mb-1 text-gray-800">{loan.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{loan.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Interest: {loan.interestRate}</span>
                <span>Amount: {loan.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice recognition section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center mb-3">
          <h4 className="font-medium text-gray-800">Voice Selection</h4>
          <div className="ml-auto">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {isListening && (
          <div className="text-center py-2 text-blue-600 font-medium">
            Listening... Speak now
          </div>
        )}
        
        {transcript && (
          <div className="mt-2">
            <p className="text-gray-700 font-medium">You said:</p>
            <p className="p-2 bg-white border border-gray-200 rounded mt-1">{transcript}</p>
          </div>
        )}
        
        {selectedLoanType && (
          <div className="mt-3 bg-green-50 p-2 rounded border border-green-200">
            <p className="text-green-800">
              <span className="font-medium">Selected:</span> {loanTypes.find(l => l.id === selectedLoanType)?.title}
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-3 bg-red-50 p-2 rounded border border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div>
        <button
          onClick={handleSubmit}
          disabled={!selectedLoanType}
          className={`w-full px-6 py-3 rounded-lg font-medium shadow-sm ${
            selectedLoanType
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue with {selectedLoanType ? loanTypes.find(l => l.id === selectedLoanType)?.title : "Selected Loan"}
        </button>
      </div>
    </div>
  );
};

export default LoanTypeSelector;