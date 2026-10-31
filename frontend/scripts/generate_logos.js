const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'assets', 'img', 'out-logo.png');
const pngBase64 = fs.readFileSync(pngPath).toString('base64');
const dataUri = 'data:image/png;base64,' + pngBase64;

// 1. logo.svg (for light/white backgrounds)
const logoSvg = `<svg width="190" height="40" viewBox="0 0 190 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- OUT Emblem -->
  <image href="${dataUri}" x="0" y="1" width="38" height="38" preserveAspectRatio="xMidYMid meet" />
  
  <!-- Text Brand -->
  <g transform="translate(46, 0)">
    <text x="0" y="22" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" letter-spacing="-0.5" fill="#0072BC">
      OUT<tspan fill="#F5B800" font-weight="800" dx="3">LMS</tspan>
    </text>
    <text x="0" y="33" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="6.8" font-weight="700" letter-spacing="0.6" fill="#092244">
      OPEN UNIVERSITY OF TANZANIA
    </text>
  </g>
</svg>`;

// 2. logo-white.svg (for dark backgrounds)
const logoWhiteSvg = `<svg width="190" height="40" viewBox="0 0 190 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- OUT Emblem -->
  <image href="${dataUri}" x="0" y="1" width="38" height="38" preserveAspectRatio="xMidYMid meet" />
  
  <!-- Text Brand -->
  <g transform="translate(46, 0)">
    <text x="0" y="22" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" letter-spacing="-0.5" fill="#FFFFFF">
      OUT<tspan fill="#F5B800" font-weight="800" dx="3">LMS</tspan>
    </text>
    <text x="0" y="33" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="6.8" font-weight="600" letter-spacing="0.6" fill="#EAF3FA">
      OPEN UNIVERSITY OF TANZANIA
    </text>
  </g>
</svg>`;

const outDir = path.join(__dirname, '..', 'public', 'assets', 'img');
fs.writeFileSync(path.join(outDir, 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(outDir, 'logo-white.svg'), logoWhiteSvg);

console.log('SVGs generated successfully!');
