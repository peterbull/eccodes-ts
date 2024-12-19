
//#nbts@code
import { EccodesWrapper } from "../src/index.ts";
import pl from "npm:nodejs-polars";
import {
  ParameterUnits,
  BaseGrib2Message,
  WaveParameter,
  WindParameter,
  GribParameter,
  ParameterCategory,
  WaveParameterNumber,
  WindParameterNumber,
  GribMetadata,
  ParameterMetadata,
} from "../src/types/types.ts";

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
await res.getPrimaryWaveDirection();

//#nbts@code
const data = await res.readToJson();

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
