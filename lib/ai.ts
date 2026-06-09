import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dynamicFallback(input: {
  business: string;
  service: string;
  location: string;
  rating: number;
  experiencePoints: string[];
  language: string;
  tone: string;
  length: string;
  customerName?: string;
  customerArea?: string;
}) {
  const service = input.service || "service";
  const business = input.business || "this business";
  const location = input.location || "this area";
  const name = input.customerName ? `— ${input.customerName}` : "";
  const area = input.customerArea || location;

  const shortReviews = [
    `Good experience with ${business}. The ${service} work was done properly. ${name}`,
    `Really happy with the ${service} at ${business}. Quick and neat work. ${name}`,
    `Satisfied with ${business}. The team handled the ${service} professionally. ${name}`,
    `Great service from ${business} for ${service}. Would visit again. ${name}`,
    `Smooth experience with ${business}. The ${service} was completed on time. ${name}`,
  ];

  const mediumReviews = [
    `I used ${business} for ${service} in ${area} and had a very good experience. The team came on time, completed the work neatly, and explained things clearly. Overall satisfied. ${name}`,
    `Recently got ${service} done from ${business} and the service was really good. The staff was polite and the work quality was satisfying. ${name}`,
    `The ${service} work by ${business} in ${area} was done properly. They responded quickly and the team was professional throughout. ${name}`,
    `Got ${service} done from ${business} and the experience was smooth from start to finish. The team was helpful and completed everything neatly. ${name}`,
    `${business} did a great job with ${service}. The team arrived on time, worked efficiently, and the results were exactly what I needed. ${name}`,
  ];

  const casualReviews = [
    `Nice experience with ${business} for ${service}. Work was clean, team was helpful. ${name}`,
    `Happy with the ${service} from ${business}. Simple and professional. ${name}`,
    `Good work by ${business}. ${service} was done neatly and on time. ${name}`,
    `The team at ${business} was friendly and got the ${service} done properly. ${name}`,
    `Overall a good experience. ${business} handled the ${service} well. ${name}`,
  ];

  return {
    short: randomItem(shortReviews),
    medium: randomItem(mediumReviews),
    casual: randomItem(casualReviews),
    warnings: [],
  };
}

async function runGPT(prompt: string) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
    throw new Error("OPENAI_API_KEY missing");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.95,
    top_p: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a natural customer review writing assistant. Your job is to help real customers express their genuine experience in simple, human-like language.

STRICT RULES — follow every one of these:
- NEVER use phrases like "I can't recommend enough", "I cannot recommend enough", "couldn't be happier", "second to none", "above and beyond" — these sound fake.
- NEVER write negatives disguised as positives (e.g. "can't fault", "not disappointed").
- ALWAYS use clear POSITIVE phrasing: "I highly recommend", "really happy with", "great experience", "satisfied with", "the work was done well".
- Do NOT write fake claims. Only use the experience points provided.
- Do NOT write like marketing copy or advertisements.
- Write like a real local customer — simple, warm, direct.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(cleanJson(text));
}

