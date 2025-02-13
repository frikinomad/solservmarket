'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, clusterApiUrl, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress} from '@solana/spl-token';

import idl from '../utils/solservprogram.json'
import { Program, AnchorProvider, setProvider, BN, Idl } from "@coral-xyz/anchor";
import { Action, ActionAdapter, Blink, useActionsRegistryInterval } from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import { Copy, ExternalLink } from 'lucide-react';


const programId = new PublicKey('Bc5CiKaQJm8hjcDoJGgJiScfQMr1DQvoWf2Z3NMxFzxV'); // Program ID


const List = () => {

    const wallet = useWallet();
    const {publicKey, connected} = useWallet();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nftAddress, setNftAddress] = useState("");
    const [price, setPrice] = useState(0);
    const [listingTx, setListingTx] = useState("")
    const [onRental, setOnRental] = useState([])

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    useEffect(() => {
        if (publicKey) {
          initializeProgram();
        }
    }, [publicKey]);

    useEffect(() => {
        const intervalId = setInterval(() => setError(""), 240000);    
        return () => {
          clearInterval(intervalId);
        };
    }, []);

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
    
    const validateMintAddress = (mintAddress) => {
        try {
            const publicKey = new PublicKey(mintAddress); // Try creating a PublicKey instance
            return publicKey.toString().length === 44; // Valid Solana addresses are 44 characters long
        } catch (error) {
            return false; // If an error occurs, it's not a valid Solana address
        }
    };

    const fetchOnRental = async () => {
        // get all listings -> filter the ones where rented = true & renter = current publicKey or any other key that you want
        const accounts = await program.account.listingData.all();
        
        const onRentalAccounts = accounts.filter((acc) => {
            const bool = acc.account.isRented;
            const key = acc.account.owner && acc.account.owner.toString() === publicKey.toString();
            
            return (bool && key);
        });        
        
        console.log("onRentalAccounts", onRentalAccounts);

        setOnRental(onRentalAccounts)
    }

    const createListing = async () => {
        if (!program || !nftAddress || !price) {
            setError("provide all fields")
            return
        };

        if (!validateMintAddress(nftAddress)) {
            setError("invalid NFT address")
            return
        };

        try {
            setError(null)
            setLoading(true);
            const nftMint = new PublicKey(nftAddress);
            
            // Calculate PDA for listing
            const [listingPda] = await PublicKey.findProgramAddress(
                [Buffer.from("listing"), nftMint.toBuffer()],
                programId
            );
            
            // Calculate PDA for escrow
            const [escrowPda] = await PublicKey.findProgramAddress(
                [Buffer.from("escrow"), nftMint.toBuffer()],
                programId
            );
        
            const ownerNftAccount = await getAssociatedTokenAddress(new PublicKey(nftMint), publicKey);
            
            const tx = new Transaction(); 

            // Convert the price to lamports by multiplying by 10^9 and then use BN
            const priceInLamports = new BN(Math.round(price * 1e9)); 
            console.log(priceInLamports.toString()); // This will give you the price in lamports

            const instruction = await program.methods
                .createListing(
                    new BN(priceInLamports),
                )
                .accounts({
                    owner: publicKey,
                    listing: listingPda,
                    nftMint: nftMint,
                    escrowAccount: escrowPda,
                    ownerNftAccount: ownerNftAccount,  // ATA for NFT
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY
                })
                // .rpc();
                .instruction();

            tx.add(instruction);

            if (tx.instructions.length > 0) {
                tx.feePayer = publicKey;
                const { blockhash } = await connection.getLatestBlockhash('processed');
                tx.recentBlockhash = blockhash;

                const simulationResult = await connection.simulateTransaction(tx);
                if (simulationResult.value.err) {
                    const errorLogs = simulationResult.value.logs || [];
                    const errorMessage = errorLogs.find(log => log.includes("Error Message:")) || "No specific error message found.";
                    setError(errorMessage)        
                    return;
                } else {
                    console.log("Simulation successful.");
                }
            }
            
            const signature = await program.provider.sendAndConfirm(tx);
            console.log(signature);
            
            setListingTx("signature");
        } catch (err) {
            console.log(err);
            setError("Failed to create listing: " + err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const { isRegistryLoaded } = useActionsRegistryInterval();
    const { adapter } = useActionSolanaWalletAdapter('https://api.devnet.solana.com');

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-lg mx-auto border border-gray-100">
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded flex items-center">
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Create NFT Listing
            </h2>
            <div className="space-y-6">
            <input
                type="text"
                placeholder="NFT Address"
                className="w-full p-4 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
            />
            <input
                type="number"
                placeholder="Price (SOL)"
                className="w-full p-4 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
            <button
                onClick={createListing}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Processing...' : 'Create Listing'}
            </button>
            </div>

            {/* On Rental Listings */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">On Rental</h2>
                {onRental.map((rented, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-medium text-black">NFT: {rented.account.nftMint.toString()}</p>
                            <p className="font-medium text-black">Rented to: {rented.account.renter.toString()}</p>
                            <p className="text-gray-600">Price: {rented.account.price.toString()} SOL</p>    
                            <p className="text-gray-600">Current Date: {new Date().toDateString()}</p>    
                            <p className="text-gray-600">Start Date: {new Date(rented.account.rentalStart * 1000).toDateString()}</p>
                            <p className="text-gray-600">End Date: {new Date(rented.account.rentalEnd * 1000).toDateString()}</p>
                        </div>
                        </div>
                        <button
                            onClick={() => endRental(rented)}
                            disabled={loading}
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                            {loading ? 'Processing...' : 'End Rental'}
                        </button>
                    </div>
                ))}
                {onRental.length === 0 && !loading && (
                    <p className="text-gray-500 text-center">No listings available</p>
                )}
            </div>

            <div className="bg-white min-h-screen">
                {isRegistryLoaded ? <ManyActions adapter={adapter} /> : <p>Loading actions...</p>}
            </div> 

        </div>
    );
}

const ManyActions = ({ adapter }: { adapter: ActionAdapter }) => {
    
    const apiUrls = useMemo(() => ([
        'http://localhost:3000/api/actions/createListing',
    ]), []);
    
    const [actions, setActions] = useState<Action[]>([]);
    const {publicKey} = useWallet();

    useEffect(() => {
        const fetchActions = async () => {
        
            const fetchedActions = [];
            try {
            
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
            } catch (error) {
            console.error("Error retrieving NFT listings: ", error);
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