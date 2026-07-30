import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished Lean course shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Lean, from zero/);
  assert.match(html, /Learn to make/);
  assert.match(html, /certainty\./);
  assert.match(html, /Begin day one/);
  assert.match(html, /How to use this/);
  assert.match(html, /Your two-week map/);
  assert.match(html, /Watch a proof state change/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("renders the complete fourteen-day course map", async () => {
  const response = await render();
  const html = await response.text();

  for (let day = 1; day <= 14; day += 1) {
    assert.match(
      html,
      new RegExp(`D(?:<!-- -->)?${String(day).padStart(2, "0")}`),
    );
  }

  assert.match(html, /Why prove anything\?/);
  assert.match(html, /Ship a verified tiny system/);
  assert.match(html, /Theorem Proving in Lean 4/);
});

test("ships an in-depth chapter supplement for every day", async () => {
  const sourceFiles = await Promise.all(
    [1, 2, 3].map((part) =>
      readFile(new URL(`../app/deep-dives-${part}.ts`, import.meta.url), "utf8"),
    ),
  );
  const source = sourceFiles.join("\n");
  const dayDeclarations = source.match(/\bday:\s*\d+,/g) ?? [];
  const topicDeclarations = source.match(/\bworkedExample:\s*\{/g) ?? [];
  const teachingWordCount = source.split(/\s+/).length;

  assert.equal(dayDeclarations.length, 14);
  assert.equal(topicDeclarations.length, 42);
  assert.ok(teachingWordCount > 30_000);

  for (let day = 1; day <= 14; day += 1) {
    assert.match(source, new RegExp(`\\bday:\\s*${day},`));
  }
});
