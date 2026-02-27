import { GoogleGenAI } from '@google/genai';

// Lazy initialization of the AI client
let ai: GoogleGenAI | null = null;

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured. Please set the GEMINI_API_KEY environment variable.');
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
}

export async function detectPlantDisease(imageBase64: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const imagePart = fileToGenerativePart(imageBase64, mimeType);

    const prompt = 'Analyze this image of a plant. Identify the plant species and check for any visible signs of disease or pests. Provide a detailed description of your findings, including potential issues and suggest remedies if any problems are detected. If the image is not a plant, say so.';

    const response = await aiClient.models.generateContent({ 
      model,
      contents: { parts: [imagePart, { text: prompt }] }
    });

    return response.text;
  } catch (error) {
    console.error('Error in detectPlantDisease:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while detecting plant disease.';
  }
}

export async function getCropTips(plantName: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const prompt = `Provide detailed crop cycle tips for ${plantName}. Include information on planting, watering, soil requirements, sunlight, pest control, and harvesting. Present the information in a clear, easy-to-read markdown format.`;

    const response = await aiClient.models.generateContent({ 
      model,
      contents: prompt 
    });

    return response.text;
  } catch (error) {
    console.error('Error in getCropTips:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while fetching crop tips.';
  }
}

export async function detectPest(imageBase64: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const imagePart = fileToGenerativePart(imageBase64, mimeType);

    const prompt = 'Analyze this image to identify any pests. Provide a detailed description of the findings, including the pest species, potential damage to crops, and suggested methods for control or eradication. If the image does not contain a recognizable pest, state that clearly.';

    const response = await aiClient.models.generateContent({ 
      model,
      contents: { parts: [imagePart, { text: prompt }] }
    });

    return response.text;
  } catch (error) {
    console.error('Error in detectPest:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while detecting pests.';
  }
}

export async function checkOrganic(imageBase64: string, description?: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64 ? imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';')) : null;
    
    let contents: any;
    const prompt = `Analyze if the product in the image or described is likely organic or not. Look for organic labels, certification marks (like USDA Organic, EU Organic, etc.), or physical characteristics that might suggest organic farming. Provide a detailed explanation of why it might or might not be organic. If it's a packaged product, try to read the ingredients or labels. If it's raw produce, look for natural variations. Mention that this is an AI estimation and not a laboratory test. ${description ? `Additional context: ${description}` : ''}`;

    if (imageBase64 && mimeType) {
      const imagePart = fileToGenerativePart(imageBase64, mimeType);
      contents = { parts: [imagePart, { text: prompt }] };
    } else {
      contents = { parts: [{ text: prompt }] };
    }

    const response = await aiClient.models.generateContent({ 
      model,
      contents
    });

    return response.text;
  } catch (error) {
    console.error('Error in checkOrganic:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while checking organic status.';
  }
}

export async function chatWithAI(message: string, history: { role: string, parts: { text: string }[] }[]) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    
    const chat = aiClient.chats.create({
      model,
      config: {
        systemInstruction: "You are Agri-Helper, a world-class AI agricultural expert. You help farmers with crop selection, pest control, soil health, market trends, and modern farming techniques. Be concise, practical, and empathetic. Use markdown for formatting.",
      },
    });

    // Note: The SDK might handle history differently, but for simplicity we'll use generateContent with context if chats.create doesn't support easy history injection in this version
    // Actually, let's use generateContent for a more robust stateless-feeling implementation if history is complex
    const response = await aiClient.models.generateContent({
      model,
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
    });

    return response.text;
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    return 'I encountered an error. Please try again.';
  }
}

export async function analyzeSoilAndPredictYield(imageBase64: string, location: string, cropType: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64 ? imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';')) : null;

    const prompt = `Analyze this soil image (if provided) and the following data to provide a soil health report and yield prediction.
    Location: ${location}
    Intended Crop: ${cropType}
    
    Provide:
    1. Soil Type Estimation (based on image/location)
    2. Nutrient Deficiency Risks
    3. Recommended Fertilizers (Organic & Inorganic)
    4. Estimated Yield (e.g., tons per acre)
    5. Best Planting Window
    
    Format the output in clear markdown with sections.`;

    let contents: any;
    if (imageBase64 && mimeType) {
      const imagePart = fileToGenerativePart(imageBase64, mimeType);
      contents = { parts: [imagePart, { text: prompt }] };
    } else {
      contents = { parts: [{ text: prompt }] };
    }

    const response = await aiClient.models.generateContent({
      model,
      contents
    });

    return response.text;
  } catch (error) {
    console.error('Error in analyzeSoilAndPredictYield:', error);
    return 'Error analyzing soil data.';
  }
}

export async function translateText(text: string, targetLanguageCode: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview'; // Or a suitable text model
    const prompt = `Translate the following text into the language with BCP-47 code '${targetLanguageCode}':\n\n${text}`; 

    const response = await aiClient.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
    });

    return response.text;
  } catch (error) {
    console.error('Error in translateText:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while translating text.';
  }
}
