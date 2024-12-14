import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { EccodesWrapper } from "@/index";

describe("EccodesWrapper", () => {
  const testFilePath = path.join(__dirname, "fixtures/gefs.wave.grib2");
  const nonExistentPath = "non/existent/path.grib2";
  let wrapper: EccodesWrapper;

  beforeEach(() => {
    wrapper = new EccodesWrapper(testFilePath);
  });

  describe("constructor", () => {
    it("should throw error when no file path provided", () => {
      expect(() => new EccodesWrapper("")).toThrow(
        "GRIB file path is required"
      );
    });

    it("should create instance with custom exec options", () => {
      const customWrapper = new EccodesWrapper(testFilePath, { timeout: 5000 });
      expect(customWrapper).toBeInstanceOf(EccodesWrapper);
    });
  });

  describe("readToJson", () => {
    it("should read GRIB file to JSON with correct structure", async () => {
      const data = await wrapper.readToJson();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toBeInstanceOf(Object);
      }
    });

    it("should throw error when file not found", async () => {
      const invalidWrapper = new EccodesWrapper(nonExistentPath);
      await expect(invalidWrapper.readToJson()).rejects.toThrow(
        "GRIB file not found"
      );
    });

    it("should throw error when buffer size exceeded", async () => {
      const smallBufferWrapper = new EccodesWrapper(testFilePath, {
        maxBuffer: 1,
      });
      await expect(smallBufferWrapper.readToJson()).rejects.toThrow(
        "GRIB file too large"
      );
    });
  });

  describe("getKeys", () => {
    it("should get single key", async () => {
      const result = await wrapper.getKeys(["shortName"]);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should get multiple keys", async () => {
      const result = await wrapper.getKeys(["shortName", "level", "date"]);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result.split("\n").length).toBeGreaterThan(0);
    });

    it("should throw error when no keys provided", async () => {
      await expect(wrapper.getKeys([])).rejects.toThrow(
        "At least one key must be specified"
      );
    });

    it("should throw error when file not found", async () => {
      const invalidWrapper = new EccodesWrapper(nonExistentPath);
      await expect(invalidWrapper.getKeys(["shortName"])).rejects.toThrow(
        "GRIB file not found"
      );
    });
  });
});
