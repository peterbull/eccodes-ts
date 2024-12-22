# eccodes-ts

A TypeScript wrapper for eccodes GRIB2 file handling. This package provides a convenient interface to work with GRIB2 (GRIdded Binary) weather data files using TypeScript.

## Installation

```bash
npm install eccodes-ts
```

### Prerequisites

- eccodes must be installed on your system
    - Ubuntu/Debian: `sudo apt-get install libeccodes-dev libeccodes-tools`
    - macOS: `brew install eccodes`
    - Windows: Install WSL and use Ubuntu package
- If you encounter any issues it's generally recommended to build from source:
    - [Installation Instructions](https://confluence.ecmwf.int/display/ECC/ecCodes+installation)
- Node.js 14 or higher

## Usage

```typescript
import { EccodesWrapper } from 'eccodes-ts';

// Initialize with path to GRIB file
const grib = new EccodesWrapper('/path/to/your/file.grib');

// Get specific parameters with optional lat/lon mapping
const waveHeight = await grib.getSignificantWaveHeight({ addLatLon: true });
const windSpeed = await grib.getWindSpeed({ addLatLon: true });

// Get all wave or wind parameters
const waveParams = await grib.getWaveParameters();
const windParams = await grib.getWindParameters();

// Custom parameter extraction
const customParams = await grib.getParametersByType({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined
});
```

## Features

### Parameter Access Methods

#### Wave Parameters

- `getSignificantWaveHeight(options?: GribParsingOptions)`
- `getPrimaryWavePeriod(options?: GribParsingOptions)`
- `getPrimaryWaveDirection(options?: GribParsingOptions)`
- `getWaveParameters(options?: GribParsingOptions)`

#### Wind Parameters

- `getWindSpeed(options?: GribParsingOptions)`
- `getWindDirection(options?: GribParsingOptions)`
- `getWindParameters(options?: GribParsingOptions)`

### Generic Access

- `getParametersByType<T>(options: GribParametersByType)`
- `getMetadata()`
- `readToJson(addLatLon?: boolean)`

### Options

```typescript
type GribParsingOptions = {
    addLatLon?: boolean;
};

type GribParametersByType = {
    discipline?: Discipline;
    category: ParameterCategory;
    number?: ParameterNumber;
    keys?: string[];
    addLatLon?: boolean;
};
```

### Lat/Lon Mapping

When `addLatLon` is enabled, parameter values are mapped to their corresponding latitude/longitude coordinates:

```typescript
type LocationForecast = {
    lat: number;
    lon: number;
    value: number;
};
```

### Data Types

The package includes comprehensive TypeScript definitions for:

- GRIB2 parameters and disciplines
- Meteorological parameters
- Oceanographic parameters
- Wave parameters
- Wind parameters

### Error Handling

The package includes proper error handling for:

- Missing eccodes installation
- Invalid GRIB file paths
- GRIB parsing errors
- Command execution errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the LICENSE file for details