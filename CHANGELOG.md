# Changelog

## [1.0.1] - 2024-05-31

### Fixed
- Fixed infinity error when mortality score approaches 1.0
- Added bounds checking to clamp mortality score between 0.000001 and 0.999999
- Added proper error handling for edge cases in PhenoAge calculation
- Added warning when mortality score is clamped

## [1.0.0] - 2024-05-31

### Added
- Initial release of MCP PhenoAge Clock Server
- `calculate_phenoage` tool for biological age calculation
- `get_biomarker_ranges` tool for reference ranges
- Complete implementation of Morgan Levine PhenoAge formula
- Comprehensive documentation and README
- NPM/NPX deployment support