# Example Usage

## Sample Biomarker Values

Here's an example of typical biomarker values for a healthy 45-year-old:

```json
{
  "age": 45,
  "albumin": 4.2,
  "creatinine": 0.9,
  "glucose": 85,
  "crp": 0.5,
  "lymphocytePercent": 30,
  "meanCellVolume": 89,
  "redCellDistWidth": 12.5,
  "alkalinePhosphatase": 65,
  "whiteBloodCellCount": 6.2
}
```

## Expected Output

```json
{
  "success": true,
  "result": {
    "phenoAge": 42.3,
    "chronologicalAge": 45,
    "ageDifference": -2.7,
    "mortalityScore": 0.003,
    "interpretation": "Your biological age is younger than your chronological age. Good health indicators.",
    "summary": "Your PhenoAge is 42.3 years (-2.7 years younger than your chronological age)"
  }
}
```

## Common Lab Test Names

These biomarkers may appear under different names on lab reports:

- **Albumin**: Serum Albumin
- **Creatinine**: Serum Creatinine, SCr
- **Glucose**: Fasting Glucose, FBG, Fasting Blood Sugar
- **CRP**: C-Reactive Protein, hs-CRP (high-sensitivity)
- **Lymphocyte %**: Lymphocytes (% of WBC)
- **MCV**: Mean Corpuscular Volume, Mean Cell Volume
- **RDW**: Red Cell Distribution Width, RDW-CV
- **Alkaline Phosphatase**: ALP, Alk Phos
- **WBC**: White Blood Cell Count, Leukocyte Count

## Unit Conversions

If your lab uses different units:

### Albumin
- g/dL × 10 = g/L
- g/L ÷ 10 = g/dL

### Creatinine
- μmol/L ÷ 88.4 = mg/dL
- mg/dL × 88.4 = μmol/L

### Glucose
- mmol/L × 18 = mg/dL
- mg/dL ÷ 18 = mmol/L

### CRP
- mg/dL × 10 = mg/L
- mg/L ÷ 10 = mg/dL