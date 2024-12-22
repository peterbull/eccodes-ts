export enum GribParameterUnits {
  // Base units
  Meters = "m",
  Seconds = "s",
  Kilograms = "kg",
  Kelvin = "K",
  Pascals = "Pa",
  Newtons = "N",
  Watts = "W",
  Joules = "J",

  // Angular measurements
  Degrees = "°",
  DegreeTrue = "degree true",
  DegreesLatLon = "deg",

  // Compound units
  MetersPerSecond = "m s-1",
  MetersPerSecondSquared = "m s-2",
  SquareMetersPerSecond = "m2 s-1",
  SquareMetersPerSecondSquared = "m2 s-2",
  SquareMeters = "m2",
  CubicMeters = "m3",
  CubicMetersPerSquareMeter = "m3m-2", // New

  // Pressure and force related
  NewtonsPerSquareMeter = "N m-2",
  NewtonsPerSquareMeterSeconds = "N m-2 s",
  PascalsPerSecond = "Pa s-1",
  PascalMeters = "Pa m", // New
  NewtonsPerMeter = "N m-1", // New

  // Energy and power related
  WattsPerSquareMeter = "W m-2",
  WattsPerMeter = "W m-1",
  JoulesPerKilogram = "J kg-1",
  JoulesPerSquareMeter = "J m-2", // New

  // Density related
  KilogramsPerCubicMeter = "kg m-3",
  KilogramsPerSquareMeter = "kg m-2",

  // Complex combinations
  KelvinSquareMetersPerKilogramPerSecond = "K m2 kg-1 s-1",
  KelvinMetersPerSecond = "K*m s-1",

  // Rate units
  PerSecond = "s-1",

  // Special units
  Knots = "kt",

  // Dimensionless units
  Fraction = "fraction",
  Proportion = "proportion",
  Numeric = "Numeric",
  Percentage = "%",
}
