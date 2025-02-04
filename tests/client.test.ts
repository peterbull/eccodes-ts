import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { EccodesWrapper } from "@/client";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";
import { LocationForecast } from "@/types/types";

describe("EccodesWrapper", () => {
  const testFilePath = path.join(__dirname, "fixtures/gefs.wave.grib2");
  let wrapper: EccodesWrapper;

  beforeEach(() => {
    wrapper = new EccodesWrapper(testFilePath);
  });

  describe("constructor", () => {
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

    it("should get wind wave height", async () => {
      const data = await wrapper.getSignificantWindWaveHeight();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(
          OceanographicParameterCategory.Waves
        );
        expect(data[0].parameterNumber).toBe(
          OceanographicWaveParameterNumber.WindWaveHeight
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
      const data = await wrapper.getParametersByType({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
      });
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
      const data = await wrapper.getParametersByType({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
        keys: customKeys,
      });
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

    it("should add lat/lon when requested", async () => {
      const data = await wrapper.readToJson({ addLatLon: true });
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0 && Array.isArray(data[0].values)) {
        expect(data[0].values[0]).toHaveProperty("lat");
        expect(data[0].values[0]).toHaveProperty("lon");
        expect(data[0].values[0]).toHaveProperty("value");
      }
    });
  });

  describe("location mapping", () => {
    it("should add lat/lon to wave parameters when requested", async () => {
      const data = await wrapper.getWaveParameters({ addLatLon: true });
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0 && Array.isArray(data[0].values)) {
        expect(data[0].values[0]).toHaveProperty("lat");
        expect(data[0].values[0]).toHaveProperty("lon");
        expect(data[0].values[0]).toHaveProperty("value");
      }
    });

    it("should add lat/lon to wind parameters when requested", async () => {
      const data = await wrapper.getWindParameters({ addLatLon: true });
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0 && Array.isArray(data[0].values)) {
        expect(data[0].values[0]).toHaveProperty("lat");
        expect(data[0].values[0]).toHaveProperty("lon");
        expect(data[0].values[0]).toHaveProperty("value");
      }
    });

    it("should map values to correct lat/lon coordinates", async () => {
      const data = await wrapper.getSignificantWaveHeight({ addLatLon: true });
      if (data.length > 0 && Array.isArray(data[0].values)) {
        const firstPoint = data[0].values[0] as LocationForecast;
        if (firstPoint && typeof firstPoint !== "number") {
          expect(firstPoint.lat).toBe(90); // Should start at 90° North
          expect(firstPoint.lon).toBe(0); // Should start at Prime Meridian
        }
      }
    });
  });

  describe("command stream parameters", () => {
    it("should generate correct command parameters", () => {
      const params = wrapper.getCommandStreamParams({
        discipline: 0,
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
      });
      expect(params).toBe("discipline=0,parameterCategory=0,parameterNumber=3");
    });

    it("should handle partial command parameters", () => {
      const params = wrapper.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
      });
      expect(params).toBe("parameterCategory=0");
    });
  });
});
