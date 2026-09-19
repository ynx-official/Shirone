import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const name = `shirone-nuxt-verify-${process.pid}`;
const docker = (...args) =>
  execFileSync("docker", args, { encoding: "utf8" }).trim();
async function healthy() {
  for (let i = 0; i < 100; i++) {
    if (
      docker("inspect", "--format", "{{.State.Health.Status}}", name) ===
      "healthy"
    )
      return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw Error("Container did not become healthy");
}
try {
  docker(
    "run",
    "-d",
    "--name",
    name,
    "--health-interval=1s",
    "--health-start-period=1s",
    "-p",
    "127.0.0.1::3000",
    "shirone-nuxt:local",
  );
  await healthy();
  const port = docker("port", name, "3000/tcp").split(":").at(-1);
  const base = `http://127.0.0.1:${port}`;
  for (const path of [
    "/",
    "/posts/markdown/",
    "/pagefind/pagefind.js",
    "/api/health",
  ])
    assert.equal((await fetch(base + path)).status, 200, path);
  for (const path of ["/admin", "/admin/preview", "/api/mock/admin"])
    assert.equal((await fetch(base + path)).status, 404, path);
  assert.equal(docker("exec", name, "id", "-u"), "1000");
  docker("stop", "--time", "10", name);
  assert.equal(
    docker("inspect", "--format", "{{.State.Running}}", name),
    "false",
  );
  docker("start", name);
  await healthy();
  const restartedPort = docker("port", name, "3000/tcp").split(":").at(-1);
  assert.equal(
    (await fetch(`http://127.0.0.1:${restartedPort}/api/health`)).status,
    200,
  );
  console.log(
    "Docker SSR, assets, disabled-admin, non-root, health, stop and restart passed.",
  );
} finally {
  try {
    docker("rm", "-f", name);
  } catch {}
}
