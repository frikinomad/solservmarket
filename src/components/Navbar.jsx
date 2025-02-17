'use client';

import { useState } from "react";
import { Wallet} from 'lucide-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"; // Assuming you're using Solana wallet adapter

const Navbar = () => {

  return (
    <nav className="bg-teal-200 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 flex items-center">
          <Wallet className="w-8 h-8 text-teal-600 mr-2" />
          <a
            href="/"
            className="text-gray-700 font-medium px-4 py-2 rounded-full transition-colors duration-300"
          >
            SolServ
          </a>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center">
          <div className="bg-white rounded-full px-8 py-2 flex space-x-6">
            <a
              href="/List"
              className="text-gray-700 font-medium px-4 py-2 rounded-full transition-colors duration-300 hover:bg-teal-50"
            >
              List
            </a>
            <a
              href="/Rent"
              className="text-gray-700 font-medium px-4 py-2 rounded-full transition-colors duration-300 hover:bg-teal-50"
            >
              Rent
            </a>
            <a
              href="/RentedNfts"
              className="text-gray-700 font-medium px-4 py-2 rounded-full transition-colors duration-300 hover:bg-teal-50"
            >
              Rented NFTs
            </a>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="ml-4">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
