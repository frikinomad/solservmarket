import { ArrowRight } from 'lucide-react';

const HomePage = () => {

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900">
      {/* Background Animation */}

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full glow"
            style={{
              width: '4px',
              height: '4px',
              background: 'white',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8">
              Digital World
              <span className="block mt-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-12">
              Experience the future of digital assets and blockchain technology
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <a href="/Rent" className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-all">
                <span className="flex items-center justify-center text-lg font-bold text-white">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <a href="/Vision" className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-all">
                <span className="flex items-center justify-center text-lg font-bold text-white">
                  Vision
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all">
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-lg text-purple-100">
                We're building the world's first social-native rental protocol that eliminates platform barriers and complex processes, enabling anyone to rent digital assets instantly through a tweet or click. Starting with gaming assets, we're creating a future where accessing valuable content and items is as simple as sending a message, all while empowering creators to earn from their assets seamlessly.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all">
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-lg text-purple-100">
                To transform the internet into a unified, frictionless marketplace where every digital interaction becomes an opportunity for value exchange, making any asset instantly accessible through simple social connections.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Secure Trading",
                description: "Advanced blockchain security for your digital assets"
              },
              {
                title: "Easy Access",
                description: "Simple and intuitive platform for everyone"
              },
              {
                title: "Fast Transactions",
                description: "Lightning-quick processing of all operations"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all"
              >
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Showcase Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80"
                alt="Digital Art Showcase"
                className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Discover Amazing Art
                </h2>
                <p className="text-white/80">
                  Explore unique digital creations from talented artists
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative py-12 mt-20 bg-black/20 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-purple-200">
                Creating the future of digital ownership
              </div>
              <div className="text-purple-300 text-sm">
                © {new Date().getFullYear()} SolServ. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default HomePage;