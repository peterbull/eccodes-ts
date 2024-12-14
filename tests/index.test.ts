import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { EccodesWrapper } from "@/index";

describe("EccodesWrapper", () => {
  const testFilePath = path.join(__dirname, "fixtures/gefs.wave.grib2");
  let wrapper: EccodesWrapper;

  beforeEach(() => {
    wrapper = new EccodesWrapper(testFilePath);
  });

  it("should throw error when no file path provided", () => {
    expect(() => new EccodesWrapper("")).toThrow("GRIB file path is required");
  });

  it("should read GRIB file to JSON", async () => {
    const data = await wrapper.readToJson();
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it("should get specific keys", async () => {
    const result = await wrapper.getKeys(["shortName", "level"]);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should throw error when no keys provided", async () => {
    await expect(wrapper.getKeys([])).rejects.toThrow(
      "At least one key must be specified"
    );
  });
});
