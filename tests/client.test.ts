import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { EccodesWrapper } from "@/client";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";

describe("EccodesWrapper", () => {
  const testFilePath = path.join(__dirname, "fixtures/gefs.wave.grib2");
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

    it("should create instance with valid file path", () => {
      const customWrapper = new EccodesWrapper(testFilePath);
      expect(customWrapper).toBeInstanceOf(EccodesWrapper);
    });
  });

  describe("wave parameter methods", () => {
    it("should get significant wave height", async () => {
      const data = await wrapper.getSignificantWaveHeight();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
        expect(data[0].parameterNumber).toBe(
          OceanographicWaveParameterNumber.SignificantHeightCombined
        );
      }
    });

    it("should get primary wave period", async () => {
      const data = await wrapper.getPrimaryWavePeriod();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
        expect(data[0].parameterNumber).toBe(
          OceanographicWaveParameterNumber.PrimaryWavePeriod
        );
      }
    });

    it("should get primary wave direction", async () => {
      const data = await wrapper.getPrimaryWaveDirection();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
        expect(data[0].parameterNumber).toBe(
          OceanographicWaveParameterNumber.PrimaryWaveDirection
        );
      }
    });
  });

  describe("wind parameter methods", () => {
    it("should get wind speed", async () => {
      const data = await wrapper.getWindSpeed();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          MeteorologicalParameterCategory.Momentum
        );
        expect(data[0].parameterNumber).toBe(
          MeteorologicalMomentumParameterNumber.WindSpeed
        );
      }
    });

    it("should get wind direction", async () => {
      const data = await wrapper.getWindDirection();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          MeteorologicalParameterCategory.Momentum
        );
        expect(data[0].parameterNumber).toBe(
          MeteorologicalMomentumParameterNumber.WindDirection
        );
      }
    });
  });

  describe("parameter type methods", () => {
    it("should get all wave parameters", async () => {
      const data = await wrapper.getWaveParameters();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
      }
    });

    it("should get all wind parameters", async () => {
      const data = await wrapper.getWindParameters();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          MeteorologicalParameterCategory.Momentum
        );
      }
    });

    it("should get parameters by type", async () => {
      const data = await wrapper.getParametersByType(
        OceanographicParameterCategory.Waves,
        OceanographicWaveParameterNumber.SignificantHeightCombined
      );
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
        expect(data[0].parameterNumber).toBe(
          OceanographicWaveParameterNumber.SignificantHeightCombined
        );
      }
    });

    it("should get parameters with custom keys", async () => {
      const customKeys = ["shortName", "maximum", "minimum"];
      const data = await wrapper.getParametersByType(
        OceanographicParameterCategory.Waves,
        OceanographicWaveParameterNumber.SignificantHeightCombined,
        customKeys
      );
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(Object.keys(data[0])).toEqual(
          expect.arrayContaining(customKeys)
        );
      }
    });
  });

  describe("metadata methods", () => {
    it("should return all required metadata keys", async () => {
      const data = await wrapper.getMetadata();
      const requiredKeys = [
        "gridType",
        "Ni",
        "Nj",
        "latitudeOfFirstGridPointInDegrees",
        "longitudeOfFirstGridPointInDegrees",
      ];

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        requiredKeys.forEach((key) => {
          expect(data[0]).toHaveProperty(key);
        });
      }
    });
  });

  describe("readToJson", () => {
    it("should return complete message structure", async () => {
      const data = await wrapper.readToJson();
      const requiredKeys = [
        "parameterCategory",
        "parameterNumber",
        "parameterName",
        "values",
        "maximum",
        "minimum",
      ];

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        requiredKeys.forEach((key) => {
          expect(data[0]).toHaveProperty(key);
        });
      }
    });

    it("should handle empty values array", async () => {
      const data = await wrapper.readToJson();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(Array.isArray(data[0].values)).toBe(true);
      }
    });
  });
});
