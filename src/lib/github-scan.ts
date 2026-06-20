import type { ScanFinding, ScanReport } from "./domain";

const API = "https://api.github.com";

async function github(path: string) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Clearance-Hedera-Policy-Agent",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
    },
    cache: "no-store"
  });
  if (!response.ok) return { ok: false, status: response.status, data: null };
  return { ok: true, status: response.status, data: await response.json() as any };
}

export async function scanRepository(repository: string): Promise<ScanReport> {
  const [repo, protection, codeownersRoot, codeownersGithub, workflows] = await Promise.all([
    github(`/repos/${repository}`),
    github(`/repos/${repository}/branches/main/protection`),
    github(`/repos/${repository}/contents/CODEOWNERS`),
    github(`/repos/${repository}/contents/.github/CODEOWNERS`),
    github(`/repos/${repository}/actions/workflows`)
  ]);
  if (!repo.ok) throw new Error(`GitHub repository evidence unavailable (${repo.status})`);
  const url = `https://github.com/${repository}`;
  const isPublic = repo.data.visibility === "public" || repo.data.private === false;
  const hasProtection = protection.ok;
  const hasCodeowners = codeownersRoot.ok || codeownersGithub.ok;
  const workflowCount = workflows.ok ? Number(workflows.data.total_count || 0) : 0;
  const findings: ScanFinding[] = [
    { key: "visibility", label: "Repository exposure", status: isPublic ? "warn" : "pass", evidence: `GitHub reports visibility=${repo.data.visibility ?? (repo.data.private ? "private" : "public")}.`, sourceUrl: url },
    { key: "branch-protection", label: "Default branch protection", status: hasProtection ? "pass" : "fail", evidence: hasProtection ? "GitHub returned an active protection rule for main." : `GitHub protection endpoint returned ${protection.status}; no verifiable rule was observed.`, sourceUrl: `${url}/settings/branches` },
    { key: "codeowners", label: "CODEOWNERS coverage", status: hasCodeowners ? "pass" : "fail", evidence: hasCodeowners ? "A CODEOWNERS file was observed." : "No CODEOWNERS file was observed at the repository root or .github path.", sourceUrl: `${url}/tree/main/.github` },
    { key: "workflows", label: "Automation surface", status: workflowCount > 0 ? "warn" : "pass", evidence: `${workflowCount} GitHub Actions workflow(s) observed.`, sourceUrl: `${url}/actions` }
  ];
  const riskScore = Math.min(100, findings.reduce((score, item) => score + (item.status === "fail" ? 32 : item.status === "warn" ? 15 : 0), 10));
  return { repository, observedAt: new Date().toISOString(), riskScore, summary: riskScore >= 70 ? "High-risk repository controls need attention." : riskScore >= 40 ? "Material hardening opportunities were observed." : "Baseline repository controls are present.", findings };
}
