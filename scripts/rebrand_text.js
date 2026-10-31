const fs = require('fs');

const authFiles = [
  'src/feature-module/auth/login/login.tsx',
  'src/feature-module/auth/register/register.tsx',
  'src/feature-module/auth/forgot-password/forgortPassword.tsx',
  'src/feature-module/auth/otp/otp.tsx',
  'src/feature-module/auth/set-password/setPassword.tsx'
];

authFiles.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('Dreams<span className="text-secondary">LMS</span>', 'OUT <span className="text-secondary">LMS</span>');
  fs.writeFileSync(f, c);
  console.log('Rebranded auth file:', f);
});

// Modals
let fp = fs.readFileSync('src/core/common/modal/forgotPassword.tsx', 'utf8');
fp = fp.replaceAll('DreamsTour', 'OUT LMS');
fs.writeFileSync('src/core/common/modal/forgotPassword.tsx', fp);

let lm = fs.readFileSync('src/core/common/modal/loginModal.tsx', 'utf8');
lm = lm.replaceAll('DreamsTour', 'OUT LMS');
fs.writeFileSync('src/core/common/modal/loginModal.tsx', lm);

let rm = fs.readFileSync('src/core/common/modal/registerModal.tsx', 'utf8');
rm = rm.replaceAll('DreamsTour', 'OUT LMS');
fs.writeFileSync('src/core/common/modal/registerModal.tsx', rm);

let af = fs.readFileSync('src/feature-module/authFeature.tsx', 'utf8');
af = af.replaceAll('DreamsTour', 'OUT LMS');
fs.writeFileSync('src/feature-module/authFeature.tsx', af);

// Pages
let ab = fs.readFileSync('src/feature-module/Pages/about-us/section/aboutSection.tsx', 'utf8');
ab = ab.replaceAll('At DreamsLMS', 'At OUT LMS');
fs.writeFileSync('src/feature-module/Pages/about-us/section/aboutSection.tsx', ab);

let pp = fs.readFileSync('src/feature-module/Pages/privacy-policy/privacyPolicy.tsx', 'utf8');
pp = pp.replaceAll('At DreamsLMS', 'At OUT LMS').replaceAll('dreamslms@example.com', 'lms@out.ac.tz');
fs.writeFileSync('src/feature-module/Pages/privacy-policy/privacyPolicy.tsx', pp);

let tc = fs.readFileSync('src/feature-module/Pages/terms-condition/termsCondition.tsx', 'utf8');
tc = tc.replaceAll('Welcome to DreamsLMS', 'Welcome to OUT LMS').replaceAll('DreamsLMS may update', 'OUT LMS may update');
fs.writeFileSync('src/feature-module/Pages/terms-condition/termsCondition.tsx', tc);

// Referrals
let sr = fs.readFileSync('src/feature-module/student/student-refferal/studentRefferal.tsx', 'utf8');
sr = sr.replaceAll('https://dreamslmscourse.com', 'https://lms.out.ac.tz');
fs.writeFileSync('src/feature-module/student/student-refferal/studentRefferal.tsx', sr);

let srd = fs.readFileSync('src/core/common/data/json/studentRefferalData.tsx', 'utf8');
srd = srd.replaceAll('https://dreamslmscourse.com', 'https://lms.out.ac.tz');
fs.writeFileSync('src/core/common/data/json/studentRefferalData.tsx', srd);

console.log('All text replacements completed successfully!');
