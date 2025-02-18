'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold flex items-center">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Wallet className="w-7 h-7 text-blue-600" />
          </div>
          <a
            href="/"
            className="ml-3 text-gray-800 font-semibold hover:text-blue-600 transition-colors duration-300"
          >
            SolServ
          </a>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-2 flex space-x-6 shadow-sm">
            <a
              href="/List"
              className="text-gray-800 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm"
            >
              List
            </a>
            <a
              href="/Rent"
              className="text-gray-800 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm"
            >
              Rent
            </a>
            <a
              href="/RentedNfts"
              className="text-gray-800 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm"
            >
              Rented NFTs
            </a>
          </div>
        </div>

        {/* Wallet Button */}
        <div className="ml-4">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;