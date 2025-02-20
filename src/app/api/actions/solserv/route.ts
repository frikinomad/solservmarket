import idl from '../../../../utils/solservprogram.json'
import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    createActionHeaders,
  } from '@solana/actions';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAccount, getAssociatedTokenAddressSync, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, BN, Idl, Program, Wallet } from '@coral-xyz/anchor';

import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { mplCore, fetchAsset } from '@metaplex-foundation/mpl-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mockStorage } from '@metaplex-foundation/umi-storage-mock';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'


// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD, THIS WILL ENSURE CORS WORKS FOR BLINKS
const headers = createActionHeaders();
export const OPTIONS = async (req: Request) => {
    req
    return new Response(null, { headers });
};


export const GET = async (req: Request) => {

    
    try {
        const requestUrl = new URL(req.url);
        const nftMint: string = requestUrl.searchParams.get('nftMint'); // Get nftAddress from URL
        const price: string = requestUrl.searchParams.get('price'); // Get nftAddress from URL
        const isRented: string = requestUrl.searchParams.get('isRented'); // Get nftAddress from URL
        const buyerKey: string = requestUrl.searchParams.get('buyerKey'); // Get nftAddress from URL
        
        // causing storing in lamports
        const priceInSol = parseFloat(price) / 1e9;

        const params = new URLSearchParams({
            nftMint: nftMint,
            price: price,           // send price as it is, cause need it like that, to SOL conversion is just for user 
            isRented: isRented,
            buyerKey: buyerKey
        });
        const baseHref = new URL(`/api/actions/solserv?${params}`, requestUrl.origin,).toString();
        
        
        // Fetch NFT metadata, also validate the image link first

        // NFT core for testing
        // const nftMintKey = fromWeb3JsPublicKey(new PublicKey("2JnmvdtU9yvBPakevLVAQAKj5JGcG55nkAGmpmePVfjq"))
        const nftMintKey = fromWeb3JsPublicKey(new PublicKey(nftMint))
        const umi = createUmi('https://api.devnet.solana.com/'); 
        umi.use(mockStorage());
        umi.use(mplTokenMetadata());
        umi.use(mplCore());
        
        let assetMetadata;
        try {
            const asset = await fetchDigitalAsset(umi, nftMintKey);
            // just getting the metadata cause core only returns the Metadata
            assetMetadata = asset.metadata;
        } catch (error) {
            try {
                assetMetadata = await fetchAsset(umi, nftMintKey);
            } catch (err) {
                console.error("Failed to fetch asset metadata:", err);
                return null;
                // TODO: shouldn't be null
            }
        }
        
        const metadata = {
            name: assetMetadata.name,
            image: assetMetadata.uri, 
            // image: "https://s3.ap-south-1.amazonaws.com/mynfttestbucket/TS8TFwQCIeMOGECeu8v8", 
        }

        // const metadata = {
        //     name: "rishi",
        //     description: "rishi", 
        //     image: "https://s3.ap-south-1.amazonaws.com/mynfttestbucket/TS8TFwQCIeMOGECeu8v8", 
        // }


        const payload: ActionGetResponse = {
            type: 'action',
            title: `${metadata.name}`,
            icon: `${metadata.image}`,
            description: `Price per day: ${priceInSol}SOL.  NFT Mint: ${nftMint}`,
            label: 'Transfer',  // will be ignored but needs to be here
            disabled: isRented === "true",
            links: {
                actions: [
                    {
                        label: 'Rent', // button text
                        href: `${baseHref}&from_date={from_date}&to_date={to_date}`, // this href will have a text input
                        parameters: [
                            {
                                name: 'from_date', // parameter name in the `href` above
                                label: 'start date', // placeholder of the text input
                                required: true,
                                type: 'date',
                            },
                            {
                                name: 'to_date', // parameter name in the `href` above
                                label: 'end date', // placeholder of the text input
                                required: true,
                                type: 'date',
                            },
                        ],
                        type: 'transaction'
                    }
                ],
            },
        }
      
        return Response.json(payload, {
            headers,
        });
    } catch (err) {
        console.log(err);
        let message = 'An unknown error occurred';
        if (typeof err == 'string') message = err;
        return new Response(message, {
            status: 400,
            headers,
        });
    }
}


