import { http, HttpResponse } from "msw";

export const handlers = [
  // 1. OpenAI (Recipe & Ingredient Parsing)
  http.post("https://api.openai.com/v1/chat/completions", () => {
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

  // 2. USDA FDC API (Ingredient Search)
  http.get("https://api.nal.usda.gov/fdc/v1/foods/search", () => {
    return HttpResponse.json({
      foods: [
        {
          fdcId: 1103332,
          description: "Tomatoes, red, ripe, raw, year round average",
          foodCategory: "Vegetables and Vegetable Products",
          foodNutrients: [
            { nutrientName: "Energy", value: 18 },
            { nutrientName: "Protein", value: 0.88 },
            { nutrientName: "Total lipid (fat)", value: 0.2 },
            { nutrientName: "Carbohydrate, by difference", value: 3.89 },
          ],
        },
        {
          fdcId: 1103333,
          description: "Salt, table",
          foodCategory: "Spices and Herbs",
          foodNutrients: [],
        },
      ],
    });
  }),

  // 3. Google OAuth Discovery
  http.get(
    "https://accounts.google.com/.well-known/openid-configuration",
    () => {
      return HttpResponse.json({
        issuer: "https://accounts.google.com",
        authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        token_endpoint: "https://oauth2.googleapis.com/token",
        userinfo_endpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
        jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
      });
    },
  ),

  // 4. Google OAuth Authorization (The mock redirect)
  http.get("https://accounts.google.com/o/oauth2/v2/auth", ({ request }) => {
    const url = new URL(request.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");

    // Redirect back to the application callback URL with a mock code
    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: `${redirectUri}?code=mock-code&state=${state}`,
      },
    });
  }),

  // 5. Google OAuth (Token Exchange)
  http.post("https://oauth2.googleapis.com/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      expires_in: 3600,
      id_token: "mock-id-token",
      refresh_token: "mock-refresh-token",
      token_type: "Bearer",
    });
  }),

  // 6. Google OAuth (UserInfo)
  http.get("https://www.googleapis.com/oauth2/v3/userinfo", () => {
    return HttpResponse.json({
      sub: "test-user-id",
      name: "Test Chef",
      given_name: "Test",
      family_name: "Chef",
      picture: "https://via.placeholder.com/150",
      email: "test@example.com",
      email_verified: true,
      locale: "en",
    });
  }),

  // 7. External Recipe Scraping (example-recipes.com)
  http.get("https://example-recipes.com/pasta", () => {
    return new HttpResponse(
      `
      <html>
        <body>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Recipe",
              "name": "MSW Mock Pasta",
              "recipeYield": "2 servings",
              "recipeIngredient": ["200g Pasta"],
              "recipeInstructions": [
                { "@type": "HowToStep", "text": "Boil water" },
                { "@type": "HowToStep", "text": "Cook pasta" }
              ]
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }),
];
