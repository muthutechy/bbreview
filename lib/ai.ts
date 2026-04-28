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
}) {
  const service = input.service || "service";
  const business = input.business || "this business";
  const location = input.location || "this area";

  const shortReviews = [
    `I had a smooth experience with ${business}.`,
    `Good service overall, the work was handled properly.`,
    `Nice experience with ${service}. Everything went well.`,
    `The team responded quickly and completed the work neatly.`,
    `Satisfied with the service and the overall experience.`,
  ];

  const mediumReviews = [
    `I had a good experience with ${business}. The team handled the ${service} work neatly and explained things clearly.`,
    `The service was smooth from start to finish. They responded quickly and completed the work properly in ${location}.`,
    `Overall, I’m happy with the experience. The team came on time, handled the work neatly, and there were no major issues.`,
    `The ${service} work was done well. The staff were polite, explained the details clearly, and finished everything properly.`,
    `Good experience overall. The team was responsive, the work quality was satisfying, and everything was handled in a simple way.`,
  ];

  const casualReviews = [
    `Nice experience with ${business}. Work was done properly.`,
    `Good service and quick response. Happy with it.`,
    `Pretty smooth experience overall. No issues.`,
    `The team was helpful and the work was neat.`,
    `Good work, simple and professional service.`,
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
        content:
          "You are a natural customer review writing assistant. Your job is to help real customers express their real experience in simple, human-like language. Do not create fake claims. Do not write like marketing copy.",
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
}) {
  const prompt = `
Generate 3 fresh Google review options for a real customer.

MAIN GOAL:
The review should sound like a real human customer and naturally help local SEO by mentioning the business type, service, and location.

IMPORTANT:
- Use the business name naturally: ${input.business}
- Use the service keyword naturally: ${input.service}
- Use the location naturally: ${input.location}
- Add human emotion when suitable: wow, wonderful, really happy, impressed, satisfied, good experience, helpful team, neat work.
- Do NOT overdo keywords.
- Do NOT sound like an advertisement.
- Do NOT sound like AI.
- Do NOT write too perfect corporate English.
- Do NOT repeat the same sentence structure.
- Do NOT invent fake details outside the selected experience points.
- Make each review different.
- Make it useful for Google review/local SEO, but still natural.

CUSTOMER REAL EXPERIENCE POINTS:
${input.experiencePoints.join(", ")}

LANGUAGE RULES:
- If language is English, write natural English.
- If language is Tamil, write Tamil.
- If language is Tanglish, write Tanglish.
- If language is Hindi, Kannada, Malayalam, or Telugu, write that language.
- Keep business/service/location keywords readable.

STYLE:
- Short review: 1 emotional natural sentence.
- Medium review: 2 to 3 sentences with service + location.
- Casual review: friendly, human, simple, slightly emotional.

Business Name: ${input.business}
Service Used: ${input.service}
Location: ${input.location}
Rating: ${input.rating}
Language: ${input.language}
Tone: ${input.tone}
Review Length: ${input.length}

EXAMPLES OF STYLE:
- "Wow, really happy with EASYTECH for CCTV installation in Madurai. The team came on time and finished the work neatly."
- "Wonderful experience with The Curtain Studio in Bengaluru. Their curtain installation service was neat, and the staff explained everything clearly."
- "I’m really satisfied with the AC service in Madurai. Quick response, polite team, and the issue was solved properly."

Random variation seed: ${Date.now()}-${Math.random()}

Return JSON only:
{
  "short": "",
  "medium": "",
  "casual": "",
  "warnings": []
}
`;

  try {
    const result = await runGPTWithRetry(prompt);

    return {
      short: result.short || "",
      medium: result.medium || "",
      casual: result.casual || "",
      warnings: result.warnings || [],
    };
  } catch (error) {
    console.log("Review GPT generation failed. Using dynamic fallback:", error);
    return dynamicFallback(input);
  }
}