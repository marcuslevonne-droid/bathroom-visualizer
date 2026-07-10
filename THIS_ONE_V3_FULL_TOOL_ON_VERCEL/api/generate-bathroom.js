import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Single source of truth for the model. Override in Vercel env if needed.
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

function sendCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL.");
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function clean(value, fallback = "") {
  return (value || "").toString().trim() || fallback;
}

function buildBathroomPrompt({ project, style, finish, pattern, features = [], notes = "" }) {
  const featureList = Array.isArray(features) ? features.filter(Boolean) : [];

  const projectRules =
    project === "Tub-to-shower conversion" ? `
- Remove the existing tub and convert it into a walk-in shower in the same location.
- Preserve the same bathroom layout and viewpoint.
- Focus the remodel on the wet area only.
- Use a clean easy-entry shower base.
` : project === "Walk-in shower remodel" ? `
- Keep the shower in the same location and same orientation.
- Remodel the shower walls, base, and fixtures only.
- Preserve the room layout and perspective.
` : project === "Accessible shower" ? `
- Create a safer accessible shower in the same wet-area location.
- Prioritize low-threshold or barrier-free entry.
- Keep it attractive, modern, and realistic.
` : project === "Tub and shower combo" ? `
- Keep a tub/shower combo.
- Do not remove the tub.
- Update the surround, fixtures, and finish selections while keeping the same layout.
` : `
- Remodel only the relevant wet area while preserving the bathroom layout.
`;

  const styleRules =
    style === "Modern spa" ? `
- Clean, bright, airy, relaxing.
- Crisp lines and a calm premium feel.
- Minimal clutter.
` : style === "Luxury hotel" ? `
- Upscale, polished, elegant, and refined.
- Premium materials and a more elevated look.
` : style === "Coastal bright" ? `
- Light, bright, airy, fresh Southern California feel.
- Inviting and clean.
` : style === "Warm organic" ? `
- Warm neutrals, soft natural tones, earthy and inviting.
` : `
- Apply the custom requested style: "${style}".
- Interpret it tastefully and keep it realistic and consistent throughout the wet area.
`;

  const finishRules =
    !finish ? "No specific wall finish was selected. Choose a tasteful wall finish that naturally complements the selected style."
    : finish === "Santorini White" ? "Use a bright clean white wall finish with a fresh crisp appearance."
    : finish === "Napoli Marble" ? "Use a soft white marble-look finish with subtle gray movement and a premium feel."
    : finish === "Sierra Sand" ? "Use a warm beige stone-look finish with soft sandy tones."
    : finish === "Glacier Ice" ? "Use a cool light gray stone-look finish with a modern spa appearance."
    : finish === "Tuscany" ? "Use a warm neutral finish with a classic soft beige/tan character."
    : finish === "Black Accent" ? "Use tasteful black accent elements for a luxury contrast look."
    : `Use the custom requested wall finish: ${finish}.`;

  const patternRules =
    !pattern ? "No specific wall pattern was selected. Choose a clean wall pattern that suits the selected style."
    : pattern === "Smooth wall pattern" ? "Use a smooth clean wall-panel appearance."
    : pattern === "Subway tile pattern" ? "Use a subway tile-inspired wall pattern."
    : pattern === "Chevron wall pattern" ? "Use a chevron-inspired wall pattern."
    : pattern === "Herringbone wall pattern" ? "Use a herringbone-inspired wall pattern."
    : pattern === "Hexagon wall pattern" ? "Use a hexagon-inspired wall pattern."
    : pattern === "Piazza stone pattern" ? "Use a stone-inspired Piazza-style wall pattern."
    : `Use the custom requested wall pattern: ${pattern}.`;

  const featureRules = [
    featureList.includes("Glass enclosure") ? "- Add a clean glass enclosure or glass shower door if appropriate." : "",
    featureList.includes("Rain shower fixture") ? "- Include a rain shower fixture." : "",
    featureList.includes("Handheld shower") ? "- Include a handheld shower fixture." : "",
    featureList.includes("Built-in seat") ? "- Include a built-in shower seat if it fits naturally." : "",
    featureList.includes("Grab bars") ? "- Include grab bars in a tasteful realistic way." : "",
    featureList.includes("Shower niche") ? "- Include a built-in shower niche." : "",
  ].filter(Boolean).join("\n") || "- No extra features beyond the selected remodel style.";

  return `
Create a photorealistic bathroom remodel visualization by EDITING the uploaded bathroom photo.

THIS IS A PHOTO EDIT, NOT A NEW IMAGE:
- Start from the uploaded photo and change as little as possible.
- Preserve the EXACT same camera angle, perspective, composition, framing, crop, zoom, and room orientation as the original photo.
- Do not generate a new angle. Do not rotate the room. Do not move or zoom the camera.
- The final result must look like the SAME bathroom, in the SAME photo, simply remodeled.

DO NOT CHANGE (keep identical to the original photo):
- The room layout, floor plan, wall positions, ceiling, and room dimensions.
- The toilet, vanity, sink, faucet, mirror, cabinets, windows, doors, flooring, and their exact positions — unless one of them is physically inside the wet area being remodeled.
- The lighting direction, shadows, and white balance.
- Do NOT add windows, vanities, mirrors, lights, plants, towels, or decor that were not already in the original photo.

ONLY CHANGE:
- The tub/shower wet area, and only in the ways required by the selected remodel options below.

REALISM AND CORRECTNESS RULES (strictly avoid these common mistakes):
- Every fixture must be in a physically correct, real-world location.
- Shower heads, controls, valves, and handles belong ONLY on shower walls or glass doors, at realistic mounting heights.
- NEVER attach a handle, faucet, shower head, grab bar, or any shower part to the toilet, toilet seat, sink, vanity, mirror, floor, or ceiling.
- Do not merge fixtures together. No floating, duplicated, half-formed, or distorted fixtures.
- Keep all walls straight and vertical. Tile and panel patterns must be evenly aligned and follow the correct perspective of the room. No warped, bent, or melted geometry.
- Glass panels must be flat, clear, and properly framed with realistic hardware.
- Grab bars and seats must be mounted flat against shower walls at realistic heights.
- The remodel must be plausible and buildable — like a professional contractor's finished work photographed for a portfolio.
- Everything outside the wet area must remain pixel-faithful to the original photo.

PROJECT TYPE:
${project}

PROJECT RULES:
${projectRules}

STYLE:
${style}

STYLE RULES:
${styleRules}

WALL FINISH:
${finish || "Designer's choice — complement the selected style."}

FINISH RULES:
${finishRules}

WALL PATTERN:
${pattern || "Designer's choice — suit the selected style."}

PATTERN RULES:
${patternRules}

SELECTED FEATURES:
${featureList.length ? featureList.join(", ") : "No extra features selected."}

FEATURE RULES:
${featureRules}

ADDITIONAL USER NOTES:
${notes || "None."}

FINAL GOAL:
Return a photorealistic remodeled version of the uploaded bathroom photo.
It must look like the original bathroom with only the requested remodel applied.
Preserve the original room angle, perspective, and structure.
Only change what is necessary to fulfill the selected remodel options.

FINAL QUALITY CHECK (the image must pass all of these):
1. Same camera angle and same room layout as the original photo.
2. Toilet, vanity, sink, and mirror unchanged and in their original positions (unless inside the remodeled wet area).
3. No fixtures in impossible places — nothing attached to the toilet or seat, no floating or duplicated parts.
4. Straight walls, correctly aligned tile/panel patterns, realistic proportions.
5. Lighting matches the original photo.
If any of these would fail, correct it before producing the final image.
`.trim();
}

