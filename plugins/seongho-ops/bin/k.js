#!/usr/bin/env node

// src/commands/k.ts
import { execFileSync } from "child_process";
var ports = process.argv.slice(2);
if (ports.length === 0) {
  console.error("usage: k <port> [port...]");
  process.exit(1);
}
for (const port of ports) {
  try {
    const pids = execFileSync("lsof", ["-ti", `:${port}`], { encoding: "utf-8" }).trim();
    if (!pids) {
      console.log(`port ${port}: no process found`);
      continue;
    }
    for (const pid of pids.split("\n")) {
      execFileSync("kill", ["-9", pid]);
    }
    console.log(`killed port ${port} (pid: ${pids.replace(/\n/g, ", ")})`);
  } catch {
    console.log(`port ${port}: no process found`);
  }
}
