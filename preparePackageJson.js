const fs = require('fs');
const path = require('path');

// Specify the path to the original package.json and the output directory
const originalPackageJsonPath = path.join(__dirname, '.', 'package.json');
const outputDir = path.join(__dirname, '.', 'dist');
const outputPackageJsonPath = path.join(outputDir, 'package.json');

// Read the original package.json
fs.readFile(originalPackageJsonPath, (err, data) => {
  if (err) {
    console.error('Failed to read package.json:', err);
    return;
  }

  try {
    const packageJson = JSON.parse(data);

    // Remove development-only scripts and devDependencies
    delete packageJson.scripts['build'];
    delete packageJson.scripts['build:ts'];
    delete packageJson.scripts['build:js'];
    delete packageJson.scripts['serve'];
    delete packageJson.scripts['deploy'];
    delete packageJson.devDependencies;

    // Optionally, adjust the main script path if necessary
    packageJson.main = 'index.js';

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write the new package.json to the output directory
    fs.writeFile(outputPackageJsonPath, JSON.stringify(packageJson, null, 2), (err) => {
      if (err) {
        console.error('Failed to write new package.json:', err);
      } else {
        console.log('package.json has been prepared for production.');
      }
    });
  } catch (parseErr) {
    console.error('Failed to parse package.json:', parseErr);
  }
});
