
//#nbts@code
import { EccodesWrapper } from "../src/index.ts";

//#nbts@code
const datapath = `./data/gefs.wave.grib2`;
const res = new EccodesWrapper(datapath);

//#nbts@code
const data = await res.readToJson();

//#nbts@code
data[0];

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
for (const res of data) {
  for (const key of changingKeys) {
    console.log(res[key]);
  }
}

//#nbts@code
const uniqueVals: { [key: string]: number[] | string } = {};
changingKeys.forEach(
  (key) => (uniqueVals[key] = [...new Set(data.map((item) => item[key]))])
);

//#nbts@code
uniqueVals;

//#nbts@code
await Deno.writeTextFile(
  "./data/uniqueWaveParams.json",
  JSON.stringify(uniqueVals, null, 2)
);

//#nbts@code

//#nbts@code
