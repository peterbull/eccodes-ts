export enum MeteorologicalParameterCategory {
  Temperature = 0,
  Moisture = 1,
  Momentum = 2,
  Mass = 3,
  ShortWaveRadiation = 4,
  LongWaveRadiation = 5,
  Cloud = 6,
  ThermodynamicStabilityIndices = 7,
  KinematicStabilityIndices = 8,
  TemperatureProbabilities = 9, // Deprecated
  MoistureProbabilities = 10, // Deprecated
  MomentumProbabilities = 11, // Deprecated
  MassProbabilities = 12, // Deprecated
  Aerosols = 13,
  TraceGases = 14,
  Radar = 15,
  ForecastRadarImagery = 16,
  Electrodynamics = 17,
  NuclearRadiology = 18,
  PhysicalAtmosphericProperties = 19,
  AtmosphericChemicalConstituents = 20,
  ThermodynamicProperties = 21,
  DroughtIndices = 22,
  // 23-189 Reserved
  CCITTIA5String = 190,
  Miscellaneous = 191,
  // 192-254 Reserved for Local Use
  Covariance = 192,
  Missing = 255,
}
