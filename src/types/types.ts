export interface Grib2Message {
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

  // Parameter information
  parameterCategory: number;
  parameterNumber: number;
  parameterUnits: string;
  parameterName: string;
  shortName: string;

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
}
