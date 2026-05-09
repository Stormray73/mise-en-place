import { GET } from "@/app/api/usda/search/route";
import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("GET /api/usda/search", () => {
  beforeEach(() => {
    vi.stubEnv("USDA_API_KEY", "test-key");
  });

  it("should return 400 if query is missing", async () => {
    const req = new NextRequest("http://localhost/api/usda/search");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should forward the query to USDA and return the result", async () => {
    const mockResponse = { foods: [{ description: "Apple" }] };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new NextRequest("http://localhost/api/usda/search?q=apple");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.nal.usda.gov/fdc/v1/foods/search"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("query=apple"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api_key=test-key"),
    );
  });
});
