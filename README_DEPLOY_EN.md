L'Oréal Chatbot — Deploy & Verify Guide (English)
================================================

This package contains:
- Frontend: index.html, styles.css, script.js, config.js (WORKER_URL already set to https://openaiapikey.hangqi39.workers.dev)
- RESOURCE_cloudflare-worker.js : helper Worker script (classic service-worker style)
- Instructions below for Dashboard and Wrangler deployment & verification.

SECURITY FIRST:
- DO NOT put your OpenAI API key in frontend files.
- Store OpenAI API key as a Cloudflare Worker secret named OPENAI_API_KEY.

A. Deploy using Cloudflare Dashboard (Quick Edit)
1. Go to Cloudflare Dashboard -> Compute & AI -> Workers & Pages -> Workers -> Create a Worker (or open your existing worker).
2. In the editor, paste the contents of RESOURCE_cloudflare-worker.js.
3. Save & Deploy.
4. In the Worker page -> Settings -> Variables & Secrets -> Add secret:
   - Name: OPENAI_API_KEY
   - Value: <your new OpenAI API key>
   (Optional) Add FRONTEND_SECRET if you want to check x-project-secret header.
5. Test with curl (see verification below).

B. Deploy using Wrangler (CLI)
1. Install Wrangler: npm install -g wrangler
2. Login: wrangler login
3. Create project:
   mkdir loreal-worker && cd loreal-worker
   # create src/index.js and paste RESOURCE_cloudflare-worker.js contents into it
   # create wrangler.toml with:
   # name = "loreal-openai-proxy-worker"
   # main = "src/index.js"
   # compatibility_date = "2025-10-31"
4. Add secret:
   wrangler secret put OPENAI_API_KEY
   # paste key when prompted
5. Deploy:
   wrangler deploy
   # or wrangler publish (depending on version)

C. Frontend is already configured
- script.js sends POST to WORKER_URL from config.js and includes x-project-secret header if FRONTEND_SECRET is set.

D. Verify end-to-end
1. Curl test:
   curl -i -X POST "https://openaiapikey.hangqi39.workers.dev" \
     -H "Content-Type: application/json" \
     -H "Origin: https://your-frontend-domain" \
     -H "x-project-secret: <if-set-your-frontend-secret>" \
     -d '{"messages":[{"role":"system","content":"You are a helpful assistant about L\'Oréal products."},{"role":"user","content":"What is a serum?"}]}'

2. Browser test: open the frontend index.html (or your GitHub Pages URL) and ask a question in the UI. If everything works you should see model replies.

E. Debugging tips
- 403 from Worker: check FRONTEND_SECRET or Origin validation.
- 401 from OpenAI: check that OPENAI_API_KEY secret is set and Worker can read it.
- CORS errors: ensure Worker responds to OPTIONS with Access-Control-Allow-Origin header.
- Use Cloudflare Workers' logs / dashboard to inspect request/response details.

If you'd like, run the curl tests and paste the exact output here — I will analyze and help fix any issues.
