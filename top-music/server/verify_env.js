import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from correct path
// We assume execution from project root "top-music"
const envPath = path.join(process.cwd(), 'server', '.env');
const result = dotenv.config({ path: envPath });

const output = [];
output.push(`Current Working Directory: ${process.cwd()}`);
output.push(`Target .env Path: ${envPath}`);
output.push(`Dotenv Parse Error: ${result.error ? result.error.message : 'None'}`);

output.push('--- Variables ---');
output.push(`SPOTIFY_CLIENT_ID: ${process.env.SPOTIFY_CLIENT_ID ? 'Present (' + process.env.SPOTIFY_CLIENT_ID.substring(0, 4) + '...)' : 'MISSING'}`);
output.push(`SPOTIFY_CLIENT_SECRET: ${process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'MISSING'}`);
output.push(`SPOTIFY_REDIRECT_URI: ${process.env.SPOTIFY_REDIRECT_URI || 'MISSING'}`);

// Also try loading from current directory just in case
if (!process.env.SPOTIFY_CLIENT_ID) {
    output.push('... Retrying with default .env lookup ...');
    dotenv.config();
    output.push(`SPOTIFY_CLIENT_ID (retry): ${process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Still MISSING'}`);
}

const outputPath = path.join(__dirname, 'env_status.txt');
fs.writeFileSync(outputPath, output.join('\n'));
console.log('Verification complete. Output written to ' + outputPath);
