'use client';

import React, { useState, useMemo, useEffect, act } from "react";
import '@dialectlabs/blinks/index.css';
import { Action, Blink, type ActionAdapter, useActionsRegistryInterval, MultiValueActionComponent} from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, setProvider, Idl } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from '../utils/solservprogram.json'
import { Copy, ExternalLink } from 'lucide-react';

const Home = () => {
  const { isRegistryLoaded } = useActionsRegistryInterval();
  const { adapter } = useActionSolanaWalletAdapter('https://api.devnet.solana.com');

  return (
    <div className="bg-white min-h-screen">
      {isRegistryLoaded ? <ManyActions adapter={adapter} /> : <p>Loading actions...</p>}
    </div> 
  );
};

const ManyActions = ({ adapter }: { adapter: ActionAdapter }) => {
  
  const apiUrls = useMemo(() => ([
    'http://localhost:3000/api/actions/solserv',
  ]), []);
  
  const [actions, setActions] = useState<Action[]>([]);
  const [program, setProgram] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const wallet = useWallet();
  const {publicKey} = useWallet();

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  useEffect(() => {
    if(wallet.connected){
      initializeProgram();
    }
  }, [publicKey]);

  const initializeProgram = async () => {
    try {
      const provider = new AnchorProvider(
          connection,
          wallet,
          { commitment: 'processed' }
      );
      setProvider(provider);
      
      // You'll need to import your IDL
      const program = new Program(idl as Idl, provider);
      setProgram(program);
    } catch (err) {
      setError("Failed to initialize program: " + err.message);
    }
  };

  useEffect(() => {
    const fetchActions = async () => {

      const fetchedActions = [];
      try {
        const accounts = await program.account.listingData.all();
        
        setListings(accounts);

        for (const account of accounts) { 
          for (const url of apiUrls) {
            const modifiedUrl = new URL(url);
            modifiedUrl.searchParams.append('nftMint', account.account.nftMint);
            modifiedUrl.searchParams.append('price', account.account.price);
            modifiedUrl.searchParams.append('isRented', account.account.isRented);
  
            try {
              const action = await Action.fetch(modifiedUrl.toString());
              
              fetchedActions.push(action);
            } catch (error) {
              console.error("Error fetching action:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error retrieving NFT listings: ", error);
      }      
      
      setActions(fetchedActions);
    }
    if(program) fetchActions();
  }, [apiUrls, program]);


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
        action={action}
        websiteText={websiteText}
        adapter={adapter}
        securityLevel="non-malicious"
      />
    </div>
  );
};

export default Home;