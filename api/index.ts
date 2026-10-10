const handler = async (request: Request) => {
  const rawUrl = request instanceof Request ? request.url : "";
  return Response.json({
    ok: true,
    url: rawUrl,
    kind: request instanceof Request ? "request" : typeof request,
  });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
