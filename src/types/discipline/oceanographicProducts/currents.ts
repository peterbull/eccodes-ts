import { GribParameterUnits } from "@/types/discipline/units/types";

export enum OceanographicCurrentsParameterNumber {
  CurrentDirection = 0,
  CurrentSpeed = 1,
  UComponentCurrent = 2,
  VComponentCurrent = 3,
  RipCurrentOccurrenceProbability = 4,
  EastwardCurrent = 5,
  NorthwardCurrent = 6,
  // 7-191 Reserved
  // Local use parameters (192-254)
  OceanMixedLayerUVelocity = 192,
  OceanMixedLayerVVelocity = 193,
  BarotropicUVelocity = 194,
  BarotropicVVelocity = 195,
  Missing = 255,
}

export enum OceanographicCurrentParameterUnits {
  DegreeTrue = GribParameterUnits.DegreeTrue,
  MetersPerSecond = GribParameterUnits.MetersPerSecond,
  Percentage = GribParameterUnits.Percentage,
}
