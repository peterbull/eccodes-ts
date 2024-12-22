import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { Discipline } from "@/types/types";

export type MeteorologicalParameterNumber =
  MeteorologicalMomentumParameterNumber;

export type MeteorologicalData = {
  discipline: Discipline.Meteorological;
  category: MeteorologicalParameterCategory;
  parameter: MeteorologicalParameterNumber;
};
