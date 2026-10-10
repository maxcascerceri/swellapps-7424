let app: { fetch: (request: Request) => Response | Promise<Response> } | null = null;
let loadError = "";

try {
  const loaded = await import("../packages/web/src/api/index");
  app = loaded.default;
} catch (error) {
  loadError = error instanceof Error ? `${error.name}: ${error.message}` : "unknown";
}

const PATH_HEADERS = [
  "x-forwarded-uri",
  "x-forwarded-url",
  "x-invoke-path",
  "x-matched-path",
  "x-vercel-original-url",
  "x-middleware-rewrite",
  "x-url",
];

function forwardedPath(request: Request) {
  const url = new URL(request.url);
  if (url.pathname !== "/api") return request;

  const original = PATH_HEADERS.map((name) => request.headers.get(name)).find(
    (value) => value && value.startsWith("/api/") && value !== "/api",
  );
  if (!original) return request;

  const target = new URL(original, url.origin);
  target.search = url.search;
  return new Request(target, request);
}

const handler = (request: Request) => {
  if (loadError || !app) {
    return Response.json({ error: loadError || "The API did not load." }, { status: 500 });
  }
  try {
    return app.fetch(forwardedPath(request));
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : "unknown";
    return Response.json({ error: message }, { status: 500 });
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
