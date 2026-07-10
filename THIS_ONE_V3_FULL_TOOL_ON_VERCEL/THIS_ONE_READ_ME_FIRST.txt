THIS ONE — SIMPLE INSTALL STEPS

Use this V2 zip instead of the earlier one.

WHAT THIS ZIP FIXES:
- Adds a homepage so Vercel will NOT show Not Found at the root.
- Uses a simple Vercel API route: api/generate-bathroom.js
- Includes package.json so Vercel installs the OpenAI SDK.
- Keeps the California Bathrooms logo removed.
- Keeps the GoHighLevel code clearly marked as THIS ONE.

STEP 1 — Deploy this whole unzipped folder to Vercel
Do not upload only one file. Upload the whole folder/zip contents.

STEP 2 — Add environment variable in Vercel
Key:
OPENAI_API_KEY

Value:
your OpenAI API key

Environment:
Production and Preview

Save it.

STEP 3 — Redeploy
After saving the environment variable, redeploy the Vercel project.

STEP 4 — Test the API is live
Open:
https://YOUR-VERCEL-DOMAIN.vercel.app/api/generate-bathroom

It should show a JSON message like:
{"ok":true,"message":"THIS ONE API is live..."}

If it shows 404, the files were not uploaded/deployed correctly.

STEP 5 — Update the GoHighLevel HTML
Open:
ghl-code/THIS_ONE_no_logo_visualizer_gohighlevel.html

Find:
const GENERATE_API_URL = "PASTE_YOUR_VERCEL_API_URL_HERE";

Replace with:
const GENERATE_API_URL = "https://YOUR-VERCEL-DOMAIN.vercel.app/api/generate-bathroom";

STEP 6 — Paste the updated HTML into GoHighLevel.
