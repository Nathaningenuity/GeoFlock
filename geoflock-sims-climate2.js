/* GeoFlock: a small climate model you can run (replaces the old "How much warmer does more CO₂ make the Earth?").
   Three tabs:
     1850 → today   the real push on the climate since 1850 (CO₂, other gases, the haze of air pollution, volcanoes and the
                    Sun) runs a two-layer ocean model; its warming is drawn over the measured one. Each push can be switched
                    off, the climate sensitivity changed, and the line replayed year by year.
     Your future    emissions from 2025 to 2100 (keep growing, flat, net zero by a year you pick) go into a carbon-cycle model
                    that sets CO₂; the same climate model gives the warming, with the haze fading as coal and oil are burnt less
                    (or kept, to compare).
     Sea level      sea level from the warming (a semi-empirical rule), against the measured rise since 1900.
   The model:
     Two-layer energy balance (Held et al. 2010; Geoffroy et al. 2013): C dT/dt = F − λT − εγ(T − Td), Cd dTd/dt = γ(T − Td),
     with C = 8 and Cd = 100 W yr m⁻² K⁻¹, γ = 0.9 W m⁻² K⁻¹, ocean heat uptake efficacy ε = 1.3, and λ = 3.93/S, where S is
     the equilibrium climate sensitivity (AR6 best estimate 3 °C; 3.93 W m⁻² is AR6's forcing for doubled CO₂). Started from a
     steady state under the mean push of 1850–1899; warming is given against 1850–1900, as in IPCC reports. With S = 3 it
     gives +1.20 °C for 2014–2023; HadCRUT5 measures +1.21 °C.
     Carbon cycle (future only): the Joos et al. 2013 impulse response (four pools that keep 21.7% of a pulse for good and lose
     the rest over 394, 36.5 and 4.3 years). Fed every year's emissions since 1850 it would overshoot today's CO₂, so its pools
     are scaled to the measured 2024 level and only future emissions go in as they are; 2.124 GtC = 1 ppm.
     CO₂'s push from its level: scaled from AR6's 2024 value with the logarithm of CO₂. Other gases follow emissions
     part-way (30% stays: nitrous oxide and long-lived gases), the haze follows fossil fuel burning (a quarter of it, from fires and farming, stays); volcanoes and the Sun are held at their 1850–1899 average.
     Sea level: dH/dt = a(T − T₀) (Rahmstorf 2007), T₀ = −0.22 °C against 1850–1900, a = 3.1 mm a year per °C (3.4 in the
     paper; 3.1 matches the measured 1900–2018 rise with HadCRUT5).
   Data (one value a year, 1850–2024): temperature HadCRUT5.0.2.0 (Met Office, Open Government Licence), re-based to
   1850–1900; CO₂ and effective radiative forcing from the Indicators of Global Climate Change update of AR6 Annex III
   (Forster et al. 2024, CC BY 4.0); emissions from the Global Carbon Budget via Our World in Data (CC BY 4.0). Sea level
   Frederikse et al. 2020, Nature 584, 393 (values every ten years). */
