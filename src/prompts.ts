import inquirer from 'inquirer';
import { CHAR_SETS } from './charsets';

export interface PromptResponses {
  licenseConfirm: boolean;
  formats: string[];
  selectedSets: string[];
  customChars: string;
}

export async function prompts(): Promise<PromptResponses> {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'licenseConfirm',
      message: 'By continuing, you confirm that you have the necessary rights and licenses to subset and use this font. Do you have the appropriate license to use this font?',
      default: false
    },
    {
      type: 'checkbox',
      name: 'formats',
      message: 'Select output formats:',
      default: ['woff2', 'woff'],
      choices: [
        { name: 'WOFF2', value: 'woff2' },
        { name: 'WOFF', value: 'woff' },
        { name: 'TTF', value: 'ttf' }
      ],
      when: (answers) => answers.licenseConfirm
    },
    {
      type: 'checkbox',
      name: 'selectedSets',
      message: 'Select character sets to include:',
      choices: Object.entries(CHAR_SETS).map(([key, value]) => ({
        name: `${key} (${value})`,
        value: key
      })),
      default: ['lowercase', 'uppercase', 'numbers'],
      when: (answers) => answers.licenseConfirm
    },
    {
      type: 'input',
      name: 'customChars',
      message: 'Enter any additional characters to include (optional):',
      default: '',
      when: (answers) => answers.licenseConfirm
    }
  ] as const) as Promise<PromptResponses>;
}