const app = require("./_app.cjs").default;

function requestUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url, `${proto}://${host}`);
  const pathname = url.searchParams.get("pathname");
  if (pathname && (url.pathname === "/api" || url.pathname === "/api/")) {
    const suffix = pathname.replace(/^\/+/, "").replace(/^api\//, "");
    url.pathname = `/api/${suffix}`;
    url.searchParams.delete("pathname");
  }
  return url;
}

function toRequest(req, body) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || key.toLowerCase() === "content-length") continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const init = { method: req.method, headers };
  if (body && body.length) init.body = body;
  return new Request(requestUrl(req), init);
}

function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function send(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}

module.exports = async (req, res) => {
  try {
    const body = await readBody(req);
    await send(res, await app.fetch(toRequest(req, body)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The API failed to start.";
    res.status(500).json({ error: message });
  }
};
