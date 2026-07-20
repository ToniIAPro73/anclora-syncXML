import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "docs", "manual", "screenshots");
const baseUrl = process.env.SYNCXML_CAPTURE_URL ?? "http://127.0.0.1:3021";
const chrome = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((candidate) => existsSync(candidate));

if (!chrome) throw new Error("No Chrome/Chromium binary found.");
mkdirSync(outDir, { recursive: true });

const profileDir = path.join(root, "tmp", "manual-capture-chrome");
rmSync(profileDir, { recursive: true, force: true });

const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--remote-debugging-port=9333",
  `--user-data-dir=${profileDir}`,
  "about:blank",
], { stdio: "ignore" });

try {
  await waitForChrome();
  const page = await newPage();
  const cdp = await connectCdp(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const lang of ["es", "en", "de"]) {
    await prepareApp(cdp, lang);
    await capture(cdp, `${baseUrl}/app?lang=${lang}`, `syncxml-${lang}-import.png`, "main");

    await clickByText(cdp, demoLabel(lang));
    await waitForSessionParsed(cdp);
    await capture(cdp, null, `syncxml-${lang}-review.png`, "main");

    const xmlSession = await buildXmlSession(cdp);
    const injectionId = await injectAppSession(cdp, xmlSession);
    await reload(cdp, `${baseUrl}/app?lang=${lang}`);
    await waitForSelector(cdp, ".ses-panel");
    await capture(cdp, null, `syncxml-${lang}-xml.png`, "main");

    await scrollToText(cdp, precheckinPanelLabel(lang));
    await capture(cdp, null, `syncxml-${lang}-precheckin-panel.png`, ".ses-panel");
    await clickByText(cdp, createPrecheckinLabel(lang));
    const tokenPath = await waitForPrecheckinLink(cdp);
    await capture(cdp, null, `syncxml-${lang}-precheckin-panel.png`, ".ses-panel");
    await capture(cdp, `${baseUrl}${tokenPath}?lang=${lang}`, `syncxml-${lang}-precheckin-form.png`, "main");

    await capture(cdp, `${baseUrl}/dashboard?lang=${lang}`, `syncxml-${lang}-dashboard.png`, "main");
    await capture(cdp, `${baseUrl}/dashboard?lang=${lang}`, `syncxml-${lang}-dashboard-detail.png`, "main");
    await cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: injectionId });
  }

  await cdp.close();
} finally {
  browser.kill("SIGTERM");
}

async function prepareApp(cdp, lang) {
  await reload(cdp, `${baseUrl}/app?lang=${lang}`);
  await cdp.send("Runtime.evaluate", {
    expression: `
      localStorage.setItem("anclora-syncxml-language", ${JSON.stringify(lang)});
      localStorage.setItem("anclora-syncxml-theme", "light");
      localStorage.setItem("anclora-syncxml-landing-locale", ${JSON.stringify(lang)});
      sessionStorage.removeItem("syncxml-session");
      document.cookie = "anclora-syncxml-language=${lang}; path=/";
      document.cookie = "anclora-syncxml-theme=light; path=/";
    `,
    awaitPromise: true,
  });
  await reload(cdp, `${baseUrl}/app?lang=${lang}`);
  await cdp.send("Runtime.evaluate", {
    expression: `
      sessionStorage.removeItem("syncxml-session");
      window.dispatchEvent(new Event("syncxml:new"));
    `,
    awaitPromise: true,
  });
  await waitForText(cdp, demoLabel(lang));
}

