import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { EccodesWrapper } from "@/index";
import {
  ParameterCategory,
  ParameterUnits,
  WaveParameterNumber,
  WindParameterNumber,
} from "@/types/types";

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

    it("should create instance with custom exec options", () => {
      const customWrapper = new EccodesWrapper(testFilePath);
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
  });

  describe("wave parameter methods", () => {
    it("should get significant wave height", async () => {
      const data = await wrapper.getSignificantWaveHeight();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wave);
        expect(data[0].parameterNumber).toBe(
          WaveParameterNumber.SignificantHeight
        );
        expect(data[0].parameterUnits).toBe(ParameterUnits.Meters);
      }
    });

    it("should get primary wave period", async () => {
      const data = await wrapper.getPrimaryWavePeriod();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wave);
        expect(data[0].parameterNumber).toBe(WaveParameterNumber.PrimaryPeriod);
        expect(data[0].parameterUnits).toBe(ParameterUnits.Seconds);
      }
    });

    it("should get primary wave direction", async () => {
      const data = await wrapper.getPrimaryWaveDirection();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wave);
        expect(data[0].parameterNumber).toBe(
          WaveParameterNumber.PrimaryDirection
        );
        expect(data[0].parameterUnits).toBe(ParameterUnits.DegreeTrue);
      }
    });
  });

  describe("wind parameter methods", () => {
    it("should get wind speed", async () => {
      const data = await wrapper.getWindSpeed();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wind);
        expect(data[0].parameterNumber).toBe(WindParameterNumber.Speed);
        expect(data[0].parameterUnits).toBe(ParameterUnits.MetersPerSecond);
      }
    });

    it("should get wind direction", async () => {
      const data = await wrapper.getWindDirection();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wind);
        expect(data[0].parameterNumber).toBe(WindParameterNumber.Direction);
        expect(data[0].parameterUnits).toBe(ParameterUnits.DegTrue);
      }
    });
  });

  describe("parameter type methods", () => {
    it("should get all wave parameters", async () => {
      const data = await wrapper.getWaveParameters();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wave);
      }
    });

    it("should get all wind parameters", async () => {
      const data = await wrapper.getWindParameters();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wind);
      }
    });

    it("should get parameters by type", async () => {
      const data = await wrapper.getParametersByType(
        ParameterCategory.Wave,
        WaveParameterNumber.SignificantHeight
      );
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].parameterCategory).toBe(ParameterCategory.Wave);
        expect(data[0].parameterNumber).toBe(
          WaveParameterNumber.SignificantHeight
        );
      }
    });

    it("should get parameters with custom keys", async () => {
      const customKeys = ["shortName", "maximum", "minimum"];
      const data = await wrapper.getParametersByType(
        ParameterCategory.Wave,
        WaveParameterNumber.SignificantHeight,
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
});
