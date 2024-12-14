
//#nbts@code
import { EccodesWrapper } from "../src/index.ts";

//#nbts@code
const date = new Date();

const formattedDate = `${date.getUTCFullYear()}${String(
  date.getMonth() + 1
).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;

await Deno.mkdir("./data", { recursive: true });

const response = await fetch(
  `https://nomads.ncep.noaa.gov/pub/data/nccf/com/gens/prod/gefs.${formattedDate}/00/wave/gridded/gefs.wave.t00z.mean.global.0p25.f000.grib2`
);

//#nbts@code
const datapath = `./data/${formattedDate}.gefs.wave.grib2`;

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
const data = await res.readToJson();

//#nbts@code
const msgArrs = data.messages[0].map(({ key, value }) => [key, value]);

//#nbts@code

//#nbts@code
const msgObjs = [];
for (let i = 0; i < data.messages.length; i++) {
  const msgArrs = data.messages[i].map(({ key, value }) => [key, value]);
  msgObjs.push(Object.fromEntries(msgArrs));
}

//#nbts@code
msgObjs[0];

//#nbts@code
for (const msg in data.messages) {
  Object.fromEntries();
}
data.messages[0];

//#nbts@code
const dataArr = data.messages[0].map((item) => [item.key, item.value]);

//#nbts@code
const jsonData = Object.fromEntries(dataArr);

//#nbts@code
await Deno.writeTextFile("gribEx.json", JSON.stringify(jsonData, null, 2));

//#nbts@code
