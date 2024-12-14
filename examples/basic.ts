import { EccodesWrapper } from "@/index";

async function main() {
  const wrapper = new EccodesWrapper("/path/to/your/file.grib");

  try {
    // Read entire file as JSON
    const data = await wrapper.readToJson();
    console.log("GRIB data:", data);

    // Get specific keys
    const keys = await wrapper.getKeys(["shortName", "level", "date"]);
    console.log("Specific keys:", keys);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
