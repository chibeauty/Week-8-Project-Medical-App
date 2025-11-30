import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 flex justify-between items-center bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">AfyaPulse</h1>
        <nav>
          <Link to="/login" className="text-gray-600 hover:text-gray-800 mx-2">Login</Link>
          <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl">
          <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/c43859e8-6316-479d-9e09-bd2ca8620218/afyapulse-hero-yvvxty4-1764535144891.webp" alt="AfyaPulse Hero" className="rounded-lg shadow-xl mb-8" />
          <h2 className="text-5xl font-bold text-gray-800 mb-4">Welcome to AfyaPulse</h2>
          <p className="text-xl text-gray-600 mb-8">Your personal health companion. Monitor your vitals, gain insights, and take control of your wellness journey.</p>
          <div>
            <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg">
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}