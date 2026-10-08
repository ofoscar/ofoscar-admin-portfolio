import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) {
  loadEnvFile('.env');
}

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  throw new Error('Missing API_URL environment variable');
}

const outputPath = 'src/environments/environment.ts';

mkdirSync('src/environments', { recursive: true });

writeFileSync(
  outputPath,
  `export const environment = {
  apiUrl: ${JSON.stringify(apiUrl)}
};
`,
);

console.log('Angular environment generated successfully');
