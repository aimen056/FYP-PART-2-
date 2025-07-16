const breakpoints = require('./aqiBreakpoints');

function calculateIndex(Cp, pollutant) {
  const bps = breakpoints[pollutant];//get the breakpoints for the pollutant

  for (let bp of bps) {
    if (Cp >= bp.CpLow && Cp <= bp.CpHigh) {//check if concentration of the pollutant is in the range of the breakpoint
      const { CpLow, CpHigh, Ilow, Ihigh } = bp;//pull values
      const aqi = ((Ihigh - Ilow) / (CpHigh - CpLow)) * (Cp - CpLow) + Ilow;
      return Math.round(aqi);
    }
  }

  return -1; // not in range
}

module.exports = { calculateIndex };