import React from 'react';
import PropTypes from 'prop-types';

VoiceAnswerReview.propTypes = {
    answers: PropTypes.object.isRequired,
    questions: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  };

const VoiceAnswerReview = ({ answers, questions, onEdit, onConfirm }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-xl text-blue-600 font-bold mb-4">
        Review Your Voice Responses
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
          onClick={onEdit}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Edit Responses
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

export default VoiceAnswerReview;