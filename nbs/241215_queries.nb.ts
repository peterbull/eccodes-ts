
//#nbts@code
import { EccodesWrapper } from "../src/index.ts";

//#nbts@code
const datapath = `./data/gefs.wave.grib2`;
const res = new EccodesWrapper(datapath);

//#nbts@code
console.time("readToJson");
await res.readToJson();
console.timeEnd("readToJson");

//#nbts@code
console.time("primarywavedir");
const initialMemory = Deno.memoryUsage().heapUsed;
await res.getPrimaryWaveDirection();
const finalMemory = Deno.memoryUsage().heapUsed;
console.timeEnd("primarywavedir");
console.log(`Memory used: ${(finalMemory - initialMemory) / 1024 / 1024} MB`);

//#nbts@code
async function benchmarkMethod(method: () => Promise<unknown>) {
  console.time("benchmark");
  await method();
  console.timeEnd("benchmark");
}

//#nbts@code
await benchmarkMethod(() => res.getPrimaryWavePeriod());

//#nbts@code
