import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";
import { MomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { WaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { GribParameterUnits } from "@/types/discipline/units/types";

export enum DisciplineCategory {
  Meteorological = 0,
  Hydrological = 1,
  LandSurface = 2,
  SatelliteRemoteSensing = 3,
  SpaceWeather = 4,
  Oceanographic = 10,
  HealthAndSocioeconomic = 20,
  Missing = 255,
}

export type ParameterNumber = WaveParameterNumber | MomentumParameterNumber;

// Base GRIB2 message interface
export interface BaseGrib2Message {
  // Essential metadata
  discipline: number;
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
  values: (number | null)[];
  maximum: number;
  minimum: number;
  average: number;
  numberOfValues: number;
  numberOfMissing: number;

  // Parameter identification
  parameterCategory:
    | OceanographicParameterCategory
    | MeteorologicalParameterCategory;
  parameterNumber: WaveParameterNumber | MomentumParameterNumber;
  parameterUnits: GribParameterUnits;
  parameterName: string;
  shortName: string;
  cfVarName: string;
}

// Wave Parameter Interfaces
export interface WaveHeight extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: WaveParameterNumber.SignificantHeightCombined;
  parameterUnits: GribParameterUnits.Meters;
  parameterName: "Significant height of combined wind waves and swell";
  shortName: "swh";
  cfVarName: "swh";
}

export interface WavePeriod extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: WaveParameterNumber.PrimaryWavePeriod;
  parameterUnits: GribParameterUnits.Seconds;
  parameterName: "Primary wave mean period";
  shortName: "perpw";
  cfVarName: "perpw";
}

export interface WaveDirection extends BaseGrib2Message {
  parameterCategory: OceanographicParameterCategory.Waves;
  parameterNumber: WaveParameterNumber.PrimaryWaveDirection;
  parameterUnits: GribParameterUnits.DegreeTrue;
  parameterName: "Primary wave direction";
  shortName: "dirpw";
  cfVarName: "dirpw";
}

// Wind Parameter Interfaces
export interface WindSpeed extends BaseGrib2Message {
  parameterCategory: MeteorologicalParameterCategory.Momentum;
  parameterNumber: MomentumParameterNumber.WindSpeed;
  parameterUnits: GribParameterUnits.MetersPerSecond;
  parameterName: "Wind speed";
  shortName: "ws";
  cfVarName: "ws";
}

export interface WindDirection extends BaseGrib2Message {
  parameterCategory: MeteorologicalParameterCategory.Momentum;
  parameterNumber: MomentumParameterNumber.WindDirection;
  parameterUnits: GribParameterUnits.DegreeTrue;
  parameterName: "Wind direction (from which blowing)";
  shortName: "wdir";
  cfVarName: "wdir";
}

// Type guards
export const isWaveHeight = (msg: BaseGrib2Message): msg is WaveHeight => {
  return (
    msg.parameterCategory === OceanographicParameterCategory.Waves &&
    msg.parameterNumber === WaveParameterNumber.SignificantHeightCombined
  );
};

export const isWavePeriod = (msg: BaseGrib2Message): msg is WavePeriod => {
  return (
    msg.parameterCategory === OceanographicParameterCategory.Waves &&
    msg.parameterNumber === WaveParameterNumber.PrimaryWavePeriod
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
  values: (number | null)[];
  maximum: number;
  minimum: number;
  average: number;
  standardDeviation: number;
}
