'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '@dialectlabs/blinks/index.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, clusterApiUrl, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import idl from '../../utils/solservprogram.json';
import { Program, AnchorProvider, setProvider, BN, Idl } from "@coral-xyz/anchor";
import { Action, ActionAdapter, Blink, useActionsRegistryInterval } from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { getAssociatedTokenAddress, getAssociatedTokenAddressSync, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import RentedNfts from '../RentedNfts/page';

function App() {
  const wallet = useWallet();
  const {publicKey, connected} = useWallet();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onRental, setOnRental] = useState([]);
  const [listings, setListings] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  useEffect(() => {
    initializeProgram();
  }, [publicKey]);

  const handleClose = () => {
    setError(null);
  }

  const initializeProgram = async () => {
    try {
      const provider = new AnchorProvider(connection, wallet, { commitment: 'processed' });
      setProvider(provider);
      const program = new Program(idl as Idl, provider);
      setProgram(program);
      await fetchOnRental();
      await fetchListings();
    } catch (err) {
      setError("Failed to initialize program Re-Connect Wallet");
    }
  };

  const fetchListings = async () => {
    if (!program) return;
    
    try {
        setLoading(true);

        //TODO: Fetch all listings using getProgramAccounts
        const accounts = await program.account.listingData.all();

        const listedAccounts = accounts.filter((acc) => {
          const key = acc.account.owner && acc.account.owner.toString() === publicKey.toString();
          return key;
        });

        console.log("listedAccounts", listedAccounts);

        setListings(listedAccounts);
    } catch (err) {
        setError("Failed to fetch listings: " + err.message);
    } finally {
        setLoading(false);
    }
};

  const fetchOnRental = async () => {
    const accounts = await program.account.listingData.all();
    
    const onRentalAccounts = accounts.filter((acc) => {
      const bool = acc.account.isRented;
      const key = acc.account.owner && acc.account.owner.toString() === publicKey.toString();
      return (bool && key);
    });
    
    setOnRental(onRentalAccounts);
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeRemaining = (startTime, endTime) => {
    const remaining = endTime - startTime;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return { days, hours };
  };

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
    transaction.recentBlockhash = blockhash;

    const simulationResult = await connection.simulateTransaction(transaction);
    if (simulationResult.value.err) {
        console.error("Simulation failed with error:");
    
        // Parse simulation logs to find the error message
        const errorLogs = simulationResult.value.logs || [];
        const errorMessage = errorLogs.find(log => log.includes("Error Message:")) || "No specific error message found.";
        setError(errorMessage)
        // Log all simulation logs for debugging
        console.log(errorMessage);
    } else {
        console.log("Simulation successful.");
        const signature = await program.provider.sendAndConfirm(transaction);
        console.log(signature);
    }
  }

  const removeListing = async (listing) => {

    console.log(listing.publicKey.toString());
    

    try {

      // Get Escrow PDA for NFT holding
      const [escrowPda] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), listing.account.nftMint.toBuffer()],
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
      const ownerNftAccount = await getAssociatedTokenAddress(new PublicKey(listing.account.nftMint), listing.account.owner);

      // Owner ATA for SOL to return
      // TODO: this is NFT owner, from escrow to this owner transfer funds
      const ownerPaymentAccount = getAssociatedTokenAddressSync(
          NATIVE_MINT,
          listing.account.owner,
      )   

      const tx = await program.methods
        .delist()
        .accounts({
            listing: listing.publicKey,
            owner: publicKey,
            escrowAccount: escrowPda,
            ownerNftAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            SystemProgram: SystemProgram.programId
        })
        .rpc();
  
      await program.provider.connection.confirmTransaction(tx);
        
      console.log("Listing removed successfully!");
    } catch (error) {
      console.error("Error removing listing:", error);
      console.log(error.message || "Failed to remove listing");
    }
  };

  const { isRegistryLoaded } = useActionsRegistryInterval();
  const { adapter } = useActionSolanaWalletAdapter(connection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">NFT Rental Dashboard</h2>
        </header>

        <div className="flex gap-8">
          {/* Left Side - Blinks */}
          <div className="w-1/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Listing</h2>
            {isRegistryLoaded ? (
              <ManyActions adapter={adapter} />
            ) : (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-gray-600">Loading actions...</p>
              </div>
            )}
          </div>

          {/* Right Side - Rentals */}
          <div className="w-2/3 space-y-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Rentals</h2>
            
            {error && (
              <div className="mb-8 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={handleClose}
                  className="ml-4 text-red-500 hover:text-red-700 font-bold"
                >
                  ✖
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {onRental.map((rented, index) => {
                const { days, hours } = getTimeRemaining((Date.now() / 1000), rented.account.rentalEnd);
                // const timeStatus = days > 0 
                //   ? `${days}d remaining`
                //   : hours > 0 
                //     ? `${hours}h remaining`
                //     : rented.account.rentalEnd < Date.now() / 1000 
                //       ? 'Rental Period Ended' 
                //       : 'Ending soon';

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
                          {(rented.account.price.toNumber() / 1e9).toString()} SOL
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
                          // disabled={loading || rented.account.rentalEnd > Date.now() / 1000}
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

            {onRental.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Rentals</h3>
                  <p className="text-gray-600">You don't have any NFTs currently being rented out.</p>
                </div>
              </div>
            )}

            {/* All Listings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Listings</h2>
              <div className="grid grid-cols-2 gap-6">
                {listings.map((listing, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            NFT #{formatAddress(listing.account.nftMint.toString())}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Listed by: {formatAddress(listing.account.owner.toString())}
                            <button 
                              onClick={() => handleCopyAddress(listing.account.owner.toString())}
                              className="ml-2 text-blue-500 hover:text-blue-600"
                            >
                              <Copy className="w-4 h-4 inline" />
                            </button>
                          </p>
                        </div>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {(listing.account.price.toNumber() / 1e9).toString()} SOL
                        </span>
                      </div>
                  
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Listing Status</span>
                          <span className="text-gray-900 font-medium">
                            {listing.account.isRented ? 'Currently Rented' : 'Available'}
                          </span>
                        </div>
                        
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => removeListing(listing)}
                          disabled={listing.account.isRented}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          Delist
                        </button>
                        <button
                          onClick={() => window.open(`https://explorer.solana.com/address/${listing.account.nftMint.toString()}?cluster=devnet`, '_blank')}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {listings.length === 0 && 
                  <div className="text-center py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings</h3>
                      <p className="text-gray-600">You haven't created any listings yet.</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ManyActions = ({ adapter }: { adapter: ActionAdapter }) => {
  const apiUrls = useMemo(() => ([
    'http://localhost:3000/api/actions/createListing',
    'http://solserv.vercel.app/api/actions/createListing',
  ]), []);
  
  const [actions, setActions] = useState<Action[]>([]);
  const {publicKey, connected} = useWallet();

  useEffect(() => {
    const fetchActions = async () => {
      const fetchedActions = [];
      for (const url of apiUrls) {
        const modifiedUrl = new URL(url);
        modifiedUrl.searchParams.append('publicKey', publicKey.toString());
    
        try {
          const action = await Action.fetch(modifiedUrl.toString());
          fetchedActions.push(action);
        } catch (error) {
          console.error("Error fetching action:", error);
        }
      }
      
      setActions(fetchedActions);
    }
    fetchActions();
  }, [apiUrls, publicKey]);

  return (
    <div className="flex flex-wrap gap-4 justify-start items-start">
      {actions.map(action => (
        <ShareBlink key={action.url} action={action} adapter={adapter} />
      ))}
    </div>
  );  
}

const ShareBlink = ({ action, adapter }) => {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const websiteText = new URL(action.url).hostname;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(action.url);
    setCopied(true);
    setCopyMessage("Action Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 h-auto bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="bg-blue-100 p-3 flex justify-between items-center">
        <a
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 font-semibold flex items-center"
        >
          Share
          <ExternalLink className="ml-2 w-4 h-4" />
        </a>
        {copied && (
          <div className="p-2 rounded-lg bg-blue-600 text-white font-medium shadow-md text-sm max-w-max">
            {copyMessage}....
          </div>
        )}
        <button
          onClick={handleCopyUrl}
          className={`p-1 rounded ${copied ? 'bg-green-200' : 'hover:bg-blue-200'}`}
        >
          <Copy className="w-5 h-5 text-blue-700" />
        </button>
      </div>
      <Blink
        stylePreset="custom"
        action={action}
        websiteText={websiteText}
        adapter={adapter}
        securityLevel="non-malicious"
      />
    </div>
  );
};

export default App;