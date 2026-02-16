'use server';

import { GoogleGenAI } from '@google/genai';
import { HistorySession } from './types';

// The new SDK automatically picks up GEMINI_API_KEY from process.env
// but we'll be explicit to ensure it works in all environments.
const ai = new GoogleGenAI({});

export async function generateClinicalSummary(session: HistorySession) {
  if (
    !process.env.GEMINI_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return 'AI Setup Required: Please add GEMINI_API_KEY to your .env file.';
  }

  const prompt = `
    You are an expert clinical instructor. 
    Summarize the following medical history in a professional clinical clerkship format.
    Use headings like 'Source of History', 'Biodata', 'Chief Complaint', 'HPI', 'PMH', 'ROS', etc.
    
    Data:
    ${JSON.stringify(session.data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'No summary generated.';
  } catch (error: any) {
    console.error('Gemini Summary Error:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `Error generating summary: ${errorMessage}`
      : 'Error generating summary. Please check your AI configuration.';
  }
}

export async function generateDifferentials(session: HistorySession) {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    return [];

  const prompt = `
    Based on the following medical history, provide 3 to 5 differential diagnoses.
    Format your response as a JSON array of objects: [{ "diagnosis": string, "confidence": number (0-1), "reasoning": string }].
    Return ONLY the JSON array.
    
    Data:
    ${JSON.stringify(session.data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || '[]';
    // Clean potential markdown formatting from AI response
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Differentials Error:', error);
    return [];
  }
}

export async function getRealTimeHint(session: HistorySession) {
  if (
    !process.env.GEMINI_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return 'AI Setup Required. See AI Setup Guide in the project brain.';
  }

  const prompt = `
    You are "The Pal", an AI assistant for medical students.
    Current Stage: ${session.currentStage}
    Mode: ${session.mode}
    
    Provide a concise, helpful clinical hint or the "next best question" for this stage.
    If the mode is 'HINT', be subtle. If 'ASSISTED', be direct.
    
    Current Data:
    ${JSON.stringify(session.data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'Continue with the next steps.';
  } catch (error: any) {
    console.error('Gemini Hint Error:', error);
    return 'Continue with the current stage.';
  }
}

export async function analyzeHPC(
  complaint: string,
  currentHpc: any,
  context: any,
) {
  if (
    !process.env.GEMINI_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return 'AI Setup Required. Please check your configuration.';
  }

  const prompt = `
    You are an expert clinical instructor acting as "The Pal".
    You are speaking to a **medical student/doctor**. 
    The data below belongs to a **patient** (Name: ${context.biodata?.name || 'Unknown'}, Age: ${context.biodata?.age || 'Unknown'}, Sex: ${context.biodata?.gender || 'Unknown'}).
    
    Current FOCUS: You are analyzing the characterization of the following specific complaint: **${complaint}**.
    
    Current HPC Data for this complaint (5 Cs framework):
    ${JSON.stringify(currentHpc, null, 2)}

    Patient Context:
    - Biodata: ${JSON.stringify(context.biodata, null, 2)}
    - Full List of Presenting Complaints: ${JSON.stringify(context.presentingComplaints, null, 2)}
    - Other HPC Data already collected: ${JSON.stringify(context.otherHpcData, null, 2)}
    
    Tasks:
    1. Specifically assess if the characterization of **${complaint}** is adequate (e.g., using SOCRATES or 5 Cs).
    2. Identify any missing critical information **only for ${complaint}**.
    3. Provide 1-2 specific suggestions to improve the history taking for **this specific complaint**.
    
    CRITICAL RESTRICTIONS:
    - **Focus Only**: Do NOT jump ahead to other complaints in the list (e.g., if analyzing "Headache", do not suggest questions for "Cough" or "Chest Pain" unless they are associated symptoms directly linked to the headache).
    - **No Forethought**: Do NOT ask for characterization of other presenting complaints that the student hasn't started yet.
    - **Student Context**: Address the user as "student" or "doctor". Do NOT use the patient's name to address the user.
    - **No Differentials**: Do NOT include any differential diagnoses.
    - **No Future Stages**: Do NOT suggest questions for PMH, DH, SH, FH.
    - **Context Awareness**: Do NOT ask for information that is already present in the "Patient Context".
    
    Use Markdown formatting (### Headers, **bold**, bullet points).
    Keep your response concise and conversational.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string;
  } catch (error: any) {
    console.error('Error analyzing HPC:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Sorry, I encountered an error while analyzing the history. Please check your API key and try again.';
  }
}

export async function analyzeROS(rosData: any, context: any) {
  if (
    !process.env.GEMINI_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return 'AI Setup Required. Please check your configuration.';
  }

  const prompt = `
    You are an expert clinical instructor acting as "The Pal".
    You are speaking to a **medical student**.
    The data below belongs to a **patient** (Name: ${context.biodata?.name || 'Unknown'}, Age: ${context.biodata?.age || 'Unknown'}, Sex: ${context.biodata?.gender || 'Unknown'}).

    Current Review of Systems (ROS) Data:
    ${JSON.stringify(rosData, null, 2)}

    Patient Context:
    - Biodata: ${JSON.stringify(context.biodata, null, 2)}
    - Presenting Complaints: ${JSON.stringify(context.presentingComplaints, null, 2)}
    - HPC Data: ${JSON.stringify(context.hpcData, null, 2)}

    Tasks:
    1. Check if the ROS mentions any symptoms that warrant further immediate exploration given the main complaint.
    2. Identify any MISSED assessments in relevant systems (e.g., if "Cough" + "Chest Pain", check if "Leg Swelling" (DVT/PE) or "Orthopnea" was screened in CVS).
    3. Ensure the student hasn't repeated questions already covered in the HPC.

    IMPORTANT:
    - Do NOT ask for information already present in HPC or Biodata.
    - If ROS is "No Abnormality Detected" (NAD) for a relevant system, prompt the student to confirm specific red flags were actually asked (e.g. "Did you explicitly ask about hemoptysis?").
    - Use Markdown formatting (bold, bullets, headers).
    - Address the user as "student" or "doctor".

    Keep it concise.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string; // Casting to string to be safe if linter is confused
  } catch (error: any) {
    console.error('Error analyzing ROS:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Sorry, I encountered an error while analyzing the ROS. Please check your API key and try again.';
  }
}

export async function analyzePMH(data: string, context?: any) {
  const prompt = `
    You are an expert medical tutor. Analyze the following Past Medical History (PMH) data for a medical student taking a history.
    
    PMH Data:
    ${data}

    Patient Context:
    - Biodata: ${JSON.stringify(context?.biodata, null, 2)}
    - Presenting Complaints: ${JSON.stringify(context?.presentingComplaints, null, 2)}

    Your task:
    1. Identify any significant missing information based on the patient's age/biodata (e.g., if elderly, did they ask about HTN, DM, lipids?).
    2. Highlight any associations between the PMH and potential presenting complaints (e.g., previous DVT and current leg pain).
    3. Keep it brief (max 3 sentences).
    4. Provide 1 specific follow-up question to ask the patient.

    Format the output in Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string;
  } catch (error: any) {
    console.error('Error analyzing PMH:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Unable to analyze PMH at this time.';
  }
}

export async function analyzeDH(data: string, context?: any) {
  const prompt = `
    You are an expert medical tutor. Analyze the following Drug History and Allergy data.

    Data:
    ${data}

    Patient Context:
    - Biodata: ${JSON.stringify(context?.biodata, null, 2)}
    - PMH: ${context?.pmhData || 'Unknown'}
    - Presenting Complaints: ${JSON.stringify(context?.presentingComplaints, null, 2)}

    Your task:
    1. Check for any potential drug-drug interactions among the listed medications (if appropriate).
    2. If drug names are missing or unknown, provide advice on how to identify them (e.g., pill descriptions, packaging, GP records).
    3. Check for contraindications with reported allergies.
    4. Provide one specific safety check or question relevant to the patient's age and complaints.
    5. Keep it brief and focused on safety.

    Format the output in Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string;
  } catch (error: any) {
    console.error('Error analyzing DH:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Unable to analyze Drug History at this time.';
  }
}

export async function analyzeFH(data: string, context?: any) {
  const prompt = `
    You are an expert medical tutor. Analyze the following Family History (FH) data.

    Data:
    ${data}

    Patient Context:
    - Biodata: ${JSON.stringify(context?.biodata, null, 2)}
    - Presenting Complaints: ${JSON.stringify(context?.presentingComplaints, null, 2)}
    - PMH: ${context?.pmhData || 'Unknown'}

    Your task:
    1. Identify any hereditary conditions or familial risks relevant to the patient's complaints (e.g., family history of IHD in a patient with chest pain).
    2. Check for "premature" disease in first-degree relatives.
    3. Suggest one specific follow-up question if a risk is identified.
    4. Keep it brief.

    Format the output in Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string;
  } catch (error: any) {
    console.error('Error analyzing FH:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Unable to analyze Family History at this time.';
  }
}

export async function analyzeSH(data: string, context?: any) {
  const prompt = `
    You are an expert medical tutor. Analyze the following Social History (SH) data.

    Data:
    ${data}

    Patient Context:
    - Biodata: ${JSON.stringify(context?.biodata, null, 2)}
    - Presenting Complaints: ${JSON.stringify(context?.presentingComplaints, null, 2)}

    Your task:
    1. Identify any lifestyle risk factors (smoking, alcohol, drugs, diet, exercise).
    2. Assess social support (living situation, occupation).
    3. Suggest one specific health promotion advice or follow-up question.
    4. Keep it brief.

    Format the output in Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return result.text as string;
  } catch (error: any) {
    console.error('Error analyzing SH:', error);
    const errorMessage = error?.error?.message || error?.message;
    return errorMessage
      ? `AI Error: ${errorMessage}`
      : 'Unable to analyze Social History at this time.';
  }
}
