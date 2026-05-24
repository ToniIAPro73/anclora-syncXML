import { syncIneMunicipios, type IneMunicipioRaw } from "../src/lib/ine/municipios";

const INE_URL = "https://servicios.ine.es/wstempus/js/ES/VALORES_VARIABLE/19";

async function fetchAllNoTimeout(): Promise<IneMunicipioRaw[]> {
  const response = await fetch(INE_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`INE respondió ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data as IneMunicipioRaw[] : [];
}

const summary = await syncIneMunicipios({ fetchAll: fetchAllNoTimeout });
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.ok ? 0 : 1);
