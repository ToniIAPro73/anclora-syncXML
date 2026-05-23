import { syncIneMunicipios } from "../src/lib/ine/municipios";

const summary = await syncIneMunicipios();
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.ok ? 0 : 1);
