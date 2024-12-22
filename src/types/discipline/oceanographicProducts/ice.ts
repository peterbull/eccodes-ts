import { GribParameterUnits } from "@/types/discipline/units/types";

export enum OceanographicIceParameterNumber {
  IceCover = 0,
  IceThickness = 1,
  IceDriftDirection = 2,
  IceDriftSpeed = 3,
  UComponentIceDrift = 4,
  VComponentIceDrift = 5,
  IceGrowthRate = 6,
  IceDivergence = 7,
  IceTemperature = 8,
  IceInternalPressure = 9,
  ZonalVectorIcePressure = 10,
  MeridionalVectorIcePressure = 11,
  CompressiveIceStrength = 12,
  SnowTemperatureOverSeaIce = 13,
  Albedo = 14,
  SeaIceVolumePerUnitArea = 15,
  SnowVolumeOverSeaIcePerUnitArea = 16,
  SeaIceHeatContent = 17,
  SnowOverSeaIceHeatContent = 18,
  IceFreeboardThickness = 19,
  IceMeltPondFraction = 20,
  IceMeltPondDepth = 21,
  IceMeltPondVolumePerUnitArea = 22,
  SeaIceFractionTendency = 23,
  XComponentIceDrift = 24,
  YComponentIceDrift = 25,
  // Reserved
  FreezingMeltingPotential = 27,
  MeltOnsetDate = 28,
  FreezeOnsetDate = 29,
  // 30-191 Reserved
  // Local use parameters (192-254)
  Missing = 255,
}

export enum OceanographicIceParameterUnits {
  Proportion = GribParameterUnits.Proportion,
  Meters = GribParameterUnits.Meters,
  DegreeTrue = GribParameterUnits.DegreeTrue,
  MetersPerSecond = GribParameterUnits.MetersPerSecond,
  PerSecond = GribParameterUnits.PerSecond,
  Kelvin = GribParameterUnits.Kelvin,
  PascalMeters = GribParameterUnits.PascalMeters,
  NewtonsPerMeter = GribParameterUnits.NewtonsPerMeter,
  CubicMetersPerSquareMeter = GribParameterUnits.CubicMetersPerSquareMeter,
  JoulesPerSquareMeter = GribParameterUnits.JoulesPerSquareMeter,
  Fraction = GribParameterUnits.Fraction,
  Numeric = GribParameterUnits.Numeric,
  WattsPerSquareMeter = GribParameterUnits.WattsPerSquareMeter,
}
