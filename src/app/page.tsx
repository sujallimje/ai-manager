"use client";
import { useRouter } from "next/navigation";
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const goToApplyPage = () => {
    router.push("/apply");
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>BranchAI - AI-Powered Branch Manager</title>
        <meta
          name="description"
          content="Experience a human-like loan application process with BranchAI."
        />
      </Head>
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to BranchAI
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Your AI-powered branch manager for seamless loan applications.
      </p>

      {/* ✅ Correct Link for the App Router */}
      <button
        onClick={goToApplyPage}
        className="p-2 rounded-full bg-gray-300 dark:bg-gray-700 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
        title="Get Started"
        >
        
        </button>
    </div>
  );
}
