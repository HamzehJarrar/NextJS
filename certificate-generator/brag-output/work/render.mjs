// usage:
//   node render.mjs --stills 1.0,2.8,...   → work/stills/t-<sec>.png
//   node render.mjs                         → work/video.mp4 (silent)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "../.."); // project root
const WORK = import.meta.dirname;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".png": "image/png" };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/brag-output/work/comp/index.html`;

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--font-render-hinting=none", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.waitForFunction("window.__ready === true", { timeout: 60000 });
const { duration, fps } = await page.evaluate(() => ({ duration: window.DURATION, fps: window.FPS }));

const stillsArg = process.argv.indexOf("--stills");
if (stillsArg > -1) {
  fs.mkdirSync(path.join(WORK, "stills"), { recursive: true });
  for (const s of process.argv[stillsArg + 1].split(",").map(Number)) {
    await page.evaluate((t) => window.renderFrame(t), s);
    await page.screenshot({ path: path.join(WORK, "stills", `t-${s.toFixed(2)}.png`) });
    console.log("still", s);
  }
} else {
  const frames = Math.round(duration * fps);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(WORK, "video.mp4")], { stdio: ["pipe", "inherit", "inherit"] });
  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.renderFrame(t), f / fps);
    const buf = await page.screenshot({ type: "png", optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 60 === 0) console.log(`frame ${f}/${frames} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log("video.mp4 written", frames, "frames");
}
await browser.close();
server.close();
