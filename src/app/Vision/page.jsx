import React from 'react';
import { Wallet, GamepadIcon, Building2, Rocket, Brain, Newspaper, Code, Lock, Share2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto p-8">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold">SolServ</h1>
          </div>
          <p className="text-xl text-indigo-200">Reimagining the Internet as a Universal Marketplace</p>
        </header>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Grand Vision</h2>
          <p className="text-lg text-indigo-200">We're not just building a rental platform – we're reimagining the entire internet as a seamless marketplace where everything is transactable. Think bigger: every UI, every social interaction, every piece of content becomes a potential point of value exchange.</p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Future of the Web</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Wallet className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">Beyond Platforms</h3>
              </div>
              <p className="text-indigo-200 mb-4">Today's internet is fragmented into platforms: Amazon for shopping, Facebook for social, Airbnb for rentals. Tomorrow's web breaks these barriers through a unified fediverse where:</p>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Every interface becomes a marketplace</li>
                <li>Content, goods, and services flow freely across a decentralized social fabric</li>
                <li>AI indexes and surfaces assets from across the web</li>
                <li>You don't need separate accounts or platforms – just a wallet and social presence</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <GamepadIcon className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">The Gaming Revolution</h3>
              </div>
              <p className="text-indigo-200 mb-4">Picture this scenario: You're watching your favorite streamer use an exclusive in-game skin. Instead of just admiring it:</p>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>You spot the skin and send a quick tweet asking to rent it</li>
                <li>The streamer responds with a blink</li>
                <li>One click later, you've rented the skin for the weekend</li>
                <li>The NFT is automatically delegated to your game account</li>
                <li>You're using the skin in your next match</li>
                <li>The streamer earns passive income</li>
                <li>Everything resolves automatically when the rental period ends</li>
                <li>No platforms, no paperwork, no trust required</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                    <Newspaper className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">The Article Revolution</h3>
                </div>
                <p className="text-indigo-200 mb-4">Imagine the Wall Street Journal publishing an article. Instead of traditional paywalls:</p>
                <ul className="list-disc list-inside text-indigo-200 space-y-2">
                    <li>The article itself becomes an asset on the fediverse</li>
                    <li>Readers subscribe directly through a blink, without leaving their preferred platform</li>
                    <li>The Publishing company directly gets the Amount</li>
                    <li>A "Blog NFT" appears in their wallet, automatically unfurling the full content</li>
                    <li>No separate subscriptions, no platform switching – just X (or any fediverse platform) and a Solana wallet</li>
                    <li>Content verification and creator compensation happen automatically through the blockchain</li>
                </ul>
            </div>

          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Core Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Share2 className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">Blinks: The Universal Transaction Layer</h3>
              </div>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Seamless integration with any interface</li>
                <li>Social-first transaction design</li>
                <li>Built-in trust mechanisms through staking</li>
                <li>Automated rental lifecycle management</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">Smart Contract Architecture</h3>
              </div>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Trustless escrow system</li>
                <li>Stake-based security</li>
                <li>Automated dispute resolution</li>
                <li>Transparent transaction history</li>
                <li>Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Ecosystem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">For Users</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Rent anything, anywhere, anytime</li>
                <li>No platform lock-in</li>
                <li>Social-based trust system</li>
                <li>Seamless value exchange</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">For Creators</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Monetize directly through social presence</li>
                <li>Create new rental markets</li>
                <li>Build community-driven marketplaces</li>
                <li>Enable flexible access models</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">Real-World Integration</h3>
              </div>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Property rentals through social verification</li>
                <li>Equipment sharing within communities</li>
                <li>Vehicle access through smart contracts</li>
                <li>Temporary access to exclusive spaces</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Brain className="w-8 h-8 mr-4" />
            <h2 className="text-3xl font-bold">Web3 + Social + AI</h2>
          </div>
          <div className="bg-indigo-800/50 p-6 rounded-lg mb-8">
            <ul className="list-disc list-inside text-indigo-200 space-y-2">
              <li>AI indexes and surfaces rental opportunities</li>
              <li>Social graphs drive trust and discovery</li>
              <li>Blockchain ensures trustless transactions</li>
              <li>Every tweet could be a storefront</li>
              <li>Every post could be a rental opportunity</li>
              <li>Every interaction could generate value</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Rocket className="w-8 h-8 mr-4" />
            <h2 className="text-3xl font-bold">Roadmap to Reality</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Phase 1: Foundation (Current)</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Core rental protocol</li>
                <li>Social media integration</li>
                <li>Gaming and digital assets</li>
              </ul>
            </div>
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Phase 2: Expansion</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>AI-powered discovery</li>
                <li>Cross-platform integration</li>
                <li>Physical asset integration</li>
              </ul>
            </div>
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Phase 3: Universal Access</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Global marketplace indexing</li>
                <li>Automated market making</li>
                <li>Universal commerce layer</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Code className="w-8 h-8 mr-4" />
            <h2 className="text-3xl font-bold">Technical Roadmap & Implementation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Current MVP</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Core NFT rental functionality</li>
                <li>Basic listing and renting capabilities</li>
                <li>Escrow system for secure transactions</li>
                <li>Initial blink integration</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Release 2: Enhanced Functionality</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Blink-based rental management</li>
                <li>Category-specific NFT handling</li>
                <li>Advanced metadata verification</li>
                <li>Automated rental period management</li>
                <li>Multi-property listing support</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Release 3: Advanced Features</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Reclaim protocol integration for Proof</li>
                <li>Multi-token payment support</li>
                <li>Enhanced dispute resolution</li>
                <li>Advanced listing management</li>
              </ul>
            </div>

            <div className="bg-indigo-800/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Future Considerations</h3>
              <ul className="list-disc list-inside text-indigo-200 space-y-2">
                <li>Cross-chain compatibility</li>
                <li>Advanced dispute resolution chatrooms</li>
                <li>Proof of Investment verification</li>
                <li>Platform fee structures</li>
                <li>Global rental marketplace analytics</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;