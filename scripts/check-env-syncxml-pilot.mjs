// scripts/check-env-syncxml-pilot.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.example');

const REQUIRED_VARS = [
  'DATABASE_URL',
  'SYNCXML_INTERNAL_API_SECRET',
  'NEXUS_SYNCXML_WEBHOOK_URL',
  'NEXUS_SYNCXML_WEBHOOK_SECRET',
  'SYNCXML_APP_URL',
  'SYNCXML_LOGIN_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SYNCXML_ENABLE_PERSISTENT_STORAGE'
];

function checkEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.example not found');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  let missing = [];

  for (const v of REQUIRED_VARS) {
    const regex = new RegExp(`^${v}=`, 'm');
    if (!regex.test(content)) {
      missing.push(v);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required variables in .env.example:');
    missing.forEach(m => console.error(`  - ${m}`));
    process.exit(1);
  }

  console.log('✅ .env.example has all required variables for SyncXML Pilot.');
}

checkEnv();
