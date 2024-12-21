import { Discipline } from "@/types/types";
import { OceanographicCurrentsParameterNumber } from "@/types/discipline/oceanographicProducts/currents";
import { OceanographicIceParameterNumber } from "@/types/discipline/oceanographicProducts/ice";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";

export type OceanographicParameterNumber =
  | OceanographicWaveParameterNumber
  | OceanographicCurrentsParameterNumber
  | OceanographicIceParameterNumber;

export type OceanographicData = {
  discipline: Discipline.Oceanographic;
  category: OceanographicParameterCategory;
  parameter: OceanographicParameterNumber;
};
