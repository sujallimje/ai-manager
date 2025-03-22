import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoanQuestionnaire = ({ loanType, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showReview, setShowReview] = useState(false);

  // Loan type information to display
  const loanInfo = {
    personal: {
      title: "Personal Loan",
      interestRate: "10.99% - 16.99%",
      processingFee: "1-2% of loan amount",
      maxAmount: "₹25,00,000",
      tenure: "12-60 months",
      description: "Quick approval with minimal documentation for your personal needs"
    },
    home: {
      title: "Home Loan",
      interestRate: "7.50% - 9.25%",
      processingFee: "0.5-1% of loan amount",
      maxAmount: "₹5,00,00,000",
      tenure: "Up to 30 years",
      description: "Competitive rates to help you purchase your dream home"
    },
    business: {
      title: "Business Loan",
      interestRate: "12.99% - 18.00%",
      processingFee: "1.5-2.5% of loan amount",
      maxAmount: "₹50,00,000",
      tenure: "12-84 months",
      description: "Grow your business with our flexible funding options"
    },
    education: {
      title: "Education Loan",
      interestRate: "8.50% - 11.50%",
      processingFee: "Nil to 1% of loan amount",
      maxAmount: "₹75,00,000",
      tenure: "Up to 15 years",
      description: "Invest in education with attractive interest rates and flexible repayment options"
    },
    vehicle: {
      title: "Vehicle Loan",
      interestRate: "9.25% - 12.50%",
      processingFee: "1-1.5% of loan amount",
      maxAmount: "₹80,00,000",
      tenure: "12-84 months",
      description: "Drive home your dream vehicle with quick approvals and competitive rates"
    }
  };

  // Initialize questions based on loan type
  const getQuestions = (type) => {
    const commonQuestions = [
      { id: "fullName", text: "Great! Let's start with some basic details. What's your full name?", type: "text" },
      { id: "dob", text: "And your date of birth?", type: "text" },
      { id: "contact", text: "Perfect. Could you also share your contact number and email address?", type: "text" },
      // { id: "address", text: "Thanks! Now, what's your current residential address?", type: "text" },
      { id: "loanAmount", text: "Alright, now let's talk about your loan needs. How much loan amount are you looking for?", type: "text" },
      { id: "purpose", text: `Got it. What's the purpose of this ${type} loan?`, type: "text" },
      { id: "tenure", text: "That makes sense. And how long would you like the loan for? Are you thinking of a tenure like 24 months, 10years, or something else?", type: "text" },
      { id: "employmentStatus", text: "Understood! Now, let's go over your employment details. Are you currently employed or self-employed?", type: "text" },
      { id: "employmentDetails", text: "If employed, could you tell me your job title and company name? If self-employed, what type of business do you run?", type: "text" },
      { id: "income", text: "Thanks! And what's your approximate monthly or annual income?", type: "text" },
      { id: "existingLoans", text: "Got it. Do you have any existing loans or financial commitments that we should consider?", type: "text" },
      // { id: "bankAccount", text: "Alright. Let's check a few more details. Do you have an active bank account?", type: "text" },
      { id: "creditScore", text: "Do you happen to know your credit score?", type: "text" },
      // { id: "defaults", text: "Have you ever faced any loan defaults or financial issues in the past?", type: "text" },
      { id: "guarantors", text: " Now please fill details of guarantors for this loan?", type: "text" },
      // { id: "updates", text: "That's helpful to know. Lastly, would you like to receive loan-related updates via SMS or email?", type: "text" }
    ];

    // Add loan-specific questions
    if (type === "personal") {
      // Already covered in common questions
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our personal loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    } else if (type === "home") {
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our home loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "propertyValue", text: "What is the approximate value of the property you're looking to purchase?", type: "text" },
        { id: "propertyAddress", text: "Could you provide the address of the property you're interested in?", type: "text" },
        { id: "downPayment", text: "How much down payment are you planning to make?", type: "text" },
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    } else if (type === "business") {
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our business loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "businessName", text: "What is the name of your business?", type: "text" },
        { id: "businessType", text: "What type of business do you operate? (Sole proprietorship, LLC, Corporation, etc.)", type: "text" },
        { id: "yearsInBusiness", text: "How many years has your business been operational?", type: "text" },
        { id: "annualRevenue", text: "What is your annual business revenue?", type: "text" },
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    } else if (type === "education") {
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our education loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "instituteName", text: "Which educational institution will you be attending?", type: "text" },
        { id: "course", text: "What course or program are you planning to pursue?", type: "text" },
        { id: "courseDuration", text: "What is the duration of this course?", type: "text" },
        { id: "admissionStatus", text: "Have you received an admission offer or are you in the application process?", type: "text" },
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    } else if (type === "vehicle") {
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our vehicle loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "vehicleType", text: "What type of vehicle are you planning to purchase? (Car, motorcycle, etc.)", type: "text" },
        { id: "vehicleModel", text: "Do you have a specific make and model in mind?", type: "text" },
        { id: "dealerInfo", text: "Are you purchasing from a specific dealer? If yes, could you provide their details?", type: "text" },
        { id: "vehiclePrice", text: "What is the on-road price of the vehicle?", type: "text" },
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    } else {
      return [
        { id: "intro", text: "Hi! Welcome, and thank you for considering our loan services. I'll need to ask you a few questions to understand your requirements and eligibility. This will only take a few minutes. Shall we begin?", type: "intro" },
        ...commonQuestions,
        { id: "outro", text: "Perfect! Thank you for sharing these details. I'll now assess your eligibility and move to the document verification stage. Do you have any questions for me before we proceed?", type: "outro" }
      ];
    }
  };

  const [questions, setQuestions] = useState([]);
  
  useEffect(() => {
    if (loanType) {
      setQuestions(getQuestions(loanType));
    }
  }, [loanType]);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      console.error('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    setTranscript("");
    setIsRecording(true);
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    
    // After stopping recording, enable edit mode
    if (transcript) {
      setIsEditing(true);
      
      // Save the answer
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: transcript
      }));
    }
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
    
    // Update the answers as user types
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: e.target.value
    }));
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleNextQuestion = () => {
    // Make sure editing is finished before moving on
    setIsEditing(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setTranscript("");
    } else {
      // Show confirmation before completing the questionnaire
      setShowConfirmation(true);
    }
  };

  const handlePreviousQuestion = () => {
    // Make sure editing is finished before moving back
    setIsEditing(false);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      // Restore previous answer if available
      const prevQuestion = questions[currentQuestionIndex - 1];
      if (answers[prevQuestion.id]) {
        setTranscript(answers[prevQuestion.id]);
      } else {
        setTranscript("");
      }
    }
  };

  const handleComplete = () => {
    onComplete(answers); // This connects back to page.js
  };

  const currentQuestion = questions[currentQuestionIndex] || {};

  // If no loan type is selected yet, show a placeholder
  if (!loanType || !questions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading questionnaire...</span>
      </div>
    );
  }

  // Display loan info at the start
  if (currentQuestionIndex === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl text-blue-600 font-bold mb-4">
          {loanInfo[loanType]?.title || "Loan"} Information
        </h3>
        
        <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100">
          <p className="text-gray-700 mb-4">{loanInfo[loanType]?.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Interest Rate</p>
              <p className="text-gray-800 font-medium">{loanInfo[loanType]?.interestRate}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Processing Fee</p>
              <p className="text-gray-800 font-medium">{loanInfo[loanType]?.processingFee}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Maximum Amount</p>
              <p className="text-gray-800 font-medium">{loanInfo[loanType]?.maxAmount}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Tenure</p>
              <p className="text-gray-800 font-medium">{loanInfo[loanType]?.tenure}</p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          {questions[0]?.text}
        </p>

        <button
          onClick={handleNextQuestion}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Let's Begin
        </button>
      </div>
    );
  }

  // Show confirmation screen at the end
  if (showConfirmation) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl text-blue-600 font-bold mb-4">
          Review Your Information
        </h3>
        
        <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200 max-h-96 overflow-y-auto">
          {questions.filter(q => q.type === "text").map((question) => (
            <div key={question.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
              <p className="text-gray-600 text-sm mb-1">{question.text}</p>
              <p className="text-gray-800 font-medium">{answers[question.id] || "Not provided"}</p>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Edit Responses
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex} of {questions.length - 1}</span>
          <span className="text-sm font-medium text-blue-600">{Math.round(((currentQuestionIndex) / (questions.length - 1)) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{width: `${Math.round(((currentQuestionIndex) / (questions.length - 1)) * 100)}%`}}
          ></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg text-gray-800 font-medium mb-4">
            {currentQuestion.text}
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 min-h-20">
            {isEditing ? (
              <textarea
                className="w-full h-32 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transcript}
                onChange={handleTranscriptChange}
                placeholder="Edit your response here..."
              />
            ) : transcript ? (
              <p className="text-gray-800">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">Your response will appear here...</p>
            )}
          </div>

          <div className="mb-4">
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Changes
              </button>
            ) : !isRecording ? (
              <button
                onClick={startRecording}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center justify-center animate-pulse"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                </svg>
                Stop Recording
              </button>
            )}
          </div>

          {  !isRecording && !isEditing && (
            <div className="mb-4">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full border border-blue-500 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Edit Response
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePreviousQuestion}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={currentQuestionIndex <= 1}
            >
              Back
            </button>
            <button
              onClick={handleNextQuestion}
              className={`px-4 py-2 rounded-lg text-white font-medium ${transcript ? 'bg-blue-600 hover:bg-blue-700 transition-colors' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!transcript || isEditing}
            >
              Next
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoanQuestionnaire;