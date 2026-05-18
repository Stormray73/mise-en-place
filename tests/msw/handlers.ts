import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("https://api.openai.com/v1/chat/completions", () => {
    // Note: AI SDK uses different endpoints depending on provider,
    // but the standard OpenAI chat completions endpoint is a good baseline.
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "MSW Mock Pasta",
              yieldAmount: 2,
              yieldUnit: "servings",
              steps: [
                { instruction: "Boil water", timerInSeconds: 600 },
                { instruction: "Cook pasta", timerInSeconds: 0 },
              ],
              ingredients: [
                { quantity: 200, unit: "g", name: "Pasta", prepState: "dry" },
              ],
            }),
          },
        },
      ],
    });
  }),
];
