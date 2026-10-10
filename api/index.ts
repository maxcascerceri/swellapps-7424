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

const handler = async (request: Request) => {
  const url = new URL(request.url);
  if (url.searchParams.has("probe")) {
    return Response.json({
      url: request.url,
      headers: Object.fromEntries(
        PATH_HEADERS.map((name) => [name, request.headers.get(name)]),
      ),
    });
  }

  try {
    const { default: app } = await import("../packages/web/src/api/index");
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
