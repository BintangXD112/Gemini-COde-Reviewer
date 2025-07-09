
import { GoogleGenAI, Type } from "@google/genai";
import type { FeedbackItem } from '../types';
import { FeedbackCategory } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      line: {
        type: Type.INTEGER,
        description: 'The line number where the issue is located. If the issue is general, use 0.',
      },
      category: {
        type: Type.STRING,
        enum: Object.values(FeedbackCategory),
        description: 'The category of the feedback.',
      },
      comment: {
        type: Type.STRING,
        description: 'A concise explanation of the issue.',
      },
      suggestion: {
        type: Type.STRING,
        description: 'A code snippet or clear text suggesting the improvement.',
      },
    },
    required: ['line', 'category', 'comment', 'suggestion'],
  },
};

export const reviewCode = async (code: string, language: string): Promise<FeedbackItem[]> => {
  const prompt = `
    You are an expert senior software engineer and meticulous code reviewer.
    Your task is to analyze the following code snippet written in ${language} and identify areas for improvement.
    Provide your feedback as a JSON array of objects. Each object represents a single piece of feedback.
    Adhere strictly to the provided JSON schema.
    Focus on correctness, performance, security, style, and best practices.
    For each issue, provide: the line number, a category, a concise comment, and a concrete suggestion.
    If there are no issues, return an empty array [].
    Do not include any explanatory text or markdown formatting outside of the JSON structure itself.

    Code to review:
    \`\`\`${language}
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.2,
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      return [];
    }

    const parsedResponse = JSON.parse(jsonText);
    
    // Validate that the parsed response is an array
    if (!Array.isArray(parsedResponse)) {
        console.error("Gemini response is not an array:", parsedResponse);
        throw new Error("Received an invalid response format from the AI. Expected a JSON array.");
    }
    
    return parsedResponse as FeedbackItem[];
    
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
       throw new Error("Failed to get a valid review from the AI. It may have returned an invalid format. Please try again.");
    }
    throw new Error("An error occurred while communicating with the AI code reviewer.");
  }
};
