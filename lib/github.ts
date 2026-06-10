/**
 * GitHub Git Data API — push files directly to a branch, and read files from it.
 * Uses the low-level tree/commit API to push multiple files atomically.
 */

export interface FileChange {
  path: string;   // relative to repo root, e.g. "app/api/foo/route.ts"
  content: string; // full file contents (UTF-8)
}

export interface PushResult {
  success: boolean;
  commitUrl?: string;
  commitSha?: string;
  error?: string;
}

// ── Read a single file from the repo ────────────────────────────────────────
export async function getFileFromGitHub(path: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // data.content is base64, may have newlines
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
  } catch {
    return null;
  }
}

// ── List files in a directory ────────────────────────────────────────────────
export async function listFilesFromGitHub(dir: string): Promise<string[]> {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) return [];

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${dir}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data)
      ? data.filter((f: { type: string; name: string }) => f.type === "file").map((f: { name: string }) => f.name)
      : [];
  } catch {
    return [];
  }
}

// ── Push files to the repo ───────────────────────────────────────────────────
export async function pushFilesToGitHub(
  files: FileChange[],
  commitMessage: string
): Promise<PushResult> {
  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;   // "owner/repo"
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    return { success: false, error: "GITHUB_TOKEN or GITHUB_REPO env vars not set" };
  }

  const api = `https://api.github.com/repos/${repo}`;
  const h = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const gh = async (path: string, opts?: RequestInit) => {
    const res = await fetch(`${api}${path}`, { ...opts, headers: h });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GitHub API ${path} → ${res.status}: ${body}`);
    }
    return res.json();
  };

  try {
    // 1. Get latest commit SHA on branch
    const ref = await gh(`/git/refs/heads/${branch}`);
    const latestSha: string = ref.object.sha;

    // 2. Get its tree SHA
    const latestCommit = await gh(`/git/commits/${latestSha}`);
    const baseTree: string = latestCommit.tree.sha;

    // 3. Create a blob for each file
    const treeItems = await Promise.all(files.map(async (f) => {
      const blob = await gh("/git/blobs", {
        method: "POST",
        body: JSON.stringify({
          content:  Buffer.from(f.content).toString("base64"),
          encoding: "base64",
        }),
      });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    }));

    // 4. Create a new tree on top of the base
    const newTree = await gh("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTree, tree: treeItems }),
    });

    // 5. Create a commit
    const newCommit = await gh("/git/commits", {
      method: "POST",
      body: JSON.stringify({
        message: commitMessage,
        tree:    newTree.sha,
        parents: [latestSha],
      }),
    });

    // 6. Fast-forward the branch ref
    await gh(`/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommit.sha }),
    });

    return {
      success:   true,
      commitSha: newCommit.sha,
      commitUrl: `https://github.com/${repo}/commit/${newCommit.sha}`,
    };
  } catch (err) {
    console.error("[github] Push failed:", err);
    return { success: false, error: String(err) };
  }
}
