export interface Biomarkers {
  age: number;                    // Chronological age in years
  albumin: number;                // g/dL
  creatinine: number;             // mg/dL
  glucose: number;                // mg/dL (fasting)
  crp: number;                    // mg/L (C-reactive protein)
  lymphocytePercent: number;      // %
  meanCellVolume: number;         // fL (MCV)
  redCellDistWidth: number;       // % (RDW)
  alkalinePhosphatase: number;    // U/L
  whiteBloodCellCount: number;    // 1000 cells/μL
}

export interface PhenoAgeResult {
  phenoAge: number;
  mortalityScore: number;
  ageDifference: number;
  interpretation: string;
  wasClamped?: boolean;
}

/**
 * Calculate PhenoAge (Levine's Phenotypic Age)
 * Based on: Levine et al. (2018) "An epigenetic biomarker of aging for lifespan and healthspan"
 * 
 * @param biomarkers - Blood biomarker values
 * @returns PhenoAge calculation results
 */
export function calculatePhenoAge(biomarkers: Biomarkers): PhenoAgeResult {
  // Validate inputs
  validateBiomarkers(biomarkers);
  
  // Calculate xb (linear combination)
  const xb = calculateXb(biomarkers);
  
  // Calculate mortality score
  const gamma = 0.0076927;
  let mortalityScore = 1 - Math.exp(-Math.exp(xb) * (Math.exp(120 * gamma) - 1) / gamma);
  
  // Clamp mortality score to prevent mathematical errors
  // If mortality score is too close to 1, the logarithm becomes undefined
  const MAX_MORTALITY = 0.999999;
  const MIN_MORTALITY = 0.000001;
  const originalMortalityScore = mortalityScore;
  mortalityScore = Math.max(MIN_MORTALITY, Math.min(MAX_MORTALITY, mortalityScore));
  const wasClamped = mortalityScore !== originalMortalityScore;
  
  // Calculate PhenoAge
  let phenoAge: number;
  try {
    phenoAge = 141.50225 + (Math.log(-0.00553 * Math.log(1 - mortalityScore)) / 0.090165);
    
    // Additional validation
    if (!isFinite(phenoAge) || isNaN(phenoAge)) {
      throw new Error("PhenoAge calculation resulted in invalid value");
    }
  } catch (error) {
    // If calculation fails, provide a meaningful error
    throw new Error(`PhenoAge calculation error: ${error instanceof Error ? error.message : 'Unknown error'}. This can occur with extreme biomarker combinations.`);
  }
  
  // Calculate age difference
  const ageDifference = phenoAge - biomarkers.age;
  
  // Generate interpretation
  const interpretation = getInterpretation(ageDifference);
  
  return {
    phenoAge: Math.round(phenoAge * 10) / 10,
    mortalityScore: Math.round(mortalityScore * 1000) / 1000,
    ageDifference: Math.round(ageDifference * 10) / 10,
    interpretation,
    ...(wasClamped && { wasClamped })
  };
}

/**
 * Calculate xb (linear combination of biomarkers)
 */
function calculateXb(biomarkers: Biomarkers): number {
  return -19.907 
    - 0.0336 * biomarkers.albumin
    + 0.0095 * biomarkers.creatinine
    + 0.1953 * biomarkers.glucose
    + 0.0954 * Math.log(biomarkers.crp)
    - 0.0120 * biomarkers.lymphocytePercent
    + 0.0268 * biomarkers.meanCellVolume
    + 0.3306 * biomarkers.redCellDistWidth
    + 0.00188 * biomarkers.alkalinePhosphatase
    + 0.0554 * biomarkers.whiteBloodCellCount
    + 0.0804 * biomarkers.age;
}

/**
 * Validate biomarker inputs
 */
function validateBiomarkers(biomarkers: Biomarkers): void {
  const validations = [
    { field: 'age', min: 0, max: 120, unit: 'years' },
    { field: 'albumin', min: 1, max: 6, unit: 'g/dL' },
    { field: 'creatinine', min: 0.1, max: 15, unit: 'mg/dL' },
    { field: 'glucose', min: 30, max: 500, unit: 'mg/dL' },
    { field: 'crp', min: 0.01, max: 100, unit: 'mg/L' },
    { field: 'lymphocytePercent', min: 0, max: 100, unit: '%' },
    { field: 'meanCellVolume', min: 50, max: 150, unit: 'fL' },
    { field: 'redCellDistWidth', min: 5, max: 30, unit: '%' },
    { field: 'alkalinePhosphatase', min: 10, max: 500, unit: 'U/L' },
    { field: 'whiteBloodCellCount', min: 1, max: 50, unit: '1000 cells/μL' }
  ];

  for (const { field, min, max, unit } of validations) {
    const value = biomarkers[field as keyof Biomarkers];
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${field} must be a valid number`);
    }
    if (value < min || value > max) {
      throw new Error(`${field} must be between ${min} and ${max} ${unit}. Got: ${value}`);
    }
  }
}

/**
 * Generate interpretation based on age difference
 */
function getInterpretation(ageDifference: number): string {
  if (ageDifference <= -10) {
    return "Your biological age is significantly younger than your chronological age. Excellent health indicators!";
  } else if (ageDifference <= -5) {
    return "Your biological age is younger than your chronological age. Good health indicators.";
  } else if (ageDifference <= 2) {
    return "Your biological age is close to your chronological age. Normal aging.";
  } else if (ageDifference <= 5) {
    return "Your biological age is slightly older than your chronological age. Consider lifestyle improvements.";
  } else if (ageDifference <= 10) {
    return "Your biological age is older than your chronological age. Health improvements recommended.";
  } else {
    return "Your biological age is significantly older than your chronological age. Consult healthcare provider.";
  }
}

/**
 * Get reference ranges for biomarkers
 */
export function getReferenceRanges(): Record<keyof Omit<Biomarkers, 'age'>, { min: number; max: number; optimal: string; unit: string }> {
  return {
    albumin: { min: 3.5, max: 5.0, optimal: "4.0-5.0", unit: "g/dL" },
    creatinine: { min: 0.6, max: 1.2, optimal: "0.6-1.0", unit: "mg/dL" },
    glucose: { min: 70, max: 100, optimal: "70-90", unit: "mg/dL (fasting)" },
    crp: { min: 0, max: 3.0, optimal: "<1.0", unit: "mg/L" },
    lymphocytePercent: { min: 20, max: 40, optimal: "25-35", unit: "%" },
    meanCellVolume: { min: 80, max: 100, optimal: "85-95", unit: "fL" },
    redCellDistWidth: { min: 11.5, max: 14.5, optimal: "11.5-13.0", unit: "%" },
    alkalinePhosphatase: { min: 44, max: 147, optimal: "44-100", unit: "U/L" },
    whiteBloodCellCount: { min: 4.5, max: 11.0, optimal: "4.5-7.5", unit: "1000 cells/μL" }
  };
}