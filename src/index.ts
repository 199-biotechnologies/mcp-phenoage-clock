#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { calculatePhenoAge, getReferenceRanges, type Biomarkers } from "./phenoage.js";

// Define the biomarkers schema for validation
const BiomarkersSchema = z.object({
  age: z.number().min(0).max(120).describe("Chronological age in years"),
  albumin: z.number().min(1).max(6).describe("Albumin in g/dL"),
  creatinine: z.number().min(0.1).max(15).describe("Creatinine in mg/dL"),
  glucose: z.number().min(30).max(500).describe("Glucose in mg/dL (fasting)"),
  crp: z.number().min(0.01).max(100).describe("C-reactive protein (CRP) in mg/L"),
  lymphocytePercent: z.number().min(0).max(100).describe("Lymphocyte percentage"),
  meanCellVolume: z.number().min(50).max(150).describe("Mean cell volume (MCV) in fL"),
  redCellDistWidth: z.number().min(5).max(30).describe("Red cell distribution width (RDW) in %"),
  alkalinePhosphatase: z.number().min(10).max(500).describe("Alkaline phosphatase in U/L"),
  whiteBloodCellCount: z.number().min(1).max(50).describe("White blood cell count in 1000 cells/μL")
});

// Define tools
const TOOLS: Tool[] = [
  {
    name: "calculate_phenoage",
    description: "Calculate biological age using the Morgan Levine PhenoAge clock based on blood biomarkers",
    inputSchema: {
      type: "object",
      properties: {
        biomarkers: {
          type: "object",
          properties: {
            age: { type: "number", description: "Chronological age in years" },
            albumin: { type: "number", description: "Albumin in g/dL" },
            creatinine: { type: "number", description: "Creatinine in mg/dL" },
            glucose: { type: "number", description: "Glucose in mg/dL (fasting)" },
            crp: { type: "number", description: "C-reactive protein (CRP) in mg/L" },
            lymphocytePercent: { type: "number", description: "Lymphocyte percentage" },
            meanCellVolume: { type: "number", description: "Mean cell volume (MCV) in fL" },
            redCellDistWidth: { type: "number", description: "Red cell distribution width (RDW) in %" },
            alkalinePhosphatase: { type: "number", description: "Alkaline phosphatase in U/L" },
            whiteBloodCellCount: { type: "number", description: "White blood cell count in 1000 cells/μL" }
          },
          required: ["age", "albumin", "creatinine", "glucose", "crp", "lymphocytePercent", 
                    "meanCellVolume", "redCellDistWidth", "alkalinePhosphatase", "whiteBloodCellCount"],
          description: "Blood biomarker values for PhenoAge calculation"
        }
      },
      required: ["biomarkers"]
    }
  },
  {
    name: "get_biomarker_ranges",
    description: "Get reference ranges and optimal values for PhenoAge biomarkers",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Create the server
const server = new Server(
  {
    name: "mcp-phenoage-clock",
    version: "1.0.0",
    description: "MCP server for calculating biological age using the Morgan Levine PhenoAge clock"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "calculate_phenoage") {
      // Validate input
      if (!args || !args.biomarkers) {
        throw new Error("Missing biomarkers parameter");
      }
      const validated = BiomarkersSchema.parse(args.biomarkers);
      
      // Calculate PhenoAge
      const result = calculatePhenoAge(validated as Biomarkers);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              result: {
                phenoAge: result.phenoAge,
                chronologicalAge: validated.age,
                ageDifference: result.ageDifference,
                mortalityScore: result.mortalityScore,
                interpretation: result.interpretation,
                summary: `Your PhenoAge is ${result.phenoAge} years (${result.ageDifference > 0 ? '+' : ''}${result.ageDifference} years ${result.ageDifference > 0 ? 'older' : 'younger'} than your chronological age)`,
                ...(result.wasClamped && { 
                  warning: "Mortality score was at the mathematical limit and was adjusted to allow calculation" 
                })
              }
            }, null, 2)
          }
        ]
      };
    } else if (name === "get_biomarker_ranges") {
      const ranges = getReferenceRanges();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              ranges,
              notes: {
                units: "Make sure to use the correct units for each biomarker",
                fasting: "Glucose should be measured after fasting",
                crp: "CRP is a marker of inflammation - lower is generally better"
              }
            }, null, 2)
          }
        ]
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          }, null, 2)
        }
      ]
    };
  }
});

// Main function
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log startup to stderr
  console.error("PhenoAge Clock MCP server running");
  console.error("Based on: Levine et al. (2018) 'An epigenetic biomarker of aging for lifespan and healthspan'");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});