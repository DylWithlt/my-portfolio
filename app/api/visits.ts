// pages/api/visits.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: pull this from your real data store
  const count = 42;
  res.status(200).json({ count });
}
