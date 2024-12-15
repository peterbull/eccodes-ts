import { EccodesWrapper } from "@/index";

const datapath = `./data/gefs.wave.grib2`;
const res = new EccodesWrapper(datapath);

async function main() {
  const data = await res.getPrimaryWavePeriod();
  console.log(data);
}

(async () => await main().catch(console.error))();