export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        // Extract the query string part from the URL
        const url = new URL(requestUrl);
        const urlParams = new URLSearchParams(url.search); // Using .search to get query parameters
        
        // Extracting the values
        const nftMint = urlParams.get("nftMint");
        const price = urlParams.get("price");
        const isRented = urlParams.get("isRented");
        const buyerKey = urlParams.get("buyerKey");
        const fromDate = urlParams.get("from_date");
        const toDate = urlParams.get("to_date");

        
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const programId = new PublicKey('Bc5CiKaQJm8hjcDoJGgJiScfQMr1DQvoWf2Z3NMxFzxV'); // Program ID
        const walletKey = new PublicKey(buyerKey);
        const nftAddress = new PublicKey(nftMint);
        
        // Convert the date strings to Date objects
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        // Convert dates to timestamps
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
        
        // Create transaction
        const transaction = new Transaction();
        
        const provider = new AnchorProvider(
            connection,
            {} as Wallet,
            { commitment: 'processed' }
        );
        const program = new Program(idl as Idl, provider);
        

        // Calculate PDA for listing
        const [listingPda] = await PublicKey.findProgramAddress(
            [Buffer.from("listing"), nftAddress.toBuffer()],
            programId
        );

        // Escrow PDA for NFT holding
        const [escrowPda] = await PublicKey.findProgramAddress(
            [Buffer.from("escrow"), nftAddress.toBuffer()],
            programId
        );
    
        // User WSOL Associated Token Account (ATA)
        const userWSOLAccount = getAssociatedTokenAddressSync(
            NATIVE_MINT,
            walletKey
        );
        // Ensure WSOL ATA exists
        try {
            await getAccount(program.provider.connection, userWSOLAccount);
        } catch {
            const createAtaIx = createAssociatedTokenAccountInstruction(
                walletKey,
                userWSOLAccount,
                walletKey,
                NATIVE_MINT
            );
            transaction.add(createAtaIx);
        }
    
        // Escrow payment ATA
        const escrowPaymentAccount = getAssociatedTokenAddressSync(
            NATIVE_MINT,
            escrowPda,
            true
        );
        // Ensure escrow payment ATA exists
        try {
            await getAccount(program.provider.connection, escrowPaymentAccount);
        } catch {
            const createEscrowAtaIx = createAssociatedTokenAccountInstruction(
                walletKey,
                escrowPaymentAccount,
                escrowPda,
                NATIVE_MINT
            );
            transaction.add(createEscrowAtaIx);
        }

        
        // Transfer SOL to WSOL ATA if balance is insufficient        
        // Always transfer SOL and sync - the sync will fail if no transfer was needed
        
        // TODO: days was a crucial step that I was missing
        const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

        // Removed check balance cause if first time then will give error
        // const balance = await connection.getTokenAccountBalance(userWSOLAccount);        
        // if ((balance.value.uiAmount || 0) < (parseFloat(price)/LAMPORTS_PER_SOL) || (balance.value.uiAmount < 2)) {
            const transferIx = SystemProgram.transfer({
                fromPubkey: walletKey,
                toPubkey: userWSOLAccount,
                lamports: (days * Number(price))
            });
            transaction.add(transferIx);
        
            const syncNativeIx = createSyncNativeInstruction(userWSOLAccount);
            transaction.add(syncNativeIx);
        // }
        

        
        const instruction = await program.methods
            .rentNft(
                new BN(startTimestamp),
                new BN(endTimestamp)
            )
            .accounts({
                renter: buyerKey,
                listing: listingPda,
                renterWsolAccount: userWSOLAccount,
                escrowAccount: escrowPda,
                escrowPaymentAccount: escrowPaymentAccount,
                wsolMint: NATIVE_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram : ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();
    
        transaction.add(instruction);
    
        // Sync native instruction for escrow
        const syncNativeEscrowIx = createSyncNativeInstruction(escrowPaymentAccount);
        transaction.add(syncNativeEscrowIx);
    
        transaction.feePayer = walletKey;
        const { blockhash } = await connection.getLatestBlockhash('processed');
        transaction.recentBlockhash = blockhash;

        const simulationResult = await connection.simulateTransaction(transaction);
        if (simulationResult.value.err) {
            // const errorLogs = simulationResult.value.logs || [];
            // const errorMessage = errorLogs.find(log => log.includes("Error Message:")) || "No specific error message found."; 
            // console.log("errorMessage", errorMessage)
            console.error("Simulation failed:", simulationResult.value.err);
            console.log("Simulation logs:", simulationResult.value.logs); // More detailed logs
        } else {
            console.log("Simulation successful.");
        }
    
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction: transaction,
                message: `Sent`,
                type: "transaction"
            },
        })
        
        return Response.json(payload, {
            headers,
        });

    } catch (err) {
        console.log(err);
        let message = 'An unknown error occurred';
        if (typeof err == 'string') message = err;
            return new Response(message, {
            status: 400,
            headers,
        });
    }
};