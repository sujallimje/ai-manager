"use client";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const goToApplyPage = () => {
    router.push("/apply");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>LoanVidya - AI-Powered Branch Manager</title>
        <meta
          name="description"
          content="Experience a human-like loan application process with LoanVidya."
        />
      </Head>
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">LoanVidya</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Loan Types</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
          </nav>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:flex items-center justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Your AI Branch Manager
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Apply for loans through video interaction with our AI Branch Manager. 
                No more paperwork, no more waiting in lines.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Interactive video conversations instead of boring forms</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Simplified document upload with instant verification</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Quick loan eligibility decisions and instant feedback</p>
                </div>
              </div>
              <button
                onClick={goToApplyPage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                Get Started
              </button>
            </div>
            <div className="lg:w-5/12">
              <div className="bg-white p-4 rounded-xl shadow-xl relative overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-inner bg-gray-100">
                  <div className="p-8 flex flex-col items-center justify-center h-full">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 text-center mb-2">Apply for a loan with</p>
                    <p className="text-xl font-semibold text-blue-600">LoanVidya AI Branch Manager</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-600 opacity-10 rounded-full"></div>
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-green-600 opacity-10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Interaction</h3>
                <p className="text-gray-600">Talk directly with our AI Branch Manager through interactive video conversations.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Upload</h3>
                <p className="text-gray-600">Simply snap photos of your documents or upload them directly.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Decision</h3>
                <p className="text-gray-600">Get instant loan eligibility results and next steps.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold">LoanVidya</span>
              <p className="mt-2 text-gray-400">Your AI Branch Manager</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Loans</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Personal Loans</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Home Loans</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Business Loans</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-gray-400 text-sm">© 2025 LoanVidya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}