async function makeDemoReady(cdp) {
  await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const raw = sessionStorage.getItem("syncxml-session");
        if (!raw) throw new Error("Missing syncxml-session");
        const data = JSON.parse(raw);
        data.parsed.reservation.guestCount = data.parsed.guests.length;
        data.parsed.payment.paymentType = "TARJT";
        data.parsed.payment.paymentMethod = "TARJT";
        for (const guest of data.parsed.guests) {
          if (guest.sourceRow === 2) guest.documentSupport = "AAA000001";
          if (guest.sourceRow === 3) {
            guest.documentNumber = "P1234567";
            guest.relationship = "OT";
          }
          if (guest.sourceRow === 4) {
            guest.birthDate = "1995-12-13";
            guest.relationship = "OT";
          }
          if (guest.sourceRow === 5) {
            guest.documentNumber = "00000001R";
            guest.documentSupport = "AAA000002";
          }
          guest.errors = [];
          guest.warnings = [];
          guest.validationStatus = "VALID";
        }
        data.parsed.duplicates = [];
        data.parsed.validation = { status: "VALID", errors: [], warnings: [] };
        data.activeStep = 2;
        data.smartValidated = true;
        data.previewReviewed = true;
        data.mappingReviewed = true;
        sessionStorage.setItem("syncxml-session", JSON.stringify(data));
      })()
    `,
    awaitPromise: true,
  });
}

async function buildXmlSession(cdp) {
  const result = await cdp.send("Runtime.evaluate", {
    expression: `
      (async () => {
        const raw = sessionStorage.getItem("syncxml-session");
        if (!raw) throw new Error("Missing syncxml-session");
        const data = JSON.parse(raw);
        data.parsed.reservation.guestCount = data.parsed.guests.length;
        data.parsed.payment.paymentType = "TARJT";
        data.parsed.payment.paymentMethod = "TARJT";
        for (const guest of data.parsed.guests) {
          if (guest.sourceRow === 2) guest.documentSupport = "AAA000001";
          if (guest.sourceRow === 3) {
            guest.documentNumber = "P1234567";
            guest.relationship = "OT";
          }
          if (guest.sourceRow === 4) {
            guest.birthDate = "1995-12-13";
            guest.relationship = "OT";
          }
          if (guest.sourceRow === 5) {
            guest.documentNumber = "00000001R";
            guest.documentSupport = "AAA000002";
          }
          guest.errors = [];
          guest.warnings = [];
          guest.validationStatus = "VALID";
        }
        data.parsed.duplicates = [];
        data.parsed.validation = { status: "VALID", errors: [], warnings: [] };
        const response = await fetch("/api/generate/xml", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ parsed: data.parsed }),
        });
        if (!response.ok) throw new Error("generate failed " + response.status);
        const payload = await response.json();
        return JSON.stringify({
          activeStep: 3,
          parsed: data.parsed,
          generated: payload.generated,
          consolidated: false,
          smartValidated: true,
          previewReviewed: true,
          mappingReviewed: true,
        });
      })()
    `,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result.value;
}

async function injectAppSession(cdp, sessionJson) {
  const result = await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      (() => {
        if (location.pathname === "/app") {
          sessionStorage.setItem("syncxml-session", ${JSON.stringify(sessionJson)});
        }
      })();
    `,
  });
  return result.identifier;
}

async function capture(cdp, url, fileName, selector) {
  if (url) await reload(cdp, url);
  await waitForSelector(cdp, selector);
  await delay(550);
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true,
  });
  writeFileSync(path.join(outDir, fileName), Buffer.from(result.data, "base64"));
  console.log(`Captured docs/manual/screenshots/${fileName}`);
}

async function reload(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await waitLoad(cdp);
}

async function clickByText(cdp, text) {
  const escaped = JSON.stringify(text);
  const expression = `
    (() => {
      const target = [...document.querySelectorAll("button,a,label")]
        .find((el) => (el.textContent || "").includes(${escaped}));
      if (!target) throw new Error("Text not found: " + ${escaped});
      target.scrollIntoView({ block: "center", inline: "center" });
      target.click();
    })()
  `;
  await cdp.send("Runtime.evaluate", { expression, awaitPromise: true });
  await delay(400);
}

async function clickPrimaryButtonByText(cdp, text) {
  const escaped = JSON.stringify(text);
  const expression = `
    (() => {
      const target = [...document.querySelectorAll("button.btn-primary")]
        .find((el) => (el.textContent || "").includes(${escaped}) && !el.disabled);
      if (!target) throw new Error("Primary button not found or disabled: " + ${escaped});
      target.scrollIntoView({ block: "center", inline: "center" });
      target.click();
    })()
  `;
  await cdp.send("Runtime.evaluate", { expression, awaitPromise: true });
  await delay(700);
}

