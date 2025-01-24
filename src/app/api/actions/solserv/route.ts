import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    createActionHeaders,
  } from '@solana/actions';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import IDL from '../../../../utils/solservprogram.json'
import * as anchor from '@coral-xyz/anchor';
import crypto from 'crypto' 
  
const headers = createActionHeaders();

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD, THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async (req: Request) => {
    return new Response(null, { headers });
};

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const nftMint: string = requestUrl.searchParams.get('nftMint'); // Get nftAddress from URL
        const price: string = requestUrl.searchParams.get('price'); // Get nftAddress from URL
        const isRented: string = requestUrl.searchParams.get('isRented'); // Get nftAddress from URL

        const params = new URLSearchParams({
            nftMint: nftMint,
            price: price, 
            isRented: isRented
        });
        const baseHref = new URL(`/api/actions/solserv?${params}`, requestUrl.origin,).toString();
        
        // const nftPublicKey = new PublicKey(nftMint);
        
        // TODO: validate the image link first

        const metadata = {
            name: "rishi",
            description: "rishi", 
            image: "https://s3.ap-south-1.amazonaws.com/mynfttestbucket/TS8TFwQCIeMOGECeu8v8", 
        }

        const payload: ActionGetResponse = {
            type: 'action',
            title: `${metadata.name}`,
            icon: `${metadata.image}`,
            description: `${metadata.description}, Price: ${price}, Already Rented: ${Boolean(isRented)}`,
            label: 'Transfer',  // will be ignored but needs to be here
            disabled: Boolean(isRented),
            links: {
                actions: [
                    {
                        label: 'Rent', // button text
                        href: `${baseHref}&from_date={from_date}&to_date={to_date}`, // this href will have a text input
                        parameters: [
                            {
                                name: 'from_date', // parameter name in the `href` above
                                label: 'select date', // placeholder of the text input
                                required: true,
                                type: 'date',
                            },
                            {
                                name: 'to_date', // parameter name in the `href` above
                                label: 'select date', // placeholder of the text input
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
  
      const body: ActionPostRequest = await req.json();
      let account: PublicKey;
      try {
          account = new PublicKey(body.account);
      } catch (err) {
          return new Response('Invalid "account" provided', {
              status: 400,
              headers,
          });
      }
          
      let transaction: Transaction;
      // Calling Smart contracts For Rent Logic
      try{
          
          const connection = new Connection("https://api.devnet.solana.com", "confirmed");
          const PROGRAM_ID = new PublicKey(IDL.address);
          
      }catch(error){
          console.log(error);
      }
          
  
      const payload: ActionPostResponse = await createPostResponse({
          fields: {
              transaction: transaction,
              message: `Sent`,
              type: "transaction"
          },
      })
      
      // TODO: see if this is alright
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