(function(){
"use strict";
const H={T:[-0.06,0.12,0.13,0.09,0.06,0.06,0.04,-0.11,-0.03,0.08,-0.03,-0.07,-0.18,0.01,-0.11,0.02,0.02,0,0,0.04,0.03,-0.01,0.03,0.02,-0.02,-0.02,-0.07,0.26,0.35,0.05,0.04,0.12,0.06,0.01,-0.14,-0.11,-0.06,-0.14,-0.02,0.11,-0.15,-0.04,-0.15,-0.14,-0.13,-0.09,0.07,0.1,-0.13,0,0.12,0.06,-0.08,-0.18,-0.24,-0.05,0.04,-0.15,-0.16,-0.18,-0.17,-0.18,-0.12,-0.11,0.09,0.16,-0.06,-0.19,-0.07,0.03,0.06,0.12,0.02,0.04,0.04,0.07,0.23,0.13,0.15,-0.04,0.18,0.25,0.21,0.03,0.18,0.15,0.19,0.34,0.34,0.32,0.43,0.39,0.36,0.36,0.5,0.4,0.24,0.27,0.23,0.21,0.13,0.3,0.37,0.43,0.24,0.16,0.09,0.32,0.34,0.31,0.24,0.34,0.29,0.32,0.05,0.15,0.21,0.24,0.19,0.33,0.27,0.15,0.26,0.41,0.18,0.25,0.14,0.46,0.36,0.45,0.55,0.61,0.39,0.58,0.4,0.41,0.45,0.6,0.64,0.54,0.72,0.7,0.48,0.52,0.59,0.73,0.63,0.78,0.93,0.68,0.69,0.85,0.9,0.9,0.82,0.96,0.93,0.95,0.82,0.95,1.04,0.89,0.93,0.98,1.03,1.18,1.29,1.2,1.12,1.25,1.28,1.12,1.16,1.46,1.54],CO2ppm:[285.6,285.7,285.8,286,286.1,286.2,286.3,286.4,286.6,286.7,286.9,287.1,287.3,287.4,287.6,287.7,287.9,288.1,288.2,288.3,288.4,288.6,288.7,288.9,289.1,289.3,289.6,289.8,290,290.2,290.5,290.7,291,291.2,291.5,291.7,292,292.3,292.7,293,293.4,293.7,294.1,294.4,294.7,294.9,295.2,295.5,295.8,296.1,296.5,296.8,297.1,297.4,297.7,298.1,298.4,298.9,299.3,299.7,300.1,300.6,301.1,301.6,302.1,302.6,303.2,303.7,304.1,304.5,304.9,305.2,305.6,305.9,306.2,306.4,306.5,306.8,306.9,307.1,307.2,307.4,307.6,307.9,308.3,308.7,309.5,310.3,310.8,311.3,311.8,312.3,312.6,312.8,312.8,312.8,312.8,312.9,312.9,313,313.2,313.4,313.7,314.1,314.4,314.7,315,315.3,315.7,316.1,316.9,317.6,318.3,318.9,319.6,320.1,321.1,321.7,322.6,323.5,325,325.6,327.5,330.1,330.9,331,331.7,333.5,335.2,336.9,338.9,340.1,340.9,342.5,344.1,345.5,347,348.7,351.2,352.8,354.1,355.4,356.1,356.8,358.3,360.2,361.9,363,365.7,367.8,369,370.6,372.6,375.1,376.9,379,381.1,382.9,385,386.5,388.8,390.6,392.6,395.4,397.3,399.6,403.1,405.2,407.6,410.1,412.4,414.7,417.1,419.4,422.8],ERF_CO2:[0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.16,0.16,0.16,0.17,0.17,0.17,0.18,0.18,0.18,0.18,0.19,0.19,0.19,0.19,0.2,0.2,0.2,0.21,0.21,0.22,0.22,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.26,0.26,0.27,0.28,0.28,0.29,0.29,0.3,0.31,0.31,0.32,0.32,0.33,0.33,0.34,0.35,0.35,0.36,0.36,0.37,0.38,0.38,0.39,0.4,0.4,0.41,0.42,0.43,0.44,0.45,0.46,0.47,0.48,0.49,0.49,0.5,0.51,0.51,0.52,0.52,0.53,0.53,0.53,0.54,0.54,0.54,0.54,0.55,0.55,0.56,0.57,0.58,0.6,0.61,0.62,0.62,0.63,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.65,0.65,0.65,0.66,0.66,0.67,0.68,0.68,0.69,0.69,0.7,0.71,0.73,0.74,0.75,0.76,0.77,0.79,0.8,0.81,0.83,0.85,0.86,0.9,0.94,0.95,0.95,0.97,1,1.02,1.05,1.09,1.11,1.12,1.15,1.17,1.19,1.22,1.24,1.28,1.31,1.33,1.35,1.36,1.37,1.4,1.43,1.45,1.47,1.51,1.54,1.56,1.59,1.62,1.66,1.68,1.71,1.74,1.77,1.8,1.82,1.86,1.88,1.91,1.95,1.98,2.01,2.06,2.09,2.12,2.16,2.19,2.22,2.25,2.29,2.33],ERF_aerosol:[-0.08,-0.07,-0.07,-0.08,-0.09,-0.09,-0.09,-0.1,-0.1,-0.1,-0.11,-0.11,-0.11,-0.11,-0.11,-0.12,-0.12,-0.13,-0.14,-0.14,-0.15,-0.15,-0.15,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.19,-0.2,-0.21,-0.21,-0.22,-0.22,-0.23,-0.23,-0.24,-0.26,-0.26,-0.27,-0.27,-0.27,-0.28,-0.29,-0.3,-0.3,-0.32,-0.33,-0.36,-0.37,-0.37,-0.38,-0.39,-0.41,-0.43,-0.45,-0.49,-0.48,-0.49,-0.52,-0.51,-0.52,-0.54,-0.52,-0.51,-0.53,-0.56,-0.56,-0.49,-0.54,-0.47,-0.48,-0.53,-0.52,-0.52,-0.53,-0.56,-0.56,-0.59,-0.57,-0.5,-0.47,-0.48,-0.53,-0.56,-0.6,-0.62,-0.58,-0.62,-0.66,-0.67,-0.7,-0.7,-0.69,-0.61,-0.6,-0.64,-0.67,-0.66,-0.71,-0.71,-0.73,-0.75,-0.77,-0.81,-0.87,-0.9,-0.89,-0.91,-0.95,-0.98,-0.99,-1.06,-1.05,-1.08,-1.09,-1.12,-1.14,-1.16,-1.23,-1.24,-1.3,-1.31,-1.3,-1.28,-1.35,-1.36,-1.38,-1.4,-1.39,-1.35,-1.39,-1.31,-1.34,-1.35,-1.35,-1.39,-1.4,-1.38,-1.4,-1.49,-1.33,-1.34,-1.4,-1.33,-1.29,-1.43,-1.41,-1.27,-1.22,-1.22,-1.3,-1.34,-1.35,-1.39,-1.41,-1.39,-1.33,-1.25,-1.27,-1.26,-1.28,-1.2,-1.21,-1.19,-1.1,-1.07,-1.06,-1.11,-0.96,-1.04,-0.93,-1.13,-1.07],ERF_nonCO2_anthro:[-0.03,-0.02,-0.02,-0.02,-0.04,-0.03,-0.03,-0.04,-0.04,-0.04,-0.04,-0.04,-0.04,-0.04,-0.04,-0.05,-0.04,-0.05,-0.05,-0.05,-0.06,-0.05,-0.06,-0.07,-0.07,-0.07,-0.08,-0.08,-0.08,-0.1,-0.1,-0.11,-0.11,-0.11,-0.12,-0.12,-0.12,-0.12,-0.14,-0.14,-0.15,-0.15,-0.15,-0.15,-0.16,-0.17,-0.17,-0.18,-0.19,-0.21,-0.22,-0.23,-0.23,-0.24,-0.25,-0.27,-0.28,-0.31,-0.3,-0.3,-0.32,-0.31,-0.31,-0.33,-0.3,-0.29,-0.31,-0.32,-0.32,-0.25,-0.28,-0.22,-0.22,-0.26,-0.25,-0.25,-0.26,-0.28,-0.28,-0.3,-0.28,-0.21,-0.18,-0.19,-0.23,-0.25,-0.28,-0.3,-0.26,-0.29,-0.32,-0.33,-0.34,-0.34,-0.32,-0.25,-0.23,-0.26,-0.27,-0.27,-0.3,-0.3,-0.31,-0.33,-0.33,-0.36,-0.39,-0.41,-0.38,-0.4,-0.42,-0.44,-0.43,-0.47,-0.45,-0.46,-0.45,-0.46,-0.45,-0.45,-0.48,-0.46,-0.49,-0.47,-0.44,-0.4,-0.43,-0.41,-0.4,-0.39,-0.37,-0.31,-0.31,-0.23,-0.22,-0.21,-0.18,-0.19,-0.17,-0.13,-0.12,-0.15,-0.02,-0.01,-0.03,0.04,0.09,0,0.03,0.15,0.2,0.2,0.14,0.11,0.13,0.1,0.09,0.13,0.19,0.26,0.27,0.29,0.29,0.36,0.37,0.41,0.5,0.53,0.56,0.53,0.64,0.59,0.72,0.56,0.64],ERF_volcanic:[0.24,0.25,0.25,0,-0.28,0.07,0.16,-0.78,-0.4,0.08,0.18,0.22,-1,-1.28,-0.23,0.15,0.23,0.24,0.24,0,0.16,0.23,0.18,-1.1,-0.53,-0.1,0.1,0.12,0.21,0.23,0.12,0,0.17,-0.11,-2.21,-1.42,-0.88,-0.78,-0.17,0.11,0.01,0.14,0.21,0.05,0.15,-0.09,0.09,0.17,0.2,0.22,0.18,0.22,0.13,-0.2,0.02,0.15,0.18,-0.17,-0.1,0.16,0.22,0.18,-0.45,-0.65,0.01,0.2,0.23,0.19,0.1,-0.09,0.11,0.21,0.23,0.23,-0.17,-0.03,-0.37,-0.09,0.18,0.2,0.21,0.16,-0.23,-0.5,-0.04,0.18,0.22,0.19,0.2,0.22,0.23,0.23,0.23,-0.38,-0.29,0.08,0.19,-0.01,0.06,0.19,0.22,0.1,0.1,0.16,0.2,0.2,-0.05,-0.08,0.14,0.21,0.22,0.22,0.22,-0.96,-1.08,-0.15,0.05,0.13,0.08,0.01,0.16,0.21,0.22,0.2,0.19,0.14,0.15,0.21,0.22,0.22,0.15,0.1,-0.24,-0.74,-0.29,0.01,0.01,0.09,0.14,0.18,0.18,-0.61,-1.87,-0.81,-0.07,0.12,0.19,0.21,0.22,0.22,0.22,0.22,0.22,0.21,0.22,0.19,0.17,0.16,0.18,0.15,0.18,0.14,0.18,0.2,0.18,0.15,0.17,0.2,0.18,0.11,0.07,0.13,0.17,0.26,0.24],ERF_solar:[0.01,0,0,-0.01,-0.02,-0.03,-0.03,-0.03,-0.01,0,0.01,0.01,0,-0.01,-0.01,-0.02,-0.02,-0.03,-0.02,0,0,0.01,0.01,0,-0.01,-0.03,-0.03,-0.04,-0.04,-0.04,-0.03,-0.01,-0.01,-0.02,0.01,-0.01,-0.02,-0.03,-0.04,-0.04,-0.04,-0.01,0.01,0.03,0.05,0.03,0,-0.02,-0.02,-0.03,-0.04,-0.05,-0.04,-0.03,0.01,-0.01,0.02,0,0.01,0,-0.02,-0.04,-0.04,-0.04,-0.03,0.01,0.04,0.07,0.07,0.04,0.01,-0.01,-0.03,-0.03,-0.03,-0.01,0.02,0.05,0.03,0.02,0.02,0,-0.02,-0.02,-0.02,0.01,0.07,0.07,0.06,0.06,0.04,0.02,0.01,-0.01,-0.01,0.03,0.04,0.09,0.11,0.09,0.06,0.01,0.01,0,0,0.02,0.08,0.14,0.15,0.12,0.09,0.05,0.01,0,0,0,0.03,0.06,0.07,0.08,0.08,0.05,0.05,0.02,0.01,0.01,0,0.03,0.08,0.12,0.11,0.11,0.07,0.07,0.01,0,0,0.01,0.06,0.12,0.11,0.1,0.08,0.03,0,0,-0.01,0,0.05,0.08,0.11,0.1,0.1,0.04,0.02,-0.01,-0.02,-0.03,-0.03,-0.03,-0.01,0.03,0.04,0.05,0.06,0.03,-0.01,-0.02,-0.02,-0.02,-0.02,0.02,0.06,0.08,0.09],E_fossil_GtC:[0.05,0.05,0.06,0.06,0.07,0.07,0.08,0.08,0.08,0.08,0.09,0.1,0.1,0.1,0.11,0.12,0.12,0.13,0.13,0.14,0.15,0.16,0.17,0.18,0.17,0.19,0.19,0.19,0.19,0.21,0.23,0.24,0.26,0.27,0.28,0.28,0.28,0.3,0.33,0.33,0.36,0.37,0.38,0.37,0.39,0.41,0.42,0.44,0.47,0.51,0.54,0.55,0.57,0.62,0.63,0.67,0.7,0.79,0.76,0.79,0.83,0.85,0.89,0.96,0.87,0.86,0.93,0.97,0.96,0.83,0.97,0.85,0.89,1.01,1.01,1.02,1,1.1,1.09,1.17,1.08,0.97,0.87,0.92,1,1.05,1.15,1.23,1.15,1.22,1.33,1.36,1.36,1.39,1.41,1.17,1.26,1.41,1.49,1.42,1.62,1.74,1.77,1.82,1.85,2.03,2.16,2.23,2.3,2.42,2.56,2.57,2.66,2.8,2.95,3.09,3.24,3.34,3.52,3.76,4.07,4.23,4.43,4.66,4.64,4.64,4.88,5.01,5.19,5.32,5.3,5.15,5.11,5.16,5.31,5.5,5.58,5.76,5.98,6.06,6.2,6.33,6.15,6.21,6.27,6.42,6.61,6.65,6.63,6.78,6.96,7.01,7.17,7.55,7.81,8.08,8.35,8.6,8.75,8.6,9.09,9.41,9.54,9.63,9.68,9.66,9.66,9.82,10.03,10.12,9.6,10.06,10.24,10.4,10.53],E_luc_GtC:[0.74,0.77,0.8,0.8,0.81,0.83,0.83,0.84,0.85,0.86,0.79,0.76,0.73,0.73,0.73,0.71,0.72,0.7,0.7,0.7,0.79,0.82,0.86,0.88,0.9,0.91,0.92,0.95,0.96,0.98,0.99,0.98,1.01,1.02,1.02,1.02,1.02,1.04,1.04,1.05,1.12,1.15,1.14,1.15,1.17,1.17,1.18,1.19,1.2,1.21,1.22,1.25,1.26,1.27,1.3,1.31,1.33,1.33,1.34,1.36,1.31,1.3,1.27,1.26,1.26,1.24,1.24,1.22,1.21,1.2,1.3,1.36,1.38,1.41,1.4,1.43,1.44,1.44,1.45,1.47,1.48,1.51,1.52,1.51,1.52,1.5,1.54,1.54,1.55,1.54,1.57,1.61,1.61,1.61,1.59,1.6,1.59,1.58,1.56,1.55,1.82,1.96,1.98,2.02,2.13,2.18,2.2,2.26,2.24,2.37,2.08,2.08,1.95,1.9,1.82,1.74,1.61,1.71,1.73,1.89,1.83,1.68,1.76,1.71,1.72,1.67,1.65,1.81,1.79,1.6,1.64,1.59,1.51,1.59,1.75,1.85,1.9,1.77,1.68,1.63,1.59,1.56,1.63,1.56,1.82,1.71,1.79,2.19,1.85,1.79,1.68,1.49,1.66,2,1.76,1.62,1.65,1.53,1.62,1.78,1.78,1.74,1.82,1.72,1.75,1.78,1.47,1.45,1.33,1.33,1.23,1.27,1.31,1.3,1.25]};
const Y0=1850,N=H.T.length,YN=Y0+N-1,F2X=3.93;
/* the measured sea level rise since 1900, mm (Frederikse et al. 2020) */
const SL_OBS=[[1900,0],[1910,-4],[1920,35],[1930,27],[1940,41],[1950,77],[1960,96],[1970,88],[1980,103],[1990,122],[2000,143],[2010,170],[2018,209]];
const mean=(a,i,j)=>{let s=0;for(let k=i;k<=j;k++)s+=a[k];return s/(j-i+1)};
/* the parts of the push, W/m² against 1750 */
const P={co2:H.ERF_CO2,gas:H.ERF_nonCO2_anthro.map((v,i)=>v-H.ERF_aerosol[i]),aer:H.ERF_aerosol,nat:H.ERF_volcanic.map((v,i)=>v+H.ERF_solar[i])};
const BASE={};Object.keys(P).forEach(k=>BASE[k]=mean(P[k],0,49));
/* the two-layer model: forcing F (one value a year) → surface warming, after a steady start under F0 */
function ebm(F,S,F0){const C=8,Cd=100,lam=F2X/S,g=.9,eff=1.3;let T=F0/lam,Td=T;const out=new Float64Array(F.length);
 for(let i=0;i<F.length;i++){for(let k=0;k<4;k++){const dT=(F[i]-lam*T-eff*g*(T-Td))/C,dTd=g*(T-Td)/Cd;T+=dT/4;Td+=dTd/4}out[i]=T}return out}
/* warming against 1850–1900 from the parts switched on (on: {co2,gas,aer,nat}) and any extra years of push */
function run(on,S,extra){const ks=Object.keys(P).filter(k=>on[k]);const n=N+(extra?extra.n:0),F=new Float64Array(n);let F0=0;
 ks.forEach(k=>{F0+=BASE[k];for(let i=0;i<n;i++)F[i]+=i<N?P[k][i]:extra[k][i-N]});
 const t=ebm(F,S,F0),b=mean(t,0,50);return Array.from(t,v=>v-b)}
/* the carbon cycle: Joos et al. 2013 pools, filled with every year's emissions since 1850, then scaled to the measured 2024 level */
const JA=[.2173,.224,.2824,.2763],JT=[Infinity,394.4,36.54,4.304],GTC=2.124;
const POOLS=(()=>{const R=[0,0,0,0];for(let i=0;i<N;i++){const E=H.E_fossil_GtC[i]+H.E_luc_GtC[i];for(let j=0;j<4;j++){R[j]+=JA[j]*E;if(isFinite(JT[j]))R[j]*=Math.exp(-1/JT[j])}}
 const ex=R.reduce((a,b)=>a+b,0)/GTC,k=(H.CO2ppm[N-1]-H.CO2ppm[0])/ex;return R.map(r=>r*k)})();
const EF0=H.E_fossil_GtC[N-1],EL0=H.E_luc_GtC[N-1],E0=EF0+EL0,C2024=H.CO2ppm[N-1],PI=277.15;
/* a future: emissions each year 2025..2100 (GtC) from a plan {g growth a year, peak, zero: net-zero year or 0 for never} */
const YF=2100,NF=YF-YN;
function emissions(pl){const E=[];let e=E0;for(let y=YN+1;y<=YF;y++){if(y<=pl.peak)e=e*(1+pl.g);else if(pl.zero){const ep=E0*Math.pow(1+pl.g,Math.max(0,pl.peak-YN));e=Math.max(0,ep*(1-(y-pl.peak)/(pl.zero-pl.peak)))}E.push(e)}return E}
function future(pl,S,haze){const E=emissions(pl),R=POOLS.slice(),ppm=[],ex={n:NF,co2:[],gas:[],aer:[],nat:[]};const kC=H.ERF_CO2[N-1]/Math.log(C2024/PI),G0=P.gas[N-1],A0=P.aer[N-1];
 E.forEach(e=>{for(let j=0;j<4;j++){R[j]+=JA[j]*e;if(isFinite(JT[j]))R[j]*=Math.exp(-1/JT[j])}const c=H.CO2ppm[0]+R.reduce((a,b)=>a+b,0)/GTC;ppm.push(c);
  const fos=e*EF0/E0;ex.co2.push(kC*Math.log(c/PI));ex.gas.push(G0*(.3+.7*Math.min(1.6,e/E0)));ex.aer.push(haze?A0*(.25+.75*Math.min(1.6,fos/EF0)):A0);ex.nat.push(BASE.nat)});
 const T=run({co2:1,gas:1,aer:1,nat:1},S,ex);return{E,ppm,T}}
/* sea level from warming, mm against 1900 */
function sea(T){const out=[];let h=0;for(let i=0;i<T.length;i++){const y=Y0+i;if(y>1900)h+=3.1*(T[i]+.22);out.push(y<1900?null:h)}return out}
const CLIM={H,P,run,future,emissions,sea,SL_OBS,Y0,YN,YF,N,E0,F2X,mean};
if(typeof window!=="undefined")window.GFCLIM=CLIM;if(typeof module!=="undefined")module.exports=CLIM;

/* ---------------------------------------------------------------- the simulation */
if(typeof DG==="undefined"||!window.GFSIM)return;
const K=window.GFSIM,{INK,ACC,SUB,T:TX,clamp,f1,f2,q,txt,setHTML,slider,setSlider,btn,btnOn,hint,para,setPara,make}=K;
const OBS="#7d8a9c",MOD="#d6455d",EQ="#c98a1d",SEA="#2f7ab8";
const CX0=30,CX1=292;
const xOf=(y,a,b)=>CX0+(y-a)/(b-a)*(CX1-CX0);
const yOf=(v,lo,hi,t,b)=>b-(v-lo)/(hi-lo)*(b-t);
const line=(vals,y0,a,b,lo,hi,t,bt,upto)=>{let d="",pen=false;vals.forEach((v,i)=>{const y=y0+i;if(v==null||y<a||y>b||(upto!=null&&y>upto)){pen=false;return}d+=(pen?"L":"M")+f1(xOf(y,a,b))+","+f1(yOf(clamp(v,lo-.2*(hi-lo),hi+.2*(hi-lo)),lo,hi,t,bt));pen=true});return d};
/* the frame of a chart: grid, labels */
function axes(a,b,lo,hi,t,bt,ticks,unit,xstep){let h='<clipPath id="dgClClip"><rect x="'+CX0+'" y="'+t+'" width="'+(CX1-CX0)+'" height="'+(bt-t)+'"/></clipPath><rect x="'+CX0+'" y="'+t+'" width="'+(CX1-CX0)+'" height="'+(bt-t)+'" rx="4" fill="#f6f8fb"/>';
 ticks.forEach(v=>{const y=f1(yOf(v,lo,hi,t,bt));h+='<line x1="'+CX0+'" x2="'+CX1+'" y1="'+y+'" y2="'+y+'" stroke="'+(v===0?"#9aa7b8":"#e1e7ee")+'" stroke-width="'+(v===0?.7:.5)+'"/>'+TX(CX0-2,+y+2,(v>0?"+":"")+v+unit,'font-size="5.4" text-anchor="end" fill="'+SUB+'"')});
 for(let y=Math.ceil(a/xstep)*xstep;y<=b;y+=xstep){const x=f1(xOf(y,a,b));h+='<line x1="'+x+'" x2="'+x+'" y1="'+t+'" y2="'+bt+'" stroke="#e8edf3" stroke-width=".5"/>'+TX(x,bt+6.5,y,'font-size="5.4" text-anchor="middle" fill="'+SUB+'"')}return h}
const PARTS=[["co2","CO₂"],["gas","Other gases"],["aer","Pollution haze"],["nat","Volcanoes, Sun"]];
const PLANS=[["grow","Keep growing",{g:.015,peak:2100,zero:0}],["policy","Today’s policies",{g:0,peak:2030,zero:2250}],["nz70","Net zero 2070",{g:0,peak:2025,zero:2070}],["nz50","Net zero 2050",{g:0,peak:2025,zero:2050}]];
const EVENTS=[[1883,"Krakatoa erupts"],[1902,"Santa María erupts"],[1940,"wartime warm years"],[1963,"Agung erupts"],[1970,"clean-air laws start to thin the haze"],[1982,"El Chichón erupts"],[1991,"Pinatubo erupts: a cool year after"],[1998,"a big El Niño"],[2016,"El Niño: a record"],[2023,"El Niño: a new record"]];
/* cached model runs */
function hist(s){const k=s.S+"|"+PARTS.map(p=>s.on[p[0]]?1:0).join("");if(s._hk!==k){s._hk=k;s._h=CLIM.run(s.on,s.S)}return s._h}
function parts(s){const k=""+s.S;if(s._pk!==k){s._pk=k;s._p={};PARTS.forEach(([p])=>{const o={};o[p]=1;s._p[p]=CLIM.mean(CLIM.run(o,s.S),164,173)})}return s._p}
function fut(s){const k=s.S+"|"+JSON.stringify(s.plan)+"|"+s.haze;if(s._fk!==k){s._fk=k;s._f=CLIM.future(s.plan,s.S,s.haze);s._f.sea=CLIM.sea(s._f.T)}return s._f}
const sgn=v=>(v>=0?"+":"−")+Math.abs(v).toFixed(2);
const sgn1=v=>(v>=0?"+":"−")+Math.abs(v).toFixed(1);
/* layout of each tab */
const TOP=28,BOT0=124,BOT1=104;
function frame(tab){
 if(tab===0)return axes(1850,2024,-.6,2,TOP,BOT0,[-.5,0,.5,1,1.5],"°",25)+'<g class="cl-ev"></g><g clip-path="url(#dgClClip)"><path class="cl-eq" fill="none" stroke="'+EQ+'" stroke-width="1" stroke-dasharray="3 2"/><path class="cl-obs" fill="none" stroke="'+OBS+'" stroke-width=".8"/><g class="cl-dots"></g><path class="cl-mod" fill="none" stroke="'+MOD+'" stroke-width="1.8" stroke-linejoin="round"/></g><g class="cl-cur"></g>'+
  TX(CX0+4,TOP+8,"Warming since 1850–1900",'font-size="6.2" font-weight="800" fill="'+INK+'"')+'<g transform="translate('+(CX0+4)+','+(TOP+15)+')"><line x2="10" stroke="'+OBS+'" stroke-width="1"/>'+TX(13,2,"measured",'font-size="5.4" fill="'+SUB+'"')+'<line x1="48" x2="58" stroke="'+MOD+'" stroke-width="1.8"/>'+TX(61,2,"model",'font-size="5.4" fill="'+SUB+'"')+'<line x1="86" x2="96" stroke="'+EQ+'" stroke-width="1" stroke-dasharray="3 2"/>'+TX(99,2,"where it is heading (if the push held)",'font-size="5.4" fill="'+SUB+'"')+'</g>'+
  PARTS.map(([k,l],i)=>btn("p_"+k,CX0+i*66,136,62,l)).join("")+slider("S",CX0,166,168,"Warming if CO₂ doubles (in the long run)")+btn("play",214,158,78,"▶ Replay 1850→")+
  '<text class="cl-big" x="'+CX0+'" y="184" font-size="7.6" font-weight="900" fill="'+INK+'"></text>'+para("cl-tx",CX0-2,187,264,30,6.1)+hint(CX0,224,"Switch the pushes on and off, change the sensitivity, or point at a year");
 if(tab===1)return axes(1850,2100,-.6,4,TOP,BOT1,[0,1,2,3],"°",50)+'<line class="cl-p15" x1="'+CX0+'" x2="'+CX1+'" stroke="#2f8a5c" stroke-width=".6" stroke-dasharray="2 2"/><line class="cl-p2" x1="'+CX0+'" x2="'+CX1+'" stroke="#c0561d" stroke-width=".6" stroke-dasharray="2 2"/>'+
  TX(CX0+3,yOf(1.5,-.6,4,TOP,BOT1)-1.5,"1.5 °C",'font-size="5" fill="#2f8a5c" font-weight="700"')+TX(CX0+3,yOf(2,-.6,4,TOP,BOT1)-1.5,"2 °C (Paris goals)",'font-size="5" fill="#c0561d" font-weight="700"')+
  '<rect x="'+f1(xOf(2024,1850,2100))+'" y="'+TOP+'" width="'+f1(CX1-xOf(2024,1850,2100))+'" height="'+(BOT1-TOP)+'" fill="#fff3e6" opacity=".6"/>'+'<g clip-path="url(#dgClClip)"><path class="cl-obs" fill="none" stroke="'+OBS+'" stroke-width=".8"/><path class="cl-mod" fill="none" stroke="'+MOD+'" stroke-width="1.8" stroke-linejoin="round"/></g><g class="cl-cur"></g>'+
  TX(CX0+4,TOP+8,"Warming since 1850–1900",'font-size="6.2" font-weight="800" fill="'+INK+'"')+TX(xOf(2024,1850,2100)+3,TOP+8,"your future",'font-size="5.6" font-weight="700" fill="#c0561d"')+
  '<rect x="'+CX0+'" y="111" width="'+(CX1-CX0)+'" height="20" rx="3" fill="#f6f8fb"/><path class="cl-em" fill="#8a6a4f" fill-opacity=".55" stroke="#6b4f3a" stroke-width=".6"/>'+TX(CX0+3,118,"CO₂ emissions",'font-size="5.2" font-weight="700" fill="'+SUB+'"')+'<text class="cl-emv" x="'+(CX1-3)+'" y="118" font-size="5.2" text-anchor="end" fill="'+SUB+'"></text>'+
  PLANS.map(([k,l],i)=>btn("pl_"+k,CX0+i*66,137,62,l)).join("")+slider("Z",CX0,167,168,"Emissions reach zero by")+btn("haze",214,159,78,"Haze fades")+
  '<text class="cl-big" x="'+CX0+'" y="185" font-size="7.6" font-weight="900" fill="'+INK+'"></text>'+para("cl-tx",CX0-2,188,264,30,6.1)+hint(CX0,224,"Pick a plan or drag when emissions reach zero; point at a year");
 return axes(1900,2100,0,1000,TOP,BOT0,[0,250,500,750],"",25).replace(/>\+(\d+)</g,(m,v)=>">+"+v/10+" cm<")+'<g class="cl-sobs"></g><g clip-path="url(#dgClClip)"><path class="cl-shist" fill="none" stroke="'+SEA+'" stroke-width="1.8"/><path class="cl-sfut" fill="none" stroke="'+SEA+'" stroke-width="1.8" stroke-dasharray="4 2"/></g><g class="cl-cur"></g>'+
  TX(CX0+4,TOP+8,"Sea level rise since 1900",'font-size="6.2" font-weight="800" fill="'+INK+'"')+'<g transform="translate('+(CX0+4)+','+(TOP+15)+')"><circle cx="4" r="1.8" fill="'+OBS+'"/>'+TX(9,2,"measured (tide gauges, satellites)",'font-size="5.4" fill="'+SUB+'"')+'<line x1="96" x2="106" stroke="'+SEA+'" stroke-width="1.8"/>'+TX(109,2,"from the model’s warming",'font-size="5.4" fill="'+SUB+'"')+'</g>'+
  PLANS.map(([k,l],i)=>btn("pl_"+k,CX0+i*66,136,62,l)).join("")+
  '<text class="cl-big" x="'+CX0+'" y="166" font-size="7.6" font-weight="900" fill="'+INK+'"></text>'+para("cl-tx",CX0-2,169,264,46,6.1)+hint(CX0,224,"Pick a plan: the future part is dashed; point at a year")}
function cursor(svg,s,a,b,t,bt,lines){if(s.hov==null||s.hov<a||s.hov>b){setHTML(svg,".cl-cur","");return}const x=xOf(s.hov,a,b);let h='<line x1="'+f1(x)+'" x2="'+f1(x)+'" y1="'+t+'" y2="'+bt+'" stroke="'+INK+'" stroke-width=".5" stroke-dasharray="1.5 1.5"/>';
 const w=Math.max(...lines.map(l=>l.length))*2.9+8,bx=x+w+6>CX1?x-w-4:x+4;h+='<rect x="'+f1(bx)+'" y="'+(t+20)+'" width="'+f1(w)+'" height="'+(lines.length*7.5+4)+'" rx="3" fill="#fff" stroke="#c9d3df" stroke-width=".5"/>';
 lines.forEach((l,i)=>{h+=TX(f1(bx+4),t+27+i*7.5,l,'font-size="5.6" font-weight="'+(i?500:800)+'" fill="'+INK+'"')});setHTML(svg,".cl-cur",h)}

make("co2",{title:"A climate model you can run",cat:"climate",h:230,tabs:["1850 → today","Your future","Sea level"],
 src:"Two-layer ocean energy-balance model (Held et al. 2010; Geoffroy et al. 2013) with AR6’s forcing for doubled CO₂ (3.93 W/m²) and the Joos et al. 2013 carbon cycle; sea level after Rahmstorf 2007. Data: HadCRUT5 temperatures (Met Office); CO₂ and radiative forcing, IPCC AR6 Annex III as updated by Forster et al. 2024; emissions, Global Carbon Budget via Our World in Data; sea level, Frederikse et al. 2020. A simple model: the IPCC’s full models give a range around these numbers.",
 frame,
 state:()=>({S:3,on:{co2:1,gas:1,aer:1,nat:1},play:false,py:2024,hov:null,plan:Object.assign({},PLANS[1][2]),pk:"policy",haze:1}),
 draw:(svg,s)=>{
  if(s.tab===0){const t=hist(s),p=parts(s),lam=CLIM.F2X/s.S;
   q(svg,".cl-obs").setAttribute("d",line(CLIM.H.T,1850,1850,2024,-.6,2,TOP,BOT0));
   q(svg,".cl-mod").setAttribute("d",line(t,1850,1850,2024,-.6,2,TOP,BOT0,s.play?s.py:null));
   /* where it is heading: the push of each year if it held for ever, against the 1850–1900 start (smoothed over 5 years) */
   const F=CLIM.H.T.map((_,i)=>PARTS.reduce((a,[k])=>a+(s.on[k]?CLIM.P[k][i]-CLIM.mean(CLIM.P[k],0,49):0),0));const Fs=F.map((_,i)=>CLIM.mean(F,Math.max(0,i-4),i));
   q(svg,".cl-eq").setAttribute("d",line(Fs.map(v=>v/lam),1850,1850,2024,-.6,2,TOP,BOT0,s.play?s.py:null));
   let ev="";EVENTS.forEach(([y,l])=>{if(s.play&&s.py<y)return;const x=f1(xOf(y,1850,2024));ev+='<line x1="'+x+'" x2="'+x+'" y1="'+(BOT0-3)+'" y2="'+BOT0+'" stroke="'+SUB+'" stroke-width=".6"/>'});setHTML(svg,".cl-ev",ev);
   PARTS.forEach(([k])=>btnOn(svg,"p_"+k,!!s.on[k]));setSlider(svg,"S",CX0,166,168,(s.S-1.5)/3.5,s.S.toFixed(1)+" °C");btnOn(svg,"play",s.play,s.play?"■ Stop":"▶ Replay 1850→");
   const yr=s.play?Math.floor(s.py):2024,i=yr-1850,m=CLIM.mean(t,164,173),obs=CLIM.mean(CLIM.H.T,164,173);
   if(s.play){const e=EVENTS.filter(([y])=>y<=yr).pop();txt(svg,".cl-big",yr+": model "+sgn(t[i])+" °C, measured "+sgn(CLIM.H.T[i])+" °C");setPara(svg,"cl-tx",e&&yr-e[0]<12?"<b>"+e[0]+"</b>: "+e[1]+".":"Year by year: the model (red) is pushed only by the forcings; the measured line also wobbles with El Niño and La Niña, which the model leaves out.")}
   else{txt(svg,".cl-big","2014–2023: model "+sgn(m)+" °C · measured "+sgn(obs)+" °C");
    const all=PARTS.every(([k])=>s.on[k]),Fn=Fs[173]/lam;
    setPara(svg,"cl-tx",(all?"Made of: CO₂ "+sgn(p.co2)+", other gases (methane, nitrous oxide…) "+sgn(p.gas)+", pollution haze "+sgn(p.aer)+", volcanoes & Sun "+sgn(p.nat)+" °C. The haze has hidden about "+Math.abs(p.aer).toFixed(1)+" °C. ":
     !s.on.aer&&s.on.co2?"Without the haze of pollution the model runs "+sgn(m-obs)+" °C warmer than measured: smoke and sulphate hide part of the warming. ":
     !s.on.co2?"Without CO₂ the model misses most of the warming. ":"With only some pushes switched on, the model misses part of the warming. ")+
     "If today’s push held, the Earth would end near "+sgn1(Fn)+" °C (dashed): the deep ocean is still catching up.")}
   const H=s.hov;if(H!=null&&H>=1850&&H<=2024){const j=Math.round(H)-1850;cursor(svg,s,1850,2024,TOP,BOT0,[String(Math.round(H)),"measured "+sgn(CLIM.H.T[j])+" °C","model "+sgn(t[j])+" °C","CO₂ "+Math.round(CLIM.H.CO2ppm[j])+" ppm"])}else setHTML(svg,".cl-cur","")}
  else if(s.tab===1){const f=fut(s),T=f.T,n=T.length;q(svg,".cl-obs").setAttribute("d",line(CLIM.H.T,1850,1850,2100,-.6,4,TOP,BOT1));q(svg,".cl-mod").setAttribute("d",line(T,1850,1850,2100,-.6,4,TOP,BOT1));
   [["cl-p15",1.5],["cl-p2",2]].forEach(([c,v])=>{const l=q(svg,"."+c),y=f1(yOf(v,-.6,4,TOP,BOT1));l.setAttribute("y1",y);l.setAttribute("y2",y)});
   /* emissions strip: history then the plan */
   const EM=CLIM.H.E_fossil_GtC.map((v,i)=>v+CLIM.H.E_luc_GtC[i]).concat(f.E),emax=Math.max(20,...EM),ey=v=>131-v/emax*16;let d="M"+f1(xOf(1850,1850,2100))+",131";EM.forEach((v,i)=>{d+="L"+f1(xOf(1850+i,1850,2100))+","+f1(ey(v))});d+="L"+f1(xOf(2100,1850,2100))+",131Z";q(svg,".cl-em").setAttribute("d",d);
   txt(svg,".cl-emv","2024: "+CLIM.E0.toFixed(1)+" GtC · 2050: "+f.E[2050-2025].toFixed(1)+" · 2100: "+f.E[n-1-175].toFixed(1));
   PLANS.forEach(([k])=>btnOn(svg,"pl_"+k,s.pk===k));btnOn(svg,"haze",!s.haze,s.haze?"Haze fades":"Haze kept");
   const z=s.plan.zero&&s.plan.zero<=2100?s.plan.zero:0;setSlider(svg,"Z",CX0,167,168,z?(z-2035)/65:1,z?String(z):s.plan.g>0?"never (growing)":"after 2100");
   let pk=-9,py=0;for(let i=174;i<n;i++)if(T[i]>pk){pk=T[i];py=1850+i}
   txt(svg,".cl-big","2100: "+sgn1(T[n-1])+" °C · peak "+sgn1(pk)+" °C"+(py<2100?" in "+py:"")+" · CO₂ "+Math.round(f.ppm[f.ppm.length-1])+" ppm");
   const cum=f.E.reduce((a,b)=>a+b,0),y15=T.findIndex((v,i)=>i>=170&&v>=1.5),y2=T.findIndex((v,i)=>i>=170&&v>=2);
   setPara(svg,"cl-tx",(y15>0?"Passes 1.5 °C in "+(1850+y15)+(y2>0?" and 2 °C in "+(1850+y2)+". ":". "):"Stays under 1.5 °C. ")+"From 2025 to 2100 this plan puts out "+Math.round(cum)+" GtC (today: "+CLIM.E0.toFixed(1)+" a year). "+
    (s.plan.zero&&s.plan.zero<=2100?"Once emissions stop, warming levels off rather than falling back: CO₂ lingers for centuries."+(s.haze?" Cleaner air removes the haze too, which warms a little at first.":""):"While emissions go on, CO₂ keeps piling up and so does the warming."));
   const H=s.hov;if(H!=null&&H>=1850&&H<=2100){const j=Math.round(H)-1850;cursor(svg,s,1850,2100,TOP,BOT1,[String(Math.round(H)),(j<175?"measured "+sgn(CLIM.H.T[j])+" °C · ":"")+"model "+sgn(T[j])+" °C","CO₂ "+Math.round(j<175?CLIM.H.CO2ppm[j]:f.ppm[j-175])+" ppm · emissions "+EM[j].toFixed(1)+" GtC"])}else setHTML(svg,".cl-cur","")}
  else{const f=fut(s),sl=f.sea,n=sl.length;let o="";CLIM.SL_OBS.forEach(([y,v])=>{o+='<circle cx="'+f1(xOf(y,1900,2100))+'" cy="'+f1(yOf(v,0,1000,TOP,BOT0))+'" r="1.8" fill="'+OBS+'"/>'});setHTML(svg,".cl-sobs",o);
   q(svg,".cl-shist").setAttribute("d",line(sl.slice(0,175),1850,1900,2100,0,1000,TOP,BOT0));q(svg,".cl-sfut").setAttribute("d",line(sl.map((v,i)=>i<174?null:v),1850,1900,2100,0,1000,TOP,BOT0));
   PLANS.forEach(([k])=>btnOn(svg,"pl_"+k,s.pk===k));
   const r2100=(sl[n-1]-sl[150])/10,rate=sl[n-1]-sl[n-2],now=sl[174]-sl[173];
   txt(svg,".cl-big","By 2100: +"+Math.round(r2100)+" cm since 2000, rising "+rate.toFixed(1)+" mm a year (today "+now.toFixed(1)+")");
   setPara(svg,"cl-tx","Warmer water takes up more room and melting glaciers and ice sheets add water; the warmer it is, the faster the sea rises. Even if warming stops, the sea keeps rising for centuries. This simple rule leaves out a fast collapse of the Antarctic and Greenland ice sheets, which could add much more: the IPCC gives 0.3–1 m by 2100 for these kinds of paths, and more is possible. On the map, the Sea level tool in the toolkit shows what the coasts lose.");
   const H=s.hov;if(H!=null&&H>=1900&&H<=2100){const j=Math.round(H)-1850,ob=CLIM.SL_OBS.find(([y])=>Math.abs(y-H)<1.5);cursor(svg,s,1900,2100,TOP,BOT0,[String(Math.round(H)),"model +"+(sl[j]/10).toFixed(0)+" cm"+(ob?" · measured +"+(ob[1]/10).toFixed(0)+" cm":""),"warming "+sgn(f.T[j])+" °C"])}else setHTML(svg,".cl-cur","")}},
 tick:(svg,s,dt)=>{if(s.tab!==0||!s.play)return;s.py+=dt*22;if(s.py>=2024.99){s.py=2024;s.play=false}DG.co2._d(svg,s)},
 drag:(svg,s,n,x)=>{const f=clamp((x-CX0)/168,0,1);if(n==="S"){s.S=Math.round((1.5+f*3.5)*10)/10;return}
  if(n==="Z"){if(f>.985){s.plan={g:0,peak:2030,zero:2250};s.pk=null}else{const z=Math.round(2035+f*65);s.plan={g:0,peak:2025,zero:Math.max(2030,z)};s.pk=PLANS.find(p=>p[2].zero===s.plan.zero&&p[2].peak===2025)?PLANS.find(p=>p[2].zero===s.plan.zero)[0]:null}}},
 move:(svg,s,x,y)=>{if(x<CX0||x>CX1||y<TOP||y>(s.tab===1?BOT1:BOT0)){if(s.hov==null)return false;s.hov=null;return}const a=s.tab===2?1900:1850,b=s.tab===0?2024:2100;s.hov=a+(x-CX0)/(CX1-CX0)*(b-a)},
 leave:(svg,s)=>{if(s.hov==null)return false;s.hov=null},
 onTab:(svg,s)=>{s.play=false;s.hov=null},
 tabFrames:true,
 act:(svg,s,a)=>{let m=/^p_(\w+)$/.exec(a);if(m){s.on[m[1]]=s.on[m[1]]?0:1;return true}
  m=/^pl_(\w+)$/.exec(a);if(m){const p=PLANS.find(x=>x[0]===m[1]);if(p){s.plan=Object.assign({},p[2]);s.pk=p[0]}return true}
  if(a==="haze"){s.haze=s.haze?0:1;return true}
  if(a==="play"){s.play=!s.play;if(s.play)s.py=1850;return true}}});
})();
