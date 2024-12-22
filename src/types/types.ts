import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { GribParameterUnits } from "@/types/discipline/units/types";

export enum Discipline {
  Meteorological = 0,
  Hydrological = 1,
  LandSurface = 2,
  SatelliteRemoteSensing = 3,
  SpaceWeather = 4,
  Oceanographic = 10,
  HealthAndSocioeconomic = 20,
  Missing = 255,
}
export type ParameterCategory =
  | OceanographicParameterCategory
  | MeteorologicalParameterCategory;

export type ParameterNumber =
  | OceanographicWaveParameterNumber
  | MeteorologicalMomentumParameterNumber;

export type LocationForecast = {
  lat: number;
  lon: number;
  value: number | null;
};
// Base GRIB2 message interface
export interface BaseGrib2Message {
  // Essential metadata
  discipline: Discipline;
  editionNumber: number;
  centre: number;
  subCentre: number;

  // Grid definition
  gridDefinitionTemplateNumber: number;
  Ni: number;
  Nj: number;
  gridType: string;

  // Geographical bounds
  latitudeOfFirstGridPointInDegrees: number;
  longitudeOfFirstGridPointInDegrees: number;
  latitudeOfLastGridPointInDegrees: number;
  longitudeOfLastGridPointInDegrees: number;
  iDirectionIncrementInDegrees: number;
  jDirectionIncrementInDegrees: number;

  // Time information
  dataDate: number;
  dataTime: number;
  forecastTime: number;
  stepRange: string;

  // Data values and statistics
  values: (number | null | LocationForecast)[];
  maximum: number;
  minimum: number;
  average: number;
  numberOfValues: number;
  numberOfMissing: number;

  // Parameter identification
  parameterCategory: ParameterCategory;
  parameterNumber: ParameterNumber;
  parameterUnits: GribParameterUnits;
  parameterName: string;
  shortName: string;
  cfVarName: string;
}

// Wave Parameter Interfaces
export interface WaveHeight extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: OceanographicWaveParameterNumber.SignificantHeightCombined;
  parameterUnits: GribParameterUnits.Meters;
}

export interface WavePeriod extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: OceanographicWaveParameterNumber.PrimaryWavePeriod;
  parameterUnits: GribParameterUnits.Seconds;
}

export interface WaveDirection extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: OceanographicWaveParameterNumber.PrimaryWaveDirection;
  parameterUnits: GribParameterUnits.DegreeTrue;
}

// Wind Parameter Interfaces
export interface WindSpeed extends BaseGrib2Message {
  parameterCategory: MeteorologicalParameterCategory.Momentum;
  parameterNumber: MeteorologicalMomentumParameterNumber.WindSpeed;
  parameterUnits: GribParameterUnits.MetersPerSecond;
}

export interface WindDirection extends BaseGrib2Message {
  parameterCategory: MeteorologicalParameterCategory.Momentum;
  parameterNumber: MeteorologicalMomentumParameterNumber.WindDirection;
  parameterUnits: GribParameterUnits.DegreeTrue;
}

// Type guards
export const isWaveHeight = (msg: BaseGrib2Message): msg is WaveHeight => {
  return (
    msg.parameterCategory === OceanographicParameterCategory.Waves &&
    msg.parameterNumber ===
      OceanographicWaveParameterNumber.SignificantHeightCombined
  );
};

export const isWavePeriod = (msg: BaseGrib2Message): msg is WavePeriod => {
  return (
    msg.parameterCategory === OceanographicParameterCategory.Waves &&
    msg.parameterNumber === OceanographicWaveParameterNumber.PrimaryWavePeriod
  );
};

// Union types for categories
export type WaveParameter = WaveHeight | WavePeriod | WaveDirection;
export type WindParameter = WindSpeed | WindDirection;
export type GribParameter = WaveParameter | WindParameter;

// Output message interface
export interface StdOutMsg {
  messages: GribParameter[];
  [key: string]: unknown;
}

// Parameter metadata interface (for the structure you shared)
export interface ParameterMetadata {
  parameterCategory: number[];
  parameterNumber: number[];
  parameterUnits: string[];
  parameterName: string[];
  shortName: string[];
  cfVarName: string[];
}

export interface GribMetadata {
  // Grid information
  gridType: string;
  Ni: number;
  Nj: number;
  latitudeOfFirstGridPointInDegrees: number;
  longitudeOfFirstGridPointInDegrees: number;
  latitudeOfLastGridPointInDegrees: number;
  longitudeOfLastGridPointInDegrees: number;
  iDirectionIncrementInDegrees: number;
  jDirectionIncrementInDegrees: number;

  // Processing information
  centre: number;
  editionNumber: number;
  typeOfGeneratingProcess: number;
  generatingProcessIdentifier: number;

  // Time and forecast details
  dataDate: number;
  dataTime: number;
  stepUnits: string;
  forecastTime: number;
  stepRange: string;

  // Statistical properties
  numberOfValues: number;
  numberOfMissing: number;
  getNumberOfValues: number;
}

export interface ForecastMessage {
  metadata: GribMetadata;
  parameterCategory: number;
  parameterNumber: number;
  parameterName: string;
  parameterUnits: string;
  shortName: string;
  values: (number | null | LocationForecast)[];
  maximum: number;
  minimum: number;
  average: number;
  standardDeviation: number;
}
