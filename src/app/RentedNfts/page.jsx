'use client';

import React, { useEffect, useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, 
    NATIVE_MINT, getAssociatedTokenAddressSync,
 } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, setProvider, BN } from "@coral-xyz/anchor";
import idl from '../utils/solservprogram.json'


const RentedNfts = () => {

    const {publicKey, wallet } = useWallet();
    const {connection} = useConnection();
    const [rented, setRented] = useState([]);
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

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
            console.error("Simulation failed with error:");
        
            // Log the error code dynamically if available
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
        }

        const signature = await program.provider.sendAndConfirm(transaction);
        console.log(signature);

    }

    return (
        <>
            {/* Rented Listings */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Rented</h2>
                {rented.map((rented, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-medium text-black">NFT: {rented.account.nftMint.toString()}</p>
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
                {rented.length === 0 && !loading && (
                    <p className="text-gray-500 text-center">No listings available</p>
                )}
            </div>
        </>
    );
}

export default RentedNfts;