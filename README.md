# MCP PhenoAge Clock Server

An MCP (Model Context Protocol) server that calculates biological age using the Morgan Levine PhenoAge clock based on blood biomarkers.

## Overview

The PhenoAge clock is a biological aging measure developed by Dr. Morgan Levine and colleagues. It uses 9 blood biomarkers plus chronological age to estimate "phenotypic age" - a measure that captures morbidity and mortality risk better than chronological age alone.

Based on: Levine et al. (2018) "An epigenetic biomarker of aging for lifespan and healthspan" [Aging (Albany NY). 2018;10(4):573-591](https://doi.org/10.18632/aging.101414)

## Installation

### Via NPX (Recommended)
```bash
npx @mcp/phenoage-clock
```

### Via NPM
```bash
npm install -g @mcp/phenoage-clock
mcp-phenoage-clock
```

### From Source
```bash
git clone https://github.com/199-biotechnologies/mcp-phenoage-clock.git
cd mcp-phenoage-clock
npm install
npm run build
npm start
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "phenoage-clock": {
      "command": "npx",
      "args": ["@mcp/phenoage-clock"]
    }
  }
}
```

## Available Tools

### `calculate_phenoage`
Calculates your biological age using the PhenoAge formula.

**Required biomarkers:**
- `age`: Chronological age (years)
- `albumin`: Albumin (g/dL)
- `creatinine`: Creatinine (mg/dL)
- `glucose`: Glucose (mg/dL) - must be fasting
- `crp`: C-reactive protein (mg/L)
- `lymphocytePercent`: Lymphocyte percentage (%)
- `meanCellVolume`: Mean cell volume/MCV (fL)
- `redCellDistWidth`: Red cell distribution width/RDW (%)
- `alkalinePhosphatase`: Alkaline phosphatase (U/L)
- `whiteBloodCellCount`: White blood cell count (1000 cells/μL)

**Returns:**
- PhenoAge (biological age)
- Age difference (PhenoAge - chronological age)
- Mortality score
- Interpretation

### `get_biomarker_ranges`
Returns reference ranges and optimal values for all biomarkers.

## Example Usage in Claude

```
User: Calculate my PhenoAge with these values:
- Age: 45
- Albumin: 4.2 g/dL
- Creatinine: 0.9 mg/dL
- Glucose: 85 mg/dL
- CRP: 0.5 mg/L
- Lymphocyte %: 30
- MCV: 89 fL
- RDW: 12.5%
- Alkaline phosphatase: 65 U/L
- WBC: 6.2

Claude will use the calculate_phenoage tool and return your biological age.
```

## Understanding Your Results

- **PhenoAge < Chronological Age**: Your biological age is younger than your actual age, suggesting good health
- **PhenoAge ≈ Chronological Age**: Normal aging pattern
- **PhenoAge > Chronological Age**: Your biological age is older than your actual age, suggesting accelerated aging

## Important Notes

1. **Fasting Glucose**: The glucose measurement must be taken after fasting
2. **Units Matter**: Ensure your lab results match the required units
3. **Medical Advice**: This tool is for informational purposes only. Always consult healthcare providers for medical decisions
4. **Lab Variations**: Different labs may use different reference ranges

## Formula Details

The PhenoAge calculation uses the following formula:

```
xb = -19.907 - 0.0336×albumin + 0.0095×creatinine + 0.1953×glucose 
     + 0.0954×ln(CRP) - 0.0120×lymphocyte% + 0.0268×MCV 
     + 0.3306×RDW + 0.00188×alkaline_phosphatase + 0.0554×WBC + 0.0804×age

mortality_score = 1 - exp(-exp(xb) × (exp(120×γ) - 1) / γ)
where γ = 0.0076927

PhenoAge = 141.50225 + ln(-0.00553 × ln(1 - mortality_score)) / 0.090165
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev
```

## License

MIT

## Contributing

Contributions welcome! Please submit PRs to the [GitHub repository](https://github.com/199-biotechnologies/mcp-phenoage-clock).

## References

- Levine ME, Lu AT, Quach A, et al. An epigenetic biomarker of aging for lifespan and healthspan. Aging (Albany NY). 2018;10(4):573-591.
- Original paper supplementary materials: Table S6 contains the full coefficient values