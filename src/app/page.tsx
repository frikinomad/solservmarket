import React from 'react';
import { 
  Wallet, 
  Shield, 
  Clock, 
  Coins, 
  ArrowRight, 
  Zap, 
  Globe, 
  Lock 
} from 'lucide-react';

const Home = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-teal-50 to-white relative overflow-hidden">
      {/* Floating Dots Background */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-teal-300 rounded-full opacity-70 animate-pulse"
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
  
      {/* Content */}
      <div className="container mx-auto px-4 flex-grow flex flex-col justify-center items-center z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Unlock NFT Rental Power
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rent, lend, and maximize digital assets with secure blockchain technology
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center">
              <a href='/Rent'>
                Start Renting
              </a>
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-xl hover:bg-teal-50">
              List NFTs
            </button>
          </div>
        </div>
      </div>
  
    </div>
  );
};

export default Home;