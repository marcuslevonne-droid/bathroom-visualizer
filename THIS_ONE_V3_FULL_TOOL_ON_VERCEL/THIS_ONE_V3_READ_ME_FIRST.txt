THIS ONE V3 — FULL TOOL SHOWS ON VERCEL

This version makes Vercel show the actual visualizer on the homepage, like your old tool did.

Deploy the whole folder to Vercel.

After deploy:
1. Add OPENAI_API_KEY in Vercel Environment Variables.
2. Redeploy.
3. Click Visit. You should see the full visualizer, not just an API status page.
4. In GoHighLevel, paste the iframe code below and replace the URL with your Vercel domain.

GHL IFRAME CODE:

<div id="uplift-ai-visualizer-embed">
  <style>
    #uplift-ai-visualizer-embed {
      width: 100%;
      padding: 14px 10px;
      background: #f0f7fd;
      box-sizing: border-box;
    }
    #uplift-ai-visualizer-embed * {
      box-sizing: border-box;
    }
    .uplift-ai-visualizer-wrap {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 16px 45px rgba(3, 32, 59, 0.08);
      border: 1px solid rgba(3, 32, 59, 0.08);
    }
    .uplift-ai-visualizer-frame {
      display: block;
      width: 100%;
      height: 1250px;
      border: 0;
      background: #f0f7fd;
    }
    @media (max-width: 768px) {
      #uplift-ai-visualizer-embed {
        padding: 12px 6px;
      }
      .uplift-ai-visualizer-frame {
        height: 1450px;
      }
    }
    @media (max-width: 480px) {
      #uplift-ai-visualizer-embed {
        padding: 10px 0;
      }
      .uplift-ai-visualizer-wrap {
        border-radius: 18px;
        border-left: 0;
        border-right: 0;
      }
      .uplift-ai-visualizer-frame {
        height: 1550px;
      }
    }
  </style>

  <div class="uplift-ai-visualizer-wrap">
    <iframe
      class="uplift-ai-visualizer-frame"
      src="https://PASTE-YOUR-VERCEL-DOMAIN-HERE.vercel.app"
      title="AI Bathroom Remodel Visualizer"
      allow="camera; microphone; clipboard-write"
    ></iframe>
  </div>
</div>
