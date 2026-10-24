import { GoogleGenAI } from '@google/genai';
import { aiToolsDeclaration, executeAiTool } from '../services/aiTools.js';
import { prisma } from '../config/db.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Main AI Assistant Chat Endpoint
export const chatWithAi = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Step 1: Call Gemini with Tool Definitions
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `User Role: ${user.role}. Question: ${message}` }]
        }
      ],
      config: {
        systemInstruction: `You are HCM Lite AI Assistant. Always answer using available database tools or rulebook. If an employee asks for another colleague's salary or sensitive data, refuse politely according to RBAC rules[cite: 1].`,
        tools: [{ functionDeclarations: aiToolsDeclaration }]
      }
    });

    const candidate = response.candidates?.[0];
    const functionCall = candidate?.content?.parts?.find(p => p.functionCall)?.functionCall;

    let finalAnswer = response.text;

    // Step 2: Handle Function Calling if triggered by Gemini
    if (functionCall) {
      const toolResult = await executeAiTool(functionCall.name, functionCall.args, user);

      // Log AI Action[cite: 1]
      await prisma.aiLog.create({
        data: { userId: user.userId, prompt: message, toolUsed: functionCall.name }
      });

      // Pass tool output back to Gemini to format natural response
      const followUp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: message }] },
          { role: 'model', parts: [{ functionCall }] },
          {
            role: 'user',
            parts: [{
              functionResponse: {
                name: functionCall.name,
                response: toolResult
              }
            }]
          }
        ]
      });

      finalAnswer = followUp.text;
    }

    res.json({ answer: finalAnswer, isAiGenerated: true });
  } catch (error) {
    res.status(500).json({ error: 'AI Service Error: ' + error.message, fallback: 'I am unable to connect to AI tools right now.' });
  }
};

// Smart Leave Pre-fill Parser[cite: 1]
export const parseSmartLeave = async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `Extract leave request details from this input: "${prompt}". Return ONLY JSON in format: {"leaveType": "CASUAL|SICK|ANNUAL|UNPAID", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "string"}`
        }
      ]
    });

    const text = response.text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(text);

    res.json({ success: true, data: parsedData });
  } catch (error) {
    res.status(400).json({ error: 'Could not parse leave intent. Please fill form manually.' });
  }
};