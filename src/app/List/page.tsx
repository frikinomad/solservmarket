'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '@dialectlabs/blinks/index.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, clusterApiUrl, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';

import idl from '../../utils/solservprogram.json'
import { Program, AnchorProvider, setProvider, BN, Idl } from "@coral-xyz/anchor";
import { Action, ActionAdapter, Blink, useActionsRegistryInterval } from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import { Copy, ExternalLink } from 'lucide-react';


const List = () => {

    const wallet = useWallet();
    const {publicKey, connected} = useWallet();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [onRental, setOnRental] = useState([])

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    useEffect(() => {
        const intervalId = setInterval(() => setError(null), 120000);    
        return () => {
          clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (publicKey) {
          initializeProgram();
        }
    }, [publicKey]);


    const initializeProgram = async () => {
        try {
            const provider = new AnchorProvider(connection, wallet, { commitment: 'processed' });
            setProvider(provider);
            
            // You'll need to import your IDL
            // Or we can just fetch from program
            // await Program.fetchIdl(programId, provider);
            const program = new Program(idl as Idl, provider);
            setProgram(program);
            
            await fetchOnRental();
        } catch (err) {
            setError("Failed to initialize program: " + err.message);
        }
    };

    const fetchOnRental = async () => {
        // get all listings -> filter the ones where rented = true & renter = current publicKey or any other key that you want
        const accounts = await program.account.listingData.all();
        console.log(accounts);
        
        
        const onRentalAccounts = accounts.filter((acc) => {
            const bool = acc.account.isRented;
            const key = acc.account.owner && acc.account.owner.toString() === publicKey.toString();
            
            return (bool && key);
        });        
        
        console.log("onRentalAccounts", onRentalAccounts);

        setOnRental(onRentalAccounts)
    }

    const { isRegistryLoaded } = useActionsRegistryInterval();
    const { adapter } = useActionSolanaWalletAdapter(connection);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl mx-auto border border-gray-200">
          {/* Registry Status */}
          <div className="bg-white min-h-screen flex items-center justify-center">
            {isRegistryLoaded ? (
              <ManyActions adapter={adapter} />
            ) : (
              <p className="text-gray-600">Loading actions...</p>
            )}
          </div>
      
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0zm-9-4h.01M12 16h.01"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
      
          {/* Rental Listings */}
          <br/>

          <h2>Rented NFT's </h2>
          <div className="space-y-6">
            {onRental.length > 0 ? (
              onRental.map((rented, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
                  <div className="flex flex-col space-y-2">
                    <p className="text-lg font-semibold text-gray-900">NFT: {rented.account.nftMint.toString()}</p>
                    <p className="text-gray-700">Rented to: <span className="font-medium">{rented.account.renter.toString()}</span></p>
                    <p className="text-gray-600">Price: <span className="font-semibold">{rented.account.price.toString()} SOL</span></p>
                    <p className="text-gray-500">Current Date: {new Date().toDateString()}</p>
                    <p className="text-gray-500">Start Date: {new Date(rented.account.rentalStart * 1000).toDateString()}</p>
                    <p className="text-gray-500">End Date: {new Date(rented.account.rentalEnd * 1000).toDateString()}</p>
                  </div>
      
                  <button
                    onClick={() => endRental(rented)}
                    disabled={loading}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition duration-200"
                  >
                    {loading ? 'Processing...' : 'End Rental'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No listings available</p>
            )}
          </div>
        </div>
      );
      
}

const ManyActions = ({ adapter }: { adapter: ActionAdapter }) => {
    
    const apiUrls = useMemo(() => ([
        'http://localhost:3000/api/actions/createListing',
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
            <div
                className="p-2 rounded-lg bg-blue-600 text-white font-medium shadow-md text-sm max-w-max"
            >
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

export default List;