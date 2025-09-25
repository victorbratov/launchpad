import React from 'react';

/**
 * Basic card component to display pitch information
 * @param title Title of the pitch
 * @param elevatorPitch Short description of the pitch
 * @param targetFunding Target funding amount
 * @param currentFunding Current funding amount
 * @param profitShare Profit share percentage
 * @returns Card component
 */
function Card({title, elevatorPitch, targetFunding, currentFunding, profitShare}: {title: string, elevatorPitch: string, targetFunding: number, currentFunding: number, profitShare: number}) {
  return (
    <div className="flex flex-col max-w-sm h-full p-6 bg-gray-800 border border-gray-700 rounded-lg shadow">
      <div className="flex-1">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</h5>
        <p className="mb-3 font-normal text-gray-300">{elevatorPitch}</p>
        <p className="mb-3 font-normal text-gray-300">Funding Progress: £{currentFunding}/£{targetFunding}</p>
        
        <p className="mb-3 font-normal text-gray-300">Profit Share: {profitShare}%</p>
      </div>
      <button className="py-2 text-sm text-center text-white bg-green-700 rounded-lg hover:bg-green-800">
        View Details
        </button>
    </div>
  );
}

export default Card;