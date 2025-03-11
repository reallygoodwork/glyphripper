#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENV_PATH = join(__dirname, '..', '.venv');
const isWindows = process.platform === 'win32';

const PYTHON_CMD = isWindows ? 'python' : 'python3';
const PYTHON_PATH = isWindows
  ? join(VENV_PATH, 'Scripts', 'python.exe')
  : join(VENV_PATH, 'bin', 'python3');

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function createVirtualEnv() {
  console.log('Creating Python virtual environment...');
  try {
    // Remove existing venv if it exists
    if (existsSync(VENV_PATH)) {
      console.log('Removing existing virtual environment...');
      if (isWindows) {
        execSync(`rmdir /s /q "${VENV_PATH}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${VENV_PATH}"`, { stdio: 'inherit' });
      }
    }

    // Create new venv
    execSync(`${PYTHON_CMD} -m venv "${VENV_PATH}"`, { stdio: 'inherit' });
    console.log('✅ Virtual environment created successfully');

    // Upgrade pip in the virtual environment
    execSync(`"${PYTHON_PATH}" -m pip install --upgrade pip`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to create virtual environment:', error.message);
    process.exit(1);
  }
}

function installPythonDependencies() {
  console.log('Installing Python dependencies...');
  try {
    // Install fonttools with brotli in the virtual environment
    execSync(`"${PYTHON_PATH}" -m pip install "fonttools[woff,unicode]" brotli`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');

    // Get Python version from the virtual environment
    const pythonVersion = execSync(`"${PYTHON_PATH}" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"`, {
      encoding: 'utf8'
    }).trim();

    // Get the site-packages directory
    const SITE_PACKAGES = isWindows
      ? join(VENV_PATH, 'Lib', 'site-packages')
      : join(VENV_PATH, 'lib', `python${pythonVersion}`, 'site-packages');

    // Verify site-packages exists
    if (!existsSync(SITE_PACKAGES)) {
      throw new Error('site-packages directory not found after installation');
    }

    // Save the Python version and site-packages path for later use
    const envInfo = {
      pythonVersion,
      sitePkgsPath: SITE_PACKAGES
    };
    writeFileSync(join(VENV_PATH, 'env-info.json'), JSON.stringify(envInfo, null, 2));

    // Verify fonttools installation
    execSync(`"${PYTHON_PATH}" -c "import fontTools.ttLib; import brotli"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONPATH: SITE_PACKAGES,
        VIRTUAL_ENV: VENV_PATH,
        PATH: `${dirname(PYTHON_PATH)}${isWindows ? ';' : ':'}${process.env.PATH}`
      }
    });
    console.log('✅ Dependencies verified successfully');
  } catch (error) {
    console.error('❌ Failed to install Python dependencies:', error.message);
    process.exit(1);
  }
}

// Check Python
if (!checkCommand(PYTHON_CMD)) {
  console.error(`❌ ${PYTHON_CMD} is required but not found. Please install Python 3 and try again.`);
  console.error('macOS: brew install python3');
  console.error('Windows: Install from Microsoft Store or python.org');
  console.error('Linux: sudo apt install python3 python3-venv');
  process.exit(1);
}

// Create virtual environment and install dependencies
createVirtualEnv();
installPythonDependencies();

console.log('✨ All dependencies are installed and ready to use!');