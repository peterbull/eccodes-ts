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
- If you encounter any issues it's generally recommened to build from source:
    - [Installation Instructions](https://github.com/ecmwf/eccodes/#INSTALLATION)
- Node.js 14 or higher

## Usage

```typescript
import { EccodesWrapper } from 'eccodes-ts';

// Initialize with path to GRIB file
const grib = new EccodesWrapper('/path/to/your/file.grib');

// Get specific parameters
const waveHeight = await grib.getSignificantWaveHeight();
const windSpeed = await grib.getWindSpeed();

// Get all wave or wind parameters
const waveParams = await grib.getWaveParameters();
const windParams = await grib.getWindParameters();

// Custom parameter extraction
const customParams = await grib.getParametersByType(
    ParameterCategory.WAVES,
    WaveParameterNumber.SIGNIFICANT_HEIGHT
);
```

## Supported Parameters

### Wave Parameters

- Significant Wave Height
- Primary Wave Period
- Primary Wave Direction

### Wind Parameters

- Wind Speed
- Wind Direction

## Parameter Access

The library supports accessing all GRIB parameters in two ways:

### 1. Type-Safe Convenience Methods

Pre-defined methods with full TypeScript support for common parameters:

#### Wave Parameters
- `getSignificantWaveHeight()`
- `getPrimaryWavePeriod()`
- `getPrimaryWaveDirection()`
- `getWaveParameters()` 

#### Wind Parameters
- `getWindSpeed()`
- `getWindDirection()`
- `getWindParameters()` 

### 2. Generic Access

For other parameters, use these methods:

```typescript
// Type-safe access using parameter enums
const customParams = await grib.getParametersByType(
    ParameterCategory.WAVES,
    WaveParameterNumber.SIGNIFICANT_HEIGHT
);

// Full access to any GRIB parameter
const allParams = await grib.readToJson();
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the LICENSE file for details