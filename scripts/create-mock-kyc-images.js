const fs = require('fs');

const frontSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'>
  <defs>
    <linearGradient id='cardBg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#0f2027'/>
      <stop offset='50%' stop-color='#203a43'/>
      <stop offset='100%' stop-color='#2c5364'/>
    </linearGradient>
    <linearGradient id='gold' x1='0%' y1='0%' x2='100%' y2='0%'>
      <stop offset='0%' stop-color='#d4af37'/>
      <stop offset='100%' stop-color='#f3e5ab'/>
    </linearGradient>
  </defs>
  <rect width='600' height='380' rx='20' fill='url(#cardBg)' stroke='#d4af37' stroke-width='2'/>
  <rect x='15' y='15' width='570' height='350' rx='14' fill='none' stroke='rgba(212,175,55,0.2)' stroke-width='1' stroke-dasharray='4,4'/>
  
  <!-- Header -->
  <text x='560' y='50' fill='url(#gold)' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='end'>الجمهورية العربية السورية</text>
  <text x='560' y='75' fill='#94a3b8' font-family='sans-serif' font-size='14' text-anchor='end'>وزارة الداخلية - البطاقة الشخصية</text>
  <text x='40' y='55' fill='#06b6d4' font-family='monospace' font-size='15' font-weight='bold'>SYRIAN ARAB REPUBLIC</text>
  <line x1='30' y1='90' x2='570' y2='90' stroke='rgba(212,175,55,0.3)' stroke-width='1.5'/>

  <!-- Photo Box -->
  <rect x='40' y='110' width='130' height='170' rx='10' fill='#13253a' stroke='#06b6d4' stroke-width='1.5'/>
  <circle cx='105' cy='165' r='35' fill='#1e3a5f'/>
  <path d='M65 255 C65 210, 145 210, 145 255' fill='#1e3a5f'/>
  <text x='105' y='275' fill='#64748b' font-family='sans-serif' font-size='11' text-anchor='middle'>صورة شخصية</text>

  <!-- Info Fields -->
  <g font-family='sans-serif' font-size='13' fill='#e2e8f0' text-anchor='end'>
    <text x='550' y='135' fill='#94a3b8'>الاسم الكامل:</text>
    <text x='550' y='160' font-weight='bold' font-size='16' fill='#ffffff'>خالد عمر الشامي</text>

    <text x='550' y='195' fill='#94a3b8'>اسم الأب والأم:</text>
    <text x='550' y='218' font-weight='bold'>عمر / مريم</text>

    <text x='550' y='250' fill='#94a3b8'>مكان وتاريخ الولادة:</text>
    <text x='550' y='272' font-weight='bold'>دمشق - 14/05/1994</text>

    <text x='550' y='305' fill='#94a3b8'>الرقم الوطني:</text>
    <text x='550' y='330' font-weight='bold' font-family='monospace' font-size='18' fill='#d4af37'>01040506070</text>
  </g>

  <!-- Security Hologram Badge -->
  <rect x='200' y='300' width='120' height='35' rx='6' fill='rgba(6,182,212,0.1)' stroke='#06b6d4' stroke-width='1'/>
  <text x='260' y='322' fill='#06b6d4' font-family='monospace' font-size='11' font-weight='bold' text-anchor='middle'>VERIFIED ID-SY</text>
</svg>`;

const backSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'>
  <defs>
    <linearGradient id='cardBgBack' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#0f2027'/>
      <stop offset='50%' stop-color='#203a43'/>
      <stop offset='100%' stop-color='#2c5364'/>
    </linearGradient>
  </defs>
  <rect width='600' height='380' rx='20' fill='url(#cardBgBack)' stroke='#06b6d4' stroke-width='2'/>
  <rect x='15' y='15' width='570' height='350' rx='14' fill='none' stroke='rgba(6,182,212,0.2)' stroke-width='1' stroke-dasharray='4,4'/>
  
  <text x='560' y='50' fill='#06b6d4' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='end'>بيانات القيد والعنوان - الجمهورية العربية السورية</text>
  <line x1='30' y1='70' x2='570' y2='70' stroke='rgba(6,182,212,0.3)' stroke-width='1'/>

  <g font-family='sans-serif' font-size='13' fill='#e2e8f0' text-anchor='end'>
    <text x='550' y='105' fill='#94a3b8'>القيد والخانة:</text>
    <text x='550' y='128' font-weight='bold'>دمشق - شاغور جواني / خ 142</text>

    <text x='550' y='165' fill='#94a3b8'>العنوان السكني:</text>
    <text x='550' y='188' font-weight='bold'>محافظة دمشق - الميدان الفوقاني</text>

    <text x='550' y='225' fill='#94a3b8'>تاريخ الإصدار والانتهاء:</text>
    <text x='550' y='248' font-weight='bold' font-family='monospace'>2022-01-10 / 2032-01-10</text>
  </g>

  <!-- MRZ Machine Readable Zone -->
  <rect x='30' y='280' width='540' height='65' rx='6' fill='#070e17' stroke='rgba(255,255,255,0.1)' stroke-width='1'/>
  <text x='50' y='308' fill='#94a3b8' font-family='monospace' font-size='15'>I&lt;SYR01040506070&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  <text x='50' y='332' fill='#94a3b8' font-family='monospace' font-size='15'>9405142M3201108SYR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;5KHALED&lt;&lt;</text>
</svg>`;

const selfieSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>
  <rect width='400' height='400' rx='20' fill='#0d1b2a' stroke='#d4af37' stroke-width='2'/>
  <circle cx='200' cy='160' r='60' fill='#1e3a5f' stroke='#06b6d4' stroke-width='2'/>
  <path d='M110 320 C110 240, 290 240, 290 320' fill='#1e3a5f' stroke='#06b6d4' stroke-width='2'/>
  <rect x='210' y='220' width='130' height='80' rx='8' fill='#13253a' stroke='#d4af37' stroke-width='1.5'/>
  <text x='275' y='265' fill='#d4af37' font-family='sans-serif' font-size='10' text-anchor='middle'>هوية وطنية</text>
  <text x='200' y='360' fill='#e2e8f0' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>سيلفي مع الهوية الشخصية</text>
</svg>`;

fs.writeFileSync('public/images/kyc_mock_front.svg', frontSvg);
fs.writeFileSync('public/images/kyc_mock_back.svg', backSvg);
fs.writeFileSync('public/images/kyc_mock_selfie.svg', selfieSvg);

fs.writeFileSync('public/images/kyc_mock_front.jpg', frontSvg);
fs.writeFileSync('public/images/kyc_mock_back.jpg', backSvg);
fs.writeFileSync('public/images/kyc_mock_selfie.jpg', selfieSvg);

console.log('Mock KYC images created successfully.');
