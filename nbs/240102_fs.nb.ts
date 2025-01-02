
//#nbts@code
import { EccodesWrapper } from "../src/client.ts";

//#nbts@code
export function formatDateYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export type Epoch = "00" | "06" | "12" | "18";

export async function getMeanGlobalForecastUrls() {
  const date = new Date();
  const formattedDate = formatDateYYYYMMDD(date);
  const epoch: Epoch = "00";
  const stream = await fetch(
    `https://nomads.ncep.noaa.gov/pub/data/nccf/com/gens/prod/gefs.${formattedDate}/${epoch}/wave/gridded/gefs.wave.t00z.mean.global.0p25.f000.grib2`
  );
  return stream;
}

//#nbts@code
const res = await getMeanGlobalForecastUrls();

//#nbts@code
res;

//#nbts@code
const wrapper = new EccodesWrapper(res.body);

//#nbts@code
const data = await wrapper.getSignificantWaveHeight();

//#nbts@code
data[0];

//#nbts@code
