import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_VERSION: packageJson.version
  }
};

export default nextConfig;
