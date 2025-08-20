const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiAnalysis {
  category: string;
  supplier: string;
  amount: string;
  client: string;
  documentDate: string;
  invoiceNumber?: string;
  cui?: string;
  description: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
}

export const analyzeDocument = async (file: File): Promise<GeminiAnalysis> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Cheia API Gemini nu este configurată');
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    const prompt = `
    Analizează acest document contabil românesc și extrage următoarele informații:
    
    1. Categoria (Transport, Servicii, Materiale, etc.)
    2. Furnizorul/Emitentul
    3. Suma totală (cu valuta)
    4. Clientul/Beneficiarul
    5. Data documentului
    6. Numărul facturii (dacă există)
    7. CUI-ul (dacă există)
    8. Descrierea serviciilor/produselor
    
    De asemenea, oferă:
    - 3-5 insights utile despre acest document
    - 2-3 recomandări pentru procesare sau verificare
    - Un scor de încredere pentru extragerea datelor (0-100%)
    
    IMPORTANT: Răspunde DOAR cu un obiect JSON valid, fără text suplimentar, fără markdown, fără explicații.
    Toate proprietățile și valorile string trebuie să fie între ghilimele duble.
    
    Structura JSON exactă:
    {
      "category": "valoare_string",
      "supplier": "valoare_string", 
      "amount": "valoare_string",
      "client": "valoare_string",
      "documentDate": "valoare_string",
      "invoiceNumber": "valoare_string",
      "cui": "valoare_string",
      "description": "valoare_string",
      "insights": [],
      "recommendations": [],
      "confidence": 85
    }
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: file.type,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 503) {
        throw new Error('Serviciul Gemini este temporar indisponibil. Încearcă din nou în câteva minute.');
      } else if (response.status === 429) {
        throw new Error('Prea multe cereri. Încearcă din nou în câteva secunde.');
      } else if (response.status === 403) {
        throw new Error('Cheia API nu este validă sau nu are permisiuni.');
      } else {
        throw new Error(`Eroare API Gemini: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse JSON response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Nu s-au putut extrage datele din răspunsul AI');
  } catch (error) {
    console.error('Eroare la analiza cu Gemini:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};