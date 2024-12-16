
//#nbts@code
import { EccodesWrapper } from "../src/index.ts";
import pl from "npm:nodejs-polars";

//#nbts@code
pl.Config.setAsciiTables();

//#nbts@code
const datapath = `./data/gefs.wave.grib2`;
const res = new EccodesWrapper(datapath);

//#nbts@code
await res.getPrimaryWaveDirection();

//#nbts@code
await res.readToJson();

//#nbts@code
const test = await res.getSignificantWaveHeight();

//#nbts@code
Object.keys(test[0]);

//#nbts@code
const fullRes = await res.readToJson();

//#nbts@code
Object.keys(fullRes[0]);

//#nbts@code
await res.getMetadata();

//#nbts@code
const data = await res.getSignificantWaveHeight();

//#nbts@code
const df = pl.DataFrame(data);

//#nbts@code
console.log(df.toString());

//#nbts@code
df.columns;

//#nbts@code
