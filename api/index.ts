type NodeResponse = {
  status: (code: number) => { json: (body: unknown) => void; end: (body: string) => void };
};

export default function handler(req: { url?: string; method?: string }, res: NodeResponse) {
  res.status(200).json({ ok: true, url: req.url ?? "", method: req.method ?? "" });
}