// Translate raw OpenAI/SDK errors into a clear, safe JSON payload.
// Never includes the API key. Adds a hint for the most common setup problems.
function describeOpenAiError(error) {
  const status = error?.status || error?.statusCode || 500;
  const code = error?.code || error?.error?.code || null;
  const type = error?.type || error?.error?.type || null;
  const rawMessage = error?.error?.message || error?.message || "Unknown error from the image service.";
  const lower = String(rawMessage + " " + (code || "") + " " + (type || "")).toLowerCase();

  let hint = null;
  if (lower.includes("verify") || lower.includes("verification") || lower.includes("must be verified")) {
    hint = "This OpenAI organization is not verified for image generation. Verify the org at platform.openai.com/settings/organization/general, then retry.";
  } else if (lower.includes("does not exist") || (lower.includes("model") && (lower.includes("access") || lower.includes("not found")))) {
    hint = `The image model "${IMAGE_MODEL}" is not available to this API key. Confirm the model name or set OPENAI_IMAGE_MODEL in Vercel.`;
  } else if (lower.includes("quota") || lower.includes("insufficient_quota") || lower.includes("billing")) {
    hint = "OpenAI billing/quota problem. Check the billing balance and usage limits on the OpenAI account.";
  } else if ((lower.includes("invalid") && lower.includes("api key")) || code === "invalid_api_key" || status === 401) {
    hint = "The OPENAI_API_KEY appears to be invalid. Re-check the key in Vercel Environment Variables.";
  } else if (lower.includes("rate limit") || status === 429) {
    hint = "Rate limited by OpenAI. Wait a moment and try again.";
  } else if (lower.includes("image") && (lower.includes("too large") || lower.includes("size") || lower.includes("dimension"))) {
    hint = "The uploaded image was rejected for size/format. Try a smaller JPEG/PNG photo.";
  } else if (lower.includes("format") || lower.includes("unsupported") || lower.includes("mime")) {
    hint = "The uploaded image format is unsupported. Use a standard JPEG or PNG photo.";
  }

  return {
    httpStatus: status >= 400 && status < 600 ? status : 502,
    body: {
      error: rawMessage,
      code,
      type,
      hint,
      model: IMAGE_MODEL,
    },
  };
}

