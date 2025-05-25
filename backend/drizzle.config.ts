import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
// import { InfisicalSDK } from '@infisical/sdk';

// const client = new InfisicalSDK({
//   siteUrl: process.env.SITE_URL,
// })

// const token = await client.auth().universalAuth.login({
//   clientId: process.env.INFISICAL_EMAIL!,
//   clientSecret: process.env.INFISICAL_PASSWORD!,
// });

// const allSecrets = await client.secrets().listSecrets

export default defineConfig({
  out: './src/drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.ZECRETLY_DB_CONNECTION_URI!,
  },
});

