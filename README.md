# Glyphripper

A command-line tool for subsetting and converting fonts to web-friendly formats (WOFF2, WOFF, TTF) while preserving variable font features.


## Features

- Subset fonts to include only the characters you need
- Convert to web-friendly formats (WOFF2, WOFF, TTF)
- Preserve variable font features (weight, width, slant, etc.)
- Generate preview HTML with various weights and sizes
- Interactive character set selection
- Custom character support
- Automatic dependency management

## Prerequisites

- Node.js (v16 or higher)
- Python 3 with venv support
  - macOS: `brew install python3`
  - Windows: Install from Microsoft Store or python.org
  - Linux: `sudo apt install python3 python3-venv`

## Installation

Install globally using npm:

```bash
npm install -g glyphripper
```

Or using yarn:

```bash
yarn global add glyphripper
```

Or pnpm:

```bash
pnpm add -g glyphripper
```

The installation process will automatically:
1. Create a local Python virtual environment in the package directory
2. Install required Python dependencies (fonttools and brotli) in that environment
3. Set up everything needed to run the tool without additional configuration

No manual Python package installation is needed! The tool handles all Python dependencies internally.

## Usage

```bash
glyphripper <font-file> [-o output-directory]
```

Example:
```bash
glyphripper MyFont-Variable.ttf -o output/fonts
```

The tool will prompt you to:
1. Select output formats (WOFF2, WOFF, TTF)
2. Choose character sets to include:
   - Lowercase letters
   - Uppercase letters
   - Numbers
   - Punctuation
   - Currency symbols
   - Whitespace
   - Math symbols
3. Add any custom characters

### Output

The tool will generate:
- Subsetted font files in your chosen formats
- A preview HTML file showing:
  - Selected character sets
  - Custom characters
  - Sample text
  - Size variations
  - Weight variations (for variable fonts)

Files will be output to:
- `output/fonts/` (default) or your specified output directory
- Preview at `output/fonts/preview.html`

## Examples

### Basic usage with default settings
```bash
glyphripper MyFont.ttf
```

### Specify an output directory
```bash
glyphripper MyFont.ttf -o website/fonts
```

### Process a variable font
```bash
glyphripper MyFont-Variable.ttf -o dist/assets
```

## How it works

Glyphripper uses:
1. A Python virtual environment to run FontTools (a powerful Python library for font manipulation)
2. Node.js for the CLI interface and user experience
3. Automatic configuration and dependency management for a smooth experience

The tool:
1. Creates a subset of your font with only the characters you need
2. Preserves important OpenType features like ligatures and variable font axes
3. Converts the font to web-optimized formats
4. Generates a preview HTML so you can see the results immediately

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python 3 is installed and available in your PATH
   - On Windows, install Python from the Microsoft Store or python.org
   - On macOS: `brew install python3`
   - On Linux: `sudo apt install python3 python3-venv`

2. **Permission errors during installation**
   - Try running with sudo: `sudo npm install -g glyphripper`
   - Or fix npm permissions: [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

3. **Font loading errors in preview**
   - Check browser console for network errors
   - Ensure the font files were generated successfully
   - Verify the font paths in the preview HTML

4. **Python dependency installation fails**
   - Manual fix: `cd <npm-global>/lib/node_modules/glyphripper && node scripts/check-dependencies.js`
   - Check your Python installation: `python3 --version` (should be 3.6+)
   - Ensure you have venv module: `python3 -m venv --help`

5. **Command not found after installation**
   - Make sure your npm global bin directory is in your PATH
   - Try installing with `npm install -g glyphripper --unsafe-perm`

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/glyphripper.git
cd glyphripper
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

4. Link for local development:
```bash
npm link
```

## Pre-publishing Checklist

Before publishing to npm, ensure:

1. The `package.json` has:
   - Correct version number
   - Appropriate author and repository information
   - All required files listed in the `files` array

2. Test the package locally:
   ```bash
   npm pack
   npm install -g glyphripper-1.0.0.tgz
   ```

3. Verify installation works on a clean system

4. Publish:
   ```bash
   npm login
   npm publish
   ```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request