// 一次跑完所有 harness，输出汇总。
// 用法：npm test   （或 node harness/run-all.mjs）
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(HERE).filter((f) => /^run-harness.*\.mjs$/.test(f)).sort();
let total = 0;
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(HERE, f)], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/结果：(\d+) 通过，(\d+) 失败/);
  const pass = m ? Number(m[1]) : 0;
  const fail = m ? Number(m[2]) : (r.status === 0 ? 0 : 1);
  total += pass;
  failed += fail;
  console.log(`${fail === 0 ? "✓" : "✗"} ${f.padEnd(34)} ${pass} 通过 / ${fail} 失败`);
}
console.log(`\n合计：${total} 通过，${failed} 失败`);
process.exit(failed === 0 ? 0 : 1);
