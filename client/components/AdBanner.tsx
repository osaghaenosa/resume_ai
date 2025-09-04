import AdsterraBanner from './AdsterraBanner';

import React from 'react';

export default function AdBanner() {
    return (
        <div className="bg-[#111827] p-4 rounded-lg shadow-lg text-center">
          {/* Show Adsterra Banner */}
      <AdsterraBanner />
            <span className="text-xs text-gray-500">ADVERTISEMENT</span>
            <div className="mt-2">
                <img 
                    src="https://picsum.photos/seed/adbanner/300/250" 
                    alt="Advertisement"
                    className="w-full rounded"
                />
            </div>
            <h4 className="mt-3 font-bold text-white">Upgrade Your Skills</h4>
            <p className="text-sm text-gray-400 mt-1">Check out this amazing course on career development.</p>
            <a href="#" className="mt-3 inline-block text-cyan-400 text-sm font-semibold hover:underline">Learn More &rarr;</a>
        </div>
    );
}