export default async function handler(req, res) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API is live",
      endpoint: "/api/generate-bathroom",
      model: IMAGE_MODEL,
      hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in Vercel Environment Variables." });
    }

    // Vercel auto-parses JSON bodies, but guard against a string body just in case.
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Request body was not valid JSON." });
      }
    }

    const image = body.image;
    if (!image) {
      return res.status(400).json({ error: "No image was provided." });
    }

    const project = clean(body.project, "Tub-to-shower conversion");
    const style = clean(body.style, "Modern spa");
    const finish = clean(body.finish, "");
    const pattern = clean(body.pattern, "");
    const notes = clean(body.notes, "");
    const features = Array.isArray(body.features) ? body.features : [];
    // Lead info (name/phone/email) is accepted but not required for generation.
    const lead = body.lead && typeof body.lead === "object" ? body.lead : {};

    const prompt = buildBathroomPrompt({ project, style, finish, pattern, features, notes });

    let mimeType, buffer;
    try {
      ({ mimeType, buffer } = dataUrlToBuffer(image));
    } catch (e) {
      return res.status(400).json({ error: "The uploaded image could not be read. Please re-upload a JPEG or PNG photo." });
    }

    // Name the temp file with a matching extension so OpenAI reads the format correctly.
    const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg"
      : mimeType.includes("webp") ? "webp"
      : "png";
    const imageFile = await toFile(buffer, `bathroom-input.${ext}`, { type: mimeType });

    // input_fidelity: "high" makes the model stay much closer to the original
    // photo (layout, angle, unchanged fixtures). If the model/account doesn't
    // support the parameter, we automatically retry without it.
    const baseParams = {
      model: IMAGE_MODEL,
      image: imageFile,
      prompt,
      size: "1536x1024",
      quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
    };

    let result;
    try {
      result = await openai.images.edit({ ...baseParams, input_fidelity: "high" });
    } catch (fidelityError) {
      const msg = String(fidelityError?.error?.message || fidelityError?.message || "").toLowerCase();
      if (msg.includes("input_fidelity") || msg.includes("unknown parameter")) {
        console.warn("input_fidelity not supported by this model/account; retrying without it.");
        result = await openai.images.edit(baseParams);
      } else {
        throw fidelityError;
      }
    }

    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(502).json({ error: "No image was returned from the image service. Please try again." });
    }

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${b64}`,
      model: IMAGE_MODEL,
      lead,
    });
  } catch (error) {
    // Log full detail server-side (visible in Vercel logs), never expose the key.
    console.error("Bathroom generation error:", {
      message: error?.message,
      status: error?.status,
      code: error?.code || error?.error?.code,
      type: error?.type || error?.error?.type,
    });
    const described = describeOpenAiError(error);
    return res.status(described.httpStatus).json(described.body);
  }
}
