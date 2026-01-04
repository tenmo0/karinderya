const fs = require('fs');
const path = require('path');

console.log('\n=== CHECKING FILE STRUCTURE ===\n');

// Check if public folder exists
const publicDir = path.join(__dirname, 'public');
console.log('Checking for public folder at:', publicDir);

if (fs.existsSync(publicDir)) {
  console.log('✅ public folder EXISTS\n');
  
  // List all files in public
  console.log('Files in public folder:');
  const files = fs.readdirSync(publicDir);
  
  if (files.length === 0) {
    console.log('❌ No files found in public folder!\n');
  } else {
    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file} (${stats.size} bytes)`);
    });
  }
  
  // Check specifically for required images
  console.log('\nChecking for required images:');
  const requiredImages = ['caldereta.png', 'adobo.png', 'chicken.png', 'tonkatsu.png'];
  
  requiredImages.forEach(img => {
    const imgPath = path.join(publicDir, img);
    if (fs.existsSync(imgPath)) {
      console.log(`  ✅ ${img} found`);
    } else {
      console.log(`  ❌ ${img} NOT FOUND`);
    }
  });
  
} else {
  console.log('❌ public folder DOES NOT EXIST!\n');
  console.log('Please create a "public" folder in the same directory as this script.\n');
}

console.log('\n=== END ===\n');