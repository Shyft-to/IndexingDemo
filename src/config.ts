import 'dotenv/config';
export const configuration = () => ({
  API_KEY: process.env.API_KEY,
  SHFYFT_BASE_URI: process.env.SHFYFT_BASE_URI,
  CANDY_MACHINE_ID: process.env.CANDY_MACHINE_ID,
  CANDY_AUTHORITY: process.env.CANDY_AUTHORITY,
});
