/**
 * Reads and writes files in the GitHub repo via the GitHub Contents API.
 * Used by API routes (running on Vercel) to persist subscribers.json
 * since serverless functions cannot write to the filesystem.
 */

const REPO   = process.env.GH_REPO ?? "prodhosh-iitm/gssoc-tracker";
const BRANCH = "main";

interface FileResponse {
  sha: string;
  content: string; // base64
}

async function ghFetch(path: string, opts?: RequestInit) {
  const token = process.env.GH_TOKEN;
  return fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });
}

export async function readRepoJSON<T>(filePath: string, fallback: T): Promise<{ data: T; sha: string }> {
  const res = await ghFetch(`${filePath}?ref=${BRANCH}`);
  if (!res.ok) return { data: fallback, sha: "" };
  const file = await res.json() as FileResponse;
  const text = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf-8");
  return { data: JSON.parse(text) as T, sha: file.sha };
}

export async function writeRepoJSON(filePath: string, data: unknown, sha: string, message: string): Promise<boolean> {
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64");
  const body: Record<string, string> = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;

  const res = await ghFetch(filePath, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res.ok;
}