async function runGPTWithRetry(prompt: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Trying GPT AI... attempt ${attempt}`);
      return await runGPT(prompt);
    } catch (error) {
      lastError = error;
      console.log(`GPT attempt ${attempt} failed:`, error);

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }

  throw lastError;
}

export async function analyzeBusiness(input: {
  name: string;
  category: string;
  city: string;
  services: string[];
  locations: string[];
}) {
  const fallback = {
    serviceKeywords: input.services,
    locationKeywords: input.locations.length ? input.locations : [input.city],
    naturalQuestions: [
      "What service did you use?",
      "What did you like most?",
      "Was the team professional?",
      "Was the work completed properly?",
    ],
    safetyRules: [
      "Only write based on real experience.",
      "Do not add fake claims.",
      "Do not overuse keywords.",
      "Do not make the review sound like an advertisement.",
    ],
  };

  const prompt = `
Analyze this local business for an ethical AI review assistance tool.

Return JSON only.

Business Name: ${input.name}
Category: ${input.category}
City: ${input.city}
Services: ${input.services.join(", ")}
Locations: ${input.locations.join(", ")}

Create:
1. Natural service keywords
2. Location keywords
3. Customer experience questions
4. Safety rules to avoid fake-looking reviews

Return this exact JSON structure:
{
  "serviceKeywords": [],
  "locationKeywords": [],
  "naturalQuestions": [],
  "safetyRules": []
}
`;

  try {
    return await runGPTWithRetry(prompt);
  } catch (error) {
    console.log("Business analysis GPT failed. Using fallback:", error);
    return fallback;
  }
}

export async function generateReviews(input: {
  business: string;
  service: string;
  location: string;
  rating: number;
  experiencePoints: string[];
  language: string;
  tone: string;
  length: string;
  customerName?: string;
  customerArea?: string;
}) {
  const nameTag = input.customerName ? `\nCustomer Name (use naturally at the end if it fits): ${input.customerName}` : "";
  const areaTag = input.customerArea ? `\nCustomer Area (mention naturally): ${input.customerArea}` : "";

  const prompt = `
Generate 3 different Google review options for a real customer. Each review MUST sound different in structure and wording.

CRITICAL PHRASING RULES:
- NEVER use: "can't recommend enough", "cannot recommend enough", "couldn't be happier", "can't fault", "second to none", "above and beyond", "not disappointed"
- ALWAYS use POSITIVE direct phrasing: "highly recommend", "really happy with", "great experience", "satisfied with", "the work was neat and professional"
- NO double negatives. NO ambiguous phrases.

MAIN GOAL:
Sound like a real human customer. Naturally include business type, service, and location for local SEO — but do NOT keyword-stuff.

BUSINESS DETAILS:
- Business Name: ${input.business}
- Service Used: ${input.service}
- Location/Branch: ${input.location}
- Rating: ${input.rating} stars${nameTag}${areaTag}

CUSTOMER EXPERIENCE POINTS (only use these — do not invent):
${input.experiencePoints.length > 0 ? input.experiencePoints.join(", ") : "General positive experience"}

LANGUAGE: ${input.language}
TONE: ${input.tone}

REVIEW TYPES:
- Short: 1 clear positive sentence. Max 20 words. No name needed.
- Medium: 2-3 sentences. Include service + location naturally. Can end with customer name if provided.
- Casual: Friendly, conversational. Like texting a friend. Can include name at end.

VARIETY REQUIREMENT: Each of the 3 reviews MUST use a different opening word/phrase. Do NOT start all three with "I".

LANGUAGE RULES:
- English: Natural Indian-English (not American/British corporate style)
- Tamil: Pure Tamil script
- Tanglish: Tamil words written in English letters mixed with English
- Hindi/Other: That language

Random seed for variety: ${Date.now()}-${Math.random()}

Return JSON only — no extra text:
{
  "short": "",
  "medium": "",
  "casual": "",
  "warnings": []
}
`;

  try {
    const result = await runGPTWithRetry(prompt);

    // Post-process: catch any bad phrases that slipped through
    const badPhrases = [
      "can't recommend enough",
      "cannot recommend enough",
      "can't fault",
      "couldn't be happier",
      "second to none",
      "above and beyond",
      "not disappointed",
    ];

    let short = result.short || "";
    let medium = result.medium || "";
    let casual = result.casual || "";

    const hasBadPhrase = (text: string) =>
      badPhrases.some((p) => text.toLowerCase().includes(p.toLowerCase()));

    // If bad phrase detected in any field, replace with fallback
    const fallback = dynamicFallback(input);
    if (hasBadPhrase(short)) short = fallback.short;
    if (hasBadPhrase(medium)) medium = fallback.medium;
    if (hasBadPhrase(casual)) casual = fallback.casual;

    return {
      short,
      medium,
      casual,
      warnings: result.warnings || [],
    };
  } catch (error) {
    console.log("Review GPT generation failed. Using dynamic fallback:", error);
    return dynamicFallback(input);
  }
}
