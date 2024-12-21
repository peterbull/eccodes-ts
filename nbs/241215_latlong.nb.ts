
//#nbts@code
import { EccodesWrapper } from "../src/client.ts";
import pl from "npm:nodejs-polars";

//#nbts@code
function dfShow() {
  console.log(df.toString());
}

//#nbts@code
pl.Config.setTblWidthChars(3000);
pl.Config.setTblCols(14);

//#nbts@code
const datapath = `./data/gefs.wave.grib2`;
const res = new EccodesWrapper(datapath);

//#nbts@code

//#nbts@code
await res.getSignificantWaveHeight();

//#nbts@code
const data = await res.getSignificantWaveHeight();

//#nbts@code
const df = pl.DataFrame(data);

//#nbts@code
dfShow();

//#nbts@code
const categoryKeys = Object.keys(ParameterCategory).filter((key) =>
  isNaN(Number(key))
);

//#nbts@code
await res.getSignificantWaveHeight();

//#nbts@code
