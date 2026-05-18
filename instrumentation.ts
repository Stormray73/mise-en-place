/**
 * @file instrumentation.ts
 * @responsibility Initialize MSW for network interception in Node.js (Next.js server) during E2E tests.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.MOCK_AI === "true") {
    const { server } = await import("./tests/msw/node");
    server.listen({ onUnhandledRequest: "bypass" });
    console.log("MSW Server started for OpenAI interception.");
  }
}
