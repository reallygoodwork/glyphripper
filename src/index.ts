#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { CHAR_SETS } from './charsets';
import { generatePreviewHTML } from './templates';
import { prompts } from './prompts';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENV_PATH = join(__dirname, '..', '.venv');
const isWindows = process.platform === 'win32';

// Get the Python executable path
const PYTHON_PATH = isWindows
  ? join(VENV_PATH, 'Scripts', 'python.exe')
  : join(VENV_PATH, 'bin', 'python3');

// Check if dependencies are installed
function checkDependencies() {
  try {
    // Run the dependency installation script if needed
    if (!fs.existsSync(VENV_PATH)) {
      console.log('Python virtual environment not found. Installing dependencies...');
      const scriptsDir = join(__dirname, '..', 'scripts');
      execSync(`node ${join(scriptsDir, 'check-dependencies.js')}`, { stdio: 'inherit' });
    }

    // Verify the Python executable exists
    if (!fs.existsSync(PYTHON_PATH)) {
      throw new Error(`Python executable not found at ${PYTHON_PATH}`);
    }

    // Try to import fontTools to verify dependencies are installed
    try {
      execSync(`"${PYTHON_PATH}" -c "import fontTools.ttLib; import brotli"`, {
        stdio: 'pipe'
      });
    } catch (error) {
      console.log('Python dependencies not found. Installing dependencies...');
      const scriptsDir = join(__dirname, '..', 'scripts');
      execSync(`node ${join(scriptsDir, 'check-dependencies.js')}`, { stdio: 'inherit' });

      // Verify again
      try {
        execSync(`"${PYTHON_PATH}" -c "import fontTools.ttLib; import brotli"`, {
          stdio: 'pipe'
        });
      } catch (verifyError) {
        throw new Error(`Failed to install required Python dependencies. Please try manually running: npm run setup`);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error checking dependencies:', error.message);
    } else {
      console.error('Unknown error checking dependencies');
    }
    process.exit(1);
  }
}

// Get the site-packages directory
const SITE_PACKAGES = (() => {
  try {
    const envInfo = JSON.parse(fs.readFileSync(join(VENV_PATH, 'env-info.json'), 'utf8'));
    return envInfo.sitePkgsPath;
  } catch (error) {
    // Fallback to default paths if env-info.json doesn't exist
    if (isWindows) {
      return join(VENV_PATH, 'Lib', 'site-packages');
    }
    try {
      // Try to detect Python version from the virtual environment
      const pythonVersion = execSync(`"${PYTHON_PATH}" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"`, {
        encoding: 'utf8'
      }).trim();
      return join(VENV_PATH, 'lib', `python${pythonVersion}`, 'site-packages');
    } catch (fallbackError) {
      console.error('Failed to detect Python version:', fallbackError);
      // Last resort fallback
      return join(VENV_PATH, 'lib', 'python3.8', 'site-packages');
    }
  }
})();

// Helper function to run Python commands in the virtual environment
function runPython(command: string): void {
  // If the command is a full script path, make sure it exists
  if (command.startsWith('"') && command.includes('.py"')) {
    const scriptPath = command.split('"')[1];
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
  }

  try {
    execSync(`"${PYTHON_PATH}" ${command}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        // Use -m pip to ensure the correct pip is used
        PIP_USER: '0'
      }
    });
  } catch (error: any) {
    console.error('Command failed:', `"${PYTHON_PATH}" ${command}`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    const packageInfo = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(`\n🔤 Glyphripper v${packageInfo.version}\n`);
    console.log('A command-line tool for subsetting and converting fonts to web-friendly formats.');
    console.log('\nUsage:');
    console.log('  glyphripper <font-file> [-o output-directory]\n');
    console.log('Options:');
    console.log('  -o, --output    Specify output directory (default: ./output)');
    console.log('  -h, --help      Show this help message\n');
    console.log('Example:');
    console.log('  glyphripper MyFont-Variable.ttf -o website/fonts\n');

    if (args.length === 0) {
      console.error('Error: Please provide a font file path.');
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  // Check for output directory flag
  let outputDir = './output';
  const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputDir = args[outputIndex + 1];
  }

  // Ensure dependencies are installed before continuing
  checkDependencies();

  // Update the font path to be absolute if it's not already
  const fontPath = path.isAbsolute(args[0]) ? args[0] : path.resolve(args[0]);

  if (!fs.existsSync(fontPath)) {
    console.error(`Font file not found: ${fontPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const responses = await prompts();

  // Exit if license not confirmed
  if (!responses.licenseConfirm) {
    console.log('\n⚠️  Processing canceled. You must have appropriate license rights to subset and use the font.');
    console.log('Please check the font license or contact the font creator for more information.');
    process.exit(0);
  }

  const { formats, selectedSets, customChars } = responses;

  const fontName = path.basename(fontPath, path.extname(fontPath));
  const outputPath = path.join(outputDir, fontName);

  // Create a temporary directory for fonttools output
  const tempDir = path.join(outputDir, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Combine selected character sets and custom characters
  const allChars = new Set<string>();
  selectedSets.forEach(setName => {
    const chars = CHAR_SETS[setName as keyof typeof CHAR_SETS];
    chars.split('').forEach(char => allChars.add(char));
  });

  // Add custom characters
  if (customChars) {
    customChars.split('').forEach(char => allChars.add(char));
  }

  const unicodes = Array.from(allChars).map((char: string) => char.codePointAt(0)?.toString(16).padStart(4, '0')).join(',');
  const subsetPath = path.join(tempDir, `${fontName}-subset.ttf`);

  // Detect if the font is variable by checking for the 'fvar' table
  let isVariableFont = false;
  try {
    const hasFvarTable = execSync(`"${PYTHON_PATH}" -c "from fontTools.ttLib import TTFont; font = TTFont('${fontPath}'); print('fvar' in font)"`, {
      encoding: 'utf8'
    }).trim();
    isVariableFont = hasFvarTable === 'True';
    console.log(`Font ${isVariableFont ? 'is' : 'is not'} a variable font.`);
  } catch (error) {
    console.log('Could not detect variable font features. Assuming standard font.');
  }

  try {
    // First, create a basic subset with just the characters and essential features
    runPython(`"${join(__dirname, 'subset.py')}" "${fontPath}" "${subsetPath}" "${unicodes}"`);

    // Convert to web formats
    if (formats.includes('woff2')) {
      runPython(`-c "from fontTools.ttLib import TTFont; f = TTFont('${subsetPath}'); f.flavor = 'woff2'; f.save('${outputPath}-subset.woff2')"`);
    }
    if (formats.includes('woff')) {
      runPython(`-c "from fontTools.ttLib import TTFont; f = TTFont('${subsetPath}'); f.flavor = 'woff'; f.save('${outputPath}-subset.woff')"`);
    }
    if (formats.includes('ttf')) {
      fs.copyFileSync(subsetPath, `${outputPath}-subset.ttf`);
    }
  } catch (error) {
    console.error('Error processing font:', error);
    process.exit(1);
  }

  // Clean up temporary directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Generate preview HTML
  const previewPath = path.join(outputDir, 'preview.html');
  const previewContent = generatePreviewHTML(fontName, formats, selectedSets, customChars, isVariableFont);
  fs.writeFileSync(previewPath, previewContent);

  console.log('Font files generated successfully!');
  console.log(`Preview available at: ${previewPath}`);
}

main().catch(console.error);
