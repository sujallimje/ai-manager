"use client";
import { useState } from "react";
import Head from "next/head";
import Webcam from "react-webcam"; // Import the Webcam component

export default function Apply() {
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [documents, setDocuments] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState("");

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const submitApplication = () => {
    // Simulate API call for loan approval
    setTimeout(() => {
      const status = Math.random() > 0.5 ? "approved" : "rejected";
      setApplicationStatus(status);
      setStep(6); // Move to the final step
    }, 2000);
  };

  // Video URLs for each step
  const videoUrls = [
    "/videos/manager2.mp4", // Video for step 1
    "/videos/step2.mp4", // Video for step 2
    "/videos/step3.mp4", // Video for step 3
    "/videos/step4.mp4", // Video for step 4
    "/videos/step5.mp4", // Video for step 5
    applicationStatus === "approved"
      ? "/videos/step6-approved.mp4"
      : "/videos/step6-rejected.mp4", // Video for step 6
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Head>
        <title>Apply for a Loan - BranchAI</title>
      </Head>
      {/* Video Section (Left Side) */}
      <div className="w-1/2 h-1/2 bg-black flex flex-col items-center justify-center relative">
        {/* Pre-recorded Video */}
        <video key={step} autoPlay controls className="w-full h-full">
          <source src={videoUrls[step - 1]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Webcam Feed (Bottom Left) */}
      <div className="absolute bottom-4 left-4 w-64 h-48  bg-black rounded-lg  shadow-lg">
        <Webcam
          audio={false} // Disable audio
          mirrored={true} // Mirror the webcam feed
          screenshotFormat="image/jpeg"
          width="100%"
          height="100%"
          className="object-cover"
        />
      </div>
      {/* Form Section (Right Side) */}
      <div className="w-1/2 bg-white p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {step === 1 && (
            <div>
              <h2 className="text-2xl text-blue-500 font-bold mb-4">Identity Verification</h2>
              <p className="text-gray-700 mb-4">
                Please adjust your camera so that your face is clearly visible.
                Make sure you’re in a well-lit area and position your face in
                the center of the frame.
              </p>
              <p className="text-gray-700 mb-4">
                Please look straight into the camera and follow the
                instructions.
              </p>
              <div className="flex justify-between">
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl text-blue-500 font-bold mb-4">
                Hello! I’m Rohan, your Virtual Branch Manager.
              </h2>
              <p className="text-gray-700 mb-4">
                I’ll guide you through the loan application process. This will
                take just a few minutes. Let’s get started!
              </p>
              <p className="text-gray-700 mb-4">
                What type of loan are you interested in?
              </p>
              <select
                className="w-full p-2 border rounded mb-4"
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="">Select Loan Type</option>
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="business">Business Loan</option>
              </select>
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl text-blue-500 font-bold mb-4">
                May I know the purpose of the loan?
              </h2>
              <p className="text-gray-700 mb-4">
                For example, if it’s a personal loan, is it for education,
                medical expenses, or any other purpose?
              </p>
              <input
                type="text"
                placeholder="Loan Purpose"
                className="w-full p-2 border rounded mb-4"
                onChange={(e) => setLoanPurpose(e.target.value)}
              />
              <p className="text-gray-700 mb-4">
                How much would you like to borrow?
              </p>
              <input
                type="number"
                placeholder="Loan Amount"
                className="w-full p-2 border rounded mb-4"
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl text-blue-500 font-bold mb-4">Document Upload</h2>
              <p className="text-gray-700 mb-4">
                Please upload the following documents:
              </p>
              <ul className="list-disc list-inside mb-4">
                <li>Identity Proof</li>
                <li>Address Proof</li>
                <li>PAN Card</li>
                <li>Income Proof (Salary Slip/ITR)</li>
                <li>CIBIL Score Report</li>
                <li>Employment Proof</li>
                <li>Property Documents</li>
                <li>Collateral Documents</li>
              </ul>
              <input
                type="file"
                multiple
                className="w-full p-2 border rounded mb-4"
                onChange={handleDocumentUpload}
              />
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl text-blue-500 font-bold mb-4">
                Analyzing Your Application
              </h2>
              <p className="text-gray-700 mb-4">
                Thank you! We are now analyzing your application and documents.
                This may take a few seconds. Please wait...
              </p>
              <button
                onClick={submitApplication}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Application
              </button>
            </div>
          )}

          {step === 6 && (
            <div>
              {applicationStatus === "approved" ? (
                <div>
                  <h2 className="text-2xl  font-bold mb-4 text-green-600">
                    Good news! Your loan application has been approved.
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We’ll notify you once the funds are disbursed. Thank you for
                    choosing BranchAI!
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-red-600">
                    We’re sorry. Unfortunately, your application did not meet
                    our eligibility criteria.
                  </h2>
                  <p className="text-gray-700 mb-4">
                    You’ll receive an email with the detailed reason. If you’d
                    like to discuss this, feel free to contact us.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
