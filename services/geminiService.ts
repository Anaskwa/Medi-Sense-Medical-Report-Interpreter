
import { GoogleGenAI, Modality } from "@google/genai";
import { ReportAnalysis } from "../types";

export const analyzeMedicalReports = async (images: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: "image/png",
      data: img.split(',')[1]
    }
  }));

  const systemInstruction = `
    You are a medical report interpretation assistant. 
    Your role is to help users understand medical reports in simple, clear English.
    You are NOT a doctor.
    
    CRITICAL RULES:
    1. Do NOT diagnose diseases.
    2. Do NOT suggest treatments or medications.
    3. Use plain English (no jargon).
    4. Categorize results as: Within typical range, Borderline, Outside typical range.
    5. Be neutral and cautious.
    
    MANDATORY OUTPUT STRUCTURE (Markdown):
    
    ### Report Summary
    [Brief overview]
    
    ### Key Findings
    * [Observation 1]
    * [Observation 2]
    
    ### Notable Values
    | Test Name | Reported Value | Typical Range | Note |
    |-----------|----------------|---------------|------|
    | [Name] | [Value] | [Range] | [Simple Explanation] |
    
    ### Questions You May Ask Your Doctor
    * [Question 1]
    
    ### Disclaimer
    **This information is for educational purposes only. It is not medical advice. Always consult a qualified doctor.**
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: "Please interpret these medical reports following the mandatory structure." }
      ]
    },
    config: {
      systemInstruction,
      temperature: 0.2
    }
  });

  return response.text || "Unable to interpret the report. Please ensure images are clear.";
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean text for TTS (remove markdown formatting)
  const cleanText = text
    .replace(/[#*|]/g, '')
    .replace(/---/g, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '');

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following medical report summary clearly: ${cleanText}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const decodeAudio = async (base64: string): Promise<AudioBuffer> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = audioContext.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
