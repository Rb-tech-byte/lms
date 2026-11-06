const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'assets', 'img', 'out-logo.png');
const pngBase64 = fs.readFileSync(pngPath).toString('base64');
const dataUri = 'data:image/png;base64,' + pngBase64;

// 1. logo.svg (for light/white backgrounds)
const logoSvg = `<svg width="200" height="42" viewBox="0 0 200 42" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- OUT New Brand Emblem -->
  <image href="${dataUri}" x="0" y="1" width="40" height="40" preserveAspectRatio="xMidYMid meet" />
  
  <!-- Text Brand -->
  <g transform="translate(48, 0)">
    <text x="0" y="23" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="800" letter-spacing="-0.5" fill="#013BA6">
      OUT<tspan fill="#228DDD" font-weight="800" dx="3">LMS</tspan>
    </text>
    <text x="0" y="35" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="7" font-weight="700" letter-spacing="0.8" fill="#228DDD">
      OPEN UNIVERSITY OF TANZANIA
    </text>
  </g>
</svg>`;

// 2. logo-white.svg (for dark backgrounds)
const logoWhiteSvg = `<svg width="200" height="42" viewBox="0 0 200 42" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- OUT New Brand Emblem -->
  <image href="${dataUri}" x="0" y="1" width="40" height="40" preserveAspectRatio="xMidYMid meet" />
  
  <!-- Text Brand -->
  <g transform="translate(48, 0)">
    <text x="0" y="23" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="800" letter-spacing="-0.5" fill="#FFFFFF">
      OUT<tspan fill="#F4ED2D" font-weight="800" dx="3">LMS</tspan>
    </text>
    <text x="0" y="35" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="7" font-weight="600" letter-spacing="0.8" fill="#88C8F7">
      OPEN UNIVERSITY OF TANZANIA
    </text>
  </g>
</svg>`;

const outDir = path.join(__dirname, '..', 'public', 'assets', 'img');
fs.writeFileSync(path.join(outDir, 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(outDir, 'logo-white.svg'), logoWhiteSvg);

console.log('SVGs generated successfully!');