async function scrollToText(cdp, text) {
  await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const target = [...document.querySelectorAll("section,div,h2,h3,h4")]
          .find((el) => (el.textContent || "").includes(${JSON.stringify(text)}));
        if (target) target.scrollIntoView({ block: "start" });
      })()
    `,
    awaitPromise: true,
  });
  await delay(300);
}

async function waitForText(cdp, text, timeoutMs = 20000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for text: ${text}`);
}

async function waitForSessionParsed(cdp, timeoutMs = 10000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const raw = sessionStorage.getItem("syncxml-session");
          if (!raw) return false;
          const data = JSON.parse(raw);
          return Boolean(data.parsed && data.activeStep === 2);
        })()
      `,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(200);
  }
  throw new Error("Timed out waiting for parsed session");
}

async function waitForReadyReview(cdp, timeoutMs = 10000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const raw = sessionStorage.getItem("syncxml-session");
          if (!raw) return false;
          const data = JSON.parse(raw);
          const button = [...document.querySelectorAll("button.btn-primary")]
            .find((el) => (el.textContent || "").match(/Generar XML|Generate XML|XML erzeugen/));
          return Boolean(data.previewReviewed && data.mappingReviewed && button && !button.disabled);
        })()
      `,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(250);
  }
  throw new Error("Timed out waiting for ready review");
}

async function waitForSelector(cdp, selector, timeoutMs = 20000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for selector: ${selector}`);
}

async function waitForPrecheckinLink(cdp) {
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const href = [...document.querySelectorAll("a[href*='/precheckin/']")].at(-1)?.getAttribute("href");
          return href ? new URL(href, window.location.origin).pathname : "";
        })()
      `,
      returnByValue: true,
    });
    if (result.result.value) return result.result.value;
    await delay(300);
  }
  throw new Error("Timed out waiting for pre-check-in link");
}

async function waitLoad(cdp) {
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    }).catch(() => null);
    if (result?.result?.value === "complete") return;
    await delay(200);
  }
  throw new Error("Page load timeout");
}

function waitForChrome() {
  return retryJson("http://127.0.0.1:9333/json/version");
}

async function newPage() {
  return retryJson(`http://127.0.0.1:9333/json/new?${encodeURIComponent("about:blank")}`, "PUT");
}

function retryJson(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 15000;
    const attempt = () => {
      const req = http.request(url, { method }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
        });
      });
      req.on("error", () => {
        if (Date.now() > deadline) reject(new Error(`Could not reach ${url}`));
        else setTimeout(attempt, 250);
      });
      req.end();
    };
    attempt();
  });
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result ?? {});
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const nextId = ++id;
          ws.send(JSON.stringify({ id: nextId, method, params }));
          return new Promise((res, rej) => pending.set(nextId, { resolve: res, reject: rej }));
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener("error", reject);
  });
}

function demoLabel(lang) {
  return ({ es: "Ver demo con datos sintéticos", en: "View demo with synthetic data", de: "Demo mit synthetischen Daten ansehen" })[lang];
}

function loadedLabel(lang) {
  return ({ es: "Demo cargada", en: "Demo loaded", de: "Demo geladen" })[lang];
}

function generateLabel(lang) {
  return ({ es: "Generar XML", en: "Generate XML", de: "XML erzeugen" })[lang];
}

function xmlReadyLabel(lang) {
  return ({ es: "XML generado", en: "XML generated", de: "XML erzeugt" })[lang];
}

function precheckinPanelLabel(lang) {
  return ({ es: "Pre-check-in de prueba", en: "Test pre-check-in", de: "Test-Pre-Check-in" })[lang];
}

function createPrecheckinLabel(lang) {
  return ({ es: "Crear enlace", en: "Create link", de: "Link erstellen" })[lang];
}
