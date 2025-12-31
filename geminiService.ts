
import { GoogleGenAI, Type } from "@google/genai";
import { TreeData, ProblemType, Suggestion, MeceFeedback } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getBranchSuggestions(
  problemStatement: string,
  problemType: ProblemType,
  parentNodeText: string,
  existingChildren: string[]
): Promise<Suggestion[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a professional consultant. Given a problem and a specific branch, suggest 3-5 MECE (Mutually Exclusive, Collectively Exhaustive) sub-branches.
    
    Problem Statement: ${problemStatement}
    Problem Category: ${problemType}
    Parent Issue/Branch: ${parentNodeText}
    Already existing sub-branches: ${existingChildren.join(', ') || 'None'}
    
    Provide suggestions that help break down the parent issue logically.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Short title for the branch" },
              description: { type: Type.STRING, description: "Brief explanation of why this is important" }
            },
            required: ["text", "description"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

export async function checkMECE(tree: TreeData): Promise<MeceFeedback[]> {
  const model = "gemini-3-flash-preview";
  
  // Create a simplified representation of the tree for the AI to analyze
  const treeSummary = Object.values(tree.nodes).map(n => ({
    id: n.id,
    text: n.text,
    parentId: n.parentId,
    level: n.level
  }));

  const prompt = `
    Analyze the following issue tree for MECE (Mutually Exclusive, Collectively Exhaustive) logical errors.
    
    Context:
    Problem: ${tree.problemStatement}
    Type: ${tree.problemType}
    
    Tree Structure:
    ${JSON.stringify(treeSummary, null, 2)}
    
    Check for:
    1. Overlapping branches (ME error).
    2. Missing dimensions or logic gaps (CE error).
    3. Uneven depth or logic inconsistency.
    
    Provide feedback in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Random UUID for feedback" },
              type: { type: Type.STRING, enum: ["overlap", "gap", "imbalance", "info"] },
              message: { type: Type.STRING, description: "Constructive feedback message" },
              nodeId: { type: Type.STRING, description: "Optional ID of the problematic node" }
            },
            required: ["id", "type", "message"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error checking MECE:", error);
    return [];
  }
}
