import { EccodesWrapper } from "@/client";

async function main() {
  const wrapper = new EccodesWrapper("/path/to/your/file.grib");

  try {
    // Read entire file as JSON
    const data = await wrapper.readToJson();
    console.log("GRIB data:", data);

    // Get specific data
    const swh = wrapper.getSignificantWaveHeight();
    console.log("Specific keys:", swh);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
