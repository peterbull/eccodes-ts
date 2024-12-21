//#nbts@code
import { EccodesWrapper } from "../src/client.js";

//#nbts@code
const date = new Date();

const formattedDate = `${date.getUTCFullYear()}${String(
  date.getMonth() + 1
).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;

await Deno.mkdir("./data", { recursive: true });

const response = await fetch(
  `https://nomads.ncep.noaa.gov/pub/data/nccf/com/gens/prod/gefs.${formattedDate}/00/atmos/pgrb2sp25/geavg.t00z.pgrb2s.0p25.f000`
);

//#nbts@code
const datapath = `./data/gefs.atmos.grib2`;

//#nbts@code
const fileStream = await Deno.create(datapath);
if (response.body) {
  for await (const chunk of response.body) {
    await fileStream.write(chunk);
  }
}
fileStream.close();

//#nbts@code
const res = new EccodesWrapper(datapath);

//#nbts@code
res;

//#nbts@code
const data = await res.readToJson();

//#nbts@code
await Deno.writeTextFile(
  "./data/atmosEx.json",
  JSON.stringify(data[1], null, 2)
);

//#nbts@code
const changingKeys = [
  "discipline",
  "parameterCategory",
  "parameterNumber",
  "parameterUnits",
  "parameterName",
  "shortName",
  "cfVarName",
];

//#nbts@code
const uniqueVals: { [key: string]: number[] | string } = {};
changingKeys.forEach(
  (key) => (uniqueVals[key] = [...new Set(data.map((item) => item[key]))])
);

//#nbts@code
await Deno.writeTextFile(
  "./data/uniqueAtmosParams.json",
  JSON.stringify(uniqueVals, null, 2)
);

//#nbts@code
