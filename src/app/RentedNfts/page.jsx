'use client';

import React, { useEffect, useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, 
    NATIVE_MINT, getAssociatedTokenAddressSync,
 } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, setProvider, BN } from "@coral-xyz/anchor";
import idl from '../../utils/solservprogram.json'
import { Copy, ExternalLink } from 'lucide-react'


const RentedNfts = () => {

    const {publicKey, wallet } = useWallet();
    const {connection} = useConnection();
    const [rented, setRented] = useState([]);
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [copied, setCopied] = useState();

    useEffect(() => {
        if (publicKey) {
          initializeProgram();
        }
    }, [publicKey]);
    

    const initializeProgram = async () => {
        try {
            console.log("initializing");
            
            const provider = new AnchorProvider(
                connection,
                wallet,
                { commitment: 'processed' }
            );
            setProvider(provider);
            
            // You'll need to import your IDL
            const program = new Program(idl, provider);
            setProgram(program);
            
            await fetchRented();            
        } catch (err) {
            setError("Failed to initialize program: " + err.message);
        }
    };

    const fetchRented = async () => {        
        // get all listings -> filter the ones where rented = true & renter = current publicKey or any other key that you want
        const accounts = await program.account.listingData.all();
        
        const rentedAccounts = accounts.filter((acc) => {
            const bool = acc.account.isRented;
            const key = acc.account.renter && acc.account.renter.toString() === publicKey.toString();
            
            return (bool && key);
        });        
        
        console.log("rentedAccounts", rentedAccounts);

        setRented(rentedAccounts)
    }

    const endRental = async (rented) => {

        // Get Escrow PDA for NFT holding
        const [escrowPda] = await PublicKey.findProgramAddress(
            [Buffer.from("escrow"), rented.account.nftMint.toBuffer()],
            program.programId
        );

        // escrow pda ATA to hold SOL tokens: from here the money will go to the owner
        // this has to exist this time, cause if not then how did rent NFT worked
        const escrowPaymentAccount = getAssociatedTokenAddressSync(
            NATIVE_MINT,
            escrowPda,
            true
        );

        // TODO: account that holds NFT for owner, i.e. Move back from Escrow to user
        const ownerNftAccount = await getAssociatedTokenAddress(new PublicKey(rented.account.nftMint), rented.account.owner);

        // Owner ATA for SOL to return
        // TODO: this is NFT owner, from escrow to this owner transfer funds
        const ownerPaymentAccount = getAssociatedTokenAddressSync(
            NATIVE_MINT,
            rented.account.owner,
        )   

        const instruction = await program.methods
        .endRental()
        .accounts({
            listing: rented.publicKey,
            escrowAccount: escrowPda,
            escrowPaymentAccount: escrowPaymentAccount,
            wsolMint: NATIVE_MINT,
            ownerNftAccount: ownerNftAccount,
            ownerPaymentAccount: ownerPaymentAccount,            
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()

        const transaction = new Transaction();
        transaction.add(instruction)
        transaction.feePayer = publicKey;
        const { blockhash } = await connection.getRecentBlockhash('processed');
        transaction.blockhash = blockhash;

        const simulationResult = await connection.simulateTransaction(transaction);
        if (simulationResult.value.err) {
            const errorCode = simulationResult.value.err?.Custom || "Unknown Error Code";
            console.error("Error Code:", errorCode);
        
            // Parse simulation logs to find the error message
            const errorLogs = simulationResult.value.logs || [];
            const errorMessage = errorLogs.find(log => log.includes("Error Message:")) || "No specific error message found.";
            setError(errorMessage)        
            // Log all simulation logs for debugging
            console.log("Detailed Simulation Logs:", errorLogs);
        } else {
            console.log("Simulation successful.");
            // TODO:
            const signature = await program.provider.sendAndConfirm(transaction);
            console.log(signature);
        }

    }

    const getTimeRemaining = (end) => {
        const now = Date.now() / 1000;
        const diff = end - now;
        const days = Math.floor(diff / (24 * 60 * 60));
        const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
        return { days, hours };
    };

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rented NFTs</h2>
          <div className="grid grid-cols-2 gap-6">
            {rented.map((rented, index) => {
              const { days, hours } = getTimeRemaining(rented.account.rentalEnd);
              
              const currentTime = Date.now() / 1000;
              const rentalStart = rented.account.rentalStart;
              const rentalEnd = rented.account.rentalEnd;

              const totalSecondsUntilStart = rentalStart - currentTime;
              const totalSecondsRemaining = rentalEnd - currentTime;

              const daysUntilStart = Math.floor(totalSecondsUntilStart / (60 * 60 * 24));
              const hoursUntilStart = Math.floor((totalSecondsUntilStart % (60 * 60 * 24)) / (60 * 60));
              const minutesUntilStart = Math.floor((totalSecondsUntilStart % (60 * 60)) / 60);

              const daysRemaining = Math.floor(totalSecondsRemaining / (60 * 60 * 24));
              const hoursRemaining = Math.floor((totalSecondsRemaining % (60 * 60 * 24)) / (60 * 60));
              const minutesRemaining = Math.floor((totalSecondsRemaining % (60 * 60)) / 60);

              const remainingTime = currentTime < rentalStart
                ? daysUntilStart > 0 
                  ? `${daysUntilStart}d until start`
                  : hoursUntilStart > 0 
                    ? `${hoursUntilStart}h until start`
                    : `${minutesUntilStart}m until start`
                : daysRemaining > 0 
                  ? `${daysRemaining}d remaining`
                  : hoursRemaining > 0 
                    ? `${hoursRemaining}h remaining`
                    : minutesRemaining > 0
                      ? `${minutesRemaining}m remaining`
                      : 'Expired';

              const rentalStatus = currentTime < rentalStart
                ? 'Rental Not Started'
                : currentTime > rentalEnd
                  ? 'Rental Period Ended'
                  : hoursRemaining < 1
                    ? 'Ending Soon'
                    : 'Currently Rented';
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          NFT #{formatAddress(rented.account.nftMint.toString())}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Rented to: {formatAddress(rented.account.renter.toString())}
                          <button 
                            onClick={() => handleCopyAddress(rented.account.renter.toString())}
                            className="ml-2 text-blue-500 hover:text-blue-600"
                          >
                            <Copy className="w-4 h-4 inline" />
                          </button>
                        </p>
                      </div>
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {(Number(rented.account.price / 1e9)).toString()} SOL
                      </span>
                    </div>
    
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900 font-medium">{rentalStatus}</span>
                          <span className="text-gray-900 font-medium">{remainingTime}</span>
                        </div>
                      
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${
                                Date.now() / 1000 < rented.account.rentalStart
                                  ? 0
                                  : Math.min(100, ((Date.now() / 1000 - rented.account.rentalStart) / (rented.account.rentalEnd - rented.account.rentalStart)) * 100)
                              }%`
                            }}
                          />
                        </div>
    
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{new Date(rented.account.rentalStart * 1000).toLocaleDateString()}</span>
                        <span>{new Date(rented.account.rentalEnd * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
    
                    <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => endRental(rented)}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'End Rental'
                          )}
                        </button>
                      <button
                        onClick={() => window.open(`https://explorer.solana.com/address/${rented.account.nftMint.toString()}?cluster=devnet`, '_blank')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
    
          {rented.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Rentals</h3>
                <p className="text-gray-600">You don't have any rented NFTs.</p>
              </div>
            </div>
          )}
        </div>
      );
}

export default RentedNfts;