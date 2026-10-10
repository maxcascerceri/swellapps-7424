function toRequest(req, body) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url, `${proto}://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const init = { method: req.method, headers };
  if (body) {
    init.body = body;
    init.duplex = "half";
  }
  return new Request(url, init);
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
    const { default: app } = await import("../packages/web/src/api/index.ts");
    const response = await app.fetch(toRequest(req, body));
    await send(res, response);
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : "unknown";
    res.status(500).json({ error: message });
  }
};
