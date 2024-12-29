
import React from 'react';

export function CompanySlider() {
  const companies = [
    'Meta',
    'Google',
    'Amazon',
    'Microsoft',
    'Apple',
    'Netflix',
    'Spotify',
    'Twitter',
    'LinkedIn',
    'Adobe'
  ];

  return (
    <div className="company-slider relative overflow-hidden bg-white py-6">
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll">
          {companies.map((company) => (
            <li key={company} className="flex-none">
              <span className="text-gray-900/80 hover:text-gray-900 transition-colors duration-200 text-2xl font-light whitespace-nowrap">
                {company}
              </span>
            </li>
          ))}
        </ul>
        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll" aria-hidden="true">
          {companies.map((company) => (
            <li key={company} className="flex-none">
              <span className="text-gray-900/80 hover:text-gray-900 transition-colors duration-200 text-2xl font-light whitespace-nowrap">
                {company}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
