
import React, { useState, useEffect } from 'react';
import { findDealershipLocations } from '../geminiService';

const AboutPage: React.FC = () => {
  const [locationsData, setLocationsData] = useState<{ text: string; sources: any[] } | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  useEffect(() => {
    const loadMapData = async () => {
      setIsLoadingMap(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const data = await findDealershipLocations(position.coords.latitude, position.coords.longitude);
          setLocationsData(data);
          setIsLoadingMap(false);
        }, () => {
          setIsLoadingMap(false);
        });
      } else {
        setIsLoadingMap(false);
      }
    };
    loadMapData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
        <div className="space-y-8">
          <div className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest">Our Legacy</div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight text-primary dark:text-white">
            Driven by Passion, <br /> Built on Trust.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Founded in 2012, OldRoad Auto started as a small boutique collection of vintage sedans. Today, we are Canada's premier destination for high-end pre-owned vehicles and innovative trade-in solutions.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <p className="text-4xl font-bold text-accent">12+</p>
              <p className="text-slate-500 font-medium">Years in Business</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">5k+</p>
              <p className="text-slate-500 font-medium">Vehicles Sold</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://picsum.photos/seed/showroom-about/1000/1250" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-12 -left-12 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-xs">
            <p className="text-slate-600 dark:text-slate-400 italic">"We don't just sell cars; we sell the freedom of the open road."</p>
            <p className="font-bold mt-4">— Marcus Thorne, Founder</p>
          </div>
        </div>
      </div>

      {/* Locations & Maps Section */}
      <section className="mb-32 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif font-bold">Find Us Near You</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">We are strategically located across the country to serve your oldroad auto needs.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          {isLoadingMap ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-accent"></i>
              <p className="text-slate-500 animate-pulse font-medium">Finding nearby showrooms...</p>
            </div>
          ) : locationsData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                  {locationsData.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                {locationsData.sources.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {locationsData.sources.map((chunk: any, i: number) => (
                        chunk.maps && (
                          <a 
                            key={i} 
                            href={chunk.maps.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors border border-slate-100 dark:border-slate-700"
                          >
                            <i className="fa-solid fa-location-dot"></i>
                            {chunk.maps.title || 'View on Maps'}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-96">
                {/* Mock Map View since we can't render a real Google Map iframe without API Key, but we provide the links above */}
                <img src="https://picsum.photos/seed/mapview/800/600" className="w-full h-full object-cover opacity-50 grayscale" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-2xl max-w-xs">
                      <i className="fa-solid fa-map-marked-alt text-4xl text-accent mb-4"></i>
                      <p className="font-bold text-sm mb-2">Interactive Map Links Ready</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Please use the verified location links provided by our AI assistant to navigate.</p>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400 italic">
              Enable location access to find showrooms near you.
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary text-white rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Innovation</h3>
            <p className="text-slate-400">Our proprietary AI-powered VIN decoding and valuation system puts the power in your hands.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Transparency</h3>
            <p className="text-slate-400">Every vehicle in our inventory features a complete Carfax report and a certified 150-point inspection.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Community</h3>
            <p className="text-slate-400">We believe in building long-term relationships with our clients, offering ongoing service and support.</p>
          </div>
        </div>
        <i className="fa-solid fa-car-side absolute bottom-0 right-0 text-[20rem] text-white/5 translate-y-1/2 translate-x-1/4"></i>
      </section>
    </div>
  );
};

export default AboutPage;
