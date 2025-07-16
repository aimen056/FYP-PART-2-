import React from 'react';
import './Ticker.css';

const Ticker = ({ message }) => {
  const repeatedText = Array(5).fill(message).join(" ✦ "); // Enough to fill the width fully

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        <div className="ticker-content">{repeatedText}</div>
        <div className="ticker-content">{repeatedText}</div>
      </div>
    </div>
  );
};

export default Ticker;
{/* <Ticker message="🔥 System update: Version 2.0 now live! Stay safe & check your AQI levels regularly." /> */}
