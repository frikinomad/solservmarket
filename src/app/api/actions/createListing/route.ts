import idl from '../../../../utils/solservprogram.json'
import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    createActionHeaders,
  } from '@solana/actions';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAccount, getAssociatedTokenAddress, getAssociatedTokenAddressSync, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, BN, Idl, Program, Wallet } from '@coral-xyz/anchor';

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD, THIS WILL ENSURE CORS WORKS FOR BLINKS
const headers = createActionHeaders();
export const OPTIONS = async (req: Request) => {
    return new Response(null, { headers });
};


export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const publicKey: string = requestUrl.searchParams.get('publicKey'); // Get nftAddress from URL

        const baseHref = new URL(`/api/actions/createListing?publicKey=${publicKey}`, requestUrl.origin,).toString();
        
        const payload: ActionGetResponse = {
            type: 'action',
            title: 'Create Listing',
            icon: 'https://play-lh.googleusercontent.com/eGZyT2QXznxa00g94a7b-CyX1D-1K9qEMAbJZ-f6Hkovj4WnKdujsVsV3A_an2IJsbE',
            description: `Provide Price in SOL & NFT mint address to be Listed`,
            label: 'Transfer',  // will be ignored but needs to be here
            links: {
                actions: [
                    {
                        label: 'List', // button text
                        href: `${baseHref}&price={price}&nftMint={nftMint}`, // this href will have a text input
                        parameters: [
                            {
                                name: 'price', // parameter name in the `href` above
                                label: 'Price(SOL) per day', // placeholder of the text input
                                required: true,
                                type: 'number'
                            },
                            {
                                name: 'nftMint', // parameter name in the `href` above
                                label: 'NFT Address', // placeholder of the text input
                                required: true,
                                type: 'text',
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

const validateMintAddress = (mintAddress) => {
    try {
        const publicKey = new PublicKey(mintAddress); // Try creating a PublicKey instance
        return publicKey.toString().length === 44; // Valid Solana addresses are 44 characters long
    } catch (error) {
        return false; // If an error occurs, it's not a valid Solana address
    }
};

export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        
        
        // Extract the query string part from the URL
        const url = new URL(requestUrl);
        const urlParams = new URLSearchParams(url.search); // Using .search to get query parameters
        
        // Extracting the values
        const nftAddress = urlParams.get("nftMint");
        const receivedPublicKey = urlParams.get('publicKey');
        const publicKey = new PublicKey(receivedPublicKey);
        const receivedPrice = urlParams.get("price");
        // TODO: IMP
        const price = parseFloat(receivedPrice) * 1e9; // Multiply by 10^9 for Solana (converting SOL to lamports)
        // console.log((new BN(price)).toString());
        

        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const programId = new PublicKey('Bc5CiKaQJm8hjcDoJGgJiScfQMr1DQvoWf2Z3NMxFzxV'); // Program ID    

        const provider = new AnchorProvider(
            connection,
            {} as Wallet,
            { commitment: 'processed' }
        );
        const program = new Program(idl as Idl, provider);

        if (!validateMintAddress(nftAddress)) {
            return Response.json("Error: Invalid NFT mint Address", {
                headers,
            });
        };

        
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

        const instruction = await program.methods
            .createListing(
                new BN(price),
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
                console.log(errorLogs);
                console.log(errorMessage);
            } else {
                console.log("Simulation successful.");
            }
        }

    
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction: tx,
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