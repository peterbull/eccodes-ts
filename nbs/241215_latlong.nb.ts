
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
const waveHeight = await res.getSignificantWaveHeight();

//#nbts@code
type LocationForecast = {
  lat: number;
  lon: number;
  value: number;
};

//#nbts@code
waveHeight[0].values.filter(
  (item: LocationForecast) => item.lat === 39.5 && item.lon === -170
);

//#nbts@code
function convertLongitude(lon: number) {
  return lon > 180 ? lon - 360 : lon;
}

//#nbts@code
let index = 0;
const spotForecast = [];
for (let j = 0; j < 721; j++) {
  const lat = 90 - j * 0.25;
  for (let i = 0; i < 1440; i++) {
    let lon = i * 0.25;
    lon = convertLongitude(lon);
    const value = waveHeight[0].values[index];
    const res: LocationForecast = {
      lat: lat,
      lon: lon,
      value: value,
    };
    spotForecast.push(res);
    index++;
  }
}

//#nbts@code
spotForecast.filter((item) => item.lat === 39.5 && item.lon === -170);

//#nbts@code
const df = pl.DataFrame(spotForecast);

//#nbts@code
dfShow();

//#nbts@code
await res.getSignificantWaveHeight();

//#nbts@code
