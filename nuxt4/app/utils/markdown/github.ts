export function initGithub(root: HTMLElement) {
  const controller = new AbortController();
  for (const card of root.querySelectorAll<HTMLElement>("[data-github-repo]")) {
    const repo = card.dataset.githubRepo || "";
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) continue;
    fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (controller.signal.aborted || !card.isConnected) return;
        for (const [field, value] of Object.entries({
          description: data.description,
          stars: data.stargazers_count,
          forks: data.forks_count,
          license: data.license?.spdx_id,
          language: data.language,
        })) {
          const el = card.querySelector<HTMLElement>(`[data-github-${field}]`);
          if (el && value !== null && value !== undefined) {
            el.textContent = String(value);
            el.hidden = false;
          }
        }
        card.dataset.githubState = "loaded";
      })
      .catch(() => {
        /* SSR link remains available */
      });
  }
  return () => controller.abort();
}
