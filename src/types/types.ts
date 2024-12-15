// Enums for parameter categories and their values
export enum ParameterCategory {
  Wave = 0,
  Wind = 2,
}

// Parameter number mappings
export enum WaveParameterNumber {
  SignificantHeight = 3,
  PrimaryPeriod = 11,
  PrimaryDirection = 10,
  WindWaveHeight = 5,
  WindWavePeriod = 6,
  WindWaveDirection = 4,
  SwellHeight = 8,
  SwellPeriod = 9,
}

export enum WindParameterNumber {
  Speed = 1,
  Direction = 0,
}

// Units
export enum ParameterUnits {
  Meters = "m",
  Seconds = "s",
  DegreeTrue = "Degree true",
  MetersPerSecond = "m s-1",
  DegTrue = "deg true",
}

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
  parameterCategory: ParameterCategory;
  parameterNumber: WaveParameterNumber | WindParameterNumber;
  parameterUnits: ParameterUnits;
  parameterName: string;
  shortName: string;
  cfVarName: string;
}

// Wave Parameter Interfaces
export interface WaveHeight extends BaseGrib2Message {
  parameterCategory: ParameterCategory.Wave;
  parameterNumber: WaveParameterNumber.SignificantHeight;
  parameterUnits: ParameterUnits.Meters;
  parameterName: "Significant height of combined wind waves and swell";
  shortName: "swh";
  cfVarName: "swh";
}

export interface WavePeriod extends BaseGrib2Message {
  parameterCategory: ParameterCategory.Wave;
  parameterNumber: WaveParameterNumber.PrimaryPeriod;
  parameterUnits: ParameterUnits.Seconds;
  parameterName: "Primary wave mean period";
  shortName: "perpw";
  cfVarName: "perpw";
}

export interface WaveDirection extends BaseGrib2Message {
  parameterCategory: ParameterCategory.Wave;
  parameterNumber: WaveParameterNumber.PrimaryDirection;
  parameterUnits: ParameterUnits.DegreeTrue;
  parameterName: "Primary wave direction";
  shortName: "dirpw";
  cfVarName: "dirpw";
}

// Wind Parameter Interfaces
export interface WindSpeed extends BaseGrib2Message {
  parameterCategory: ParameterCategory.Wind;
  parameterNumber: WindParameterNumber.Speed;
  parameterUnits: ParameterUnits.MetersPerSecond;
  parameterName: "Wind speed";
  shortName: "ws";
  cfVarName: "ws";
}

export interface WindDirection extends BaseGrib2Message {
  parameterCategory: ParameterCategory.Wind;
  parameterNumber: WindParameterNumber.Direction;
  parameterUnits: ParameterUnits.DegTrue;
  parameterName: "Wind direction (from which blowing)";
  shortName: "wdir";
  cfVarName: "wdir";
}

// Type guards
export const isWaveHeight = (msg: BaseGrib2Message): msg is WaveHeight => {
  return (
    msg.parameterCategory === ParameterCategory.Wave &&
    msg.parameterNumber === WaveParameterNumber.SignificantHeight
  );
};

export const isWavePeriod = (msg: BaseGrib2Message): msg is WavePeriod => {
  return (
    msg.parameterCategory === ParameterCategory.Wave &&
    msg.parameterNumber === WaveParameterNumber.PrimaryPeriod
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
