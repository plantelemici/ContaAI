const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ContractGeminiAnalysis {
  title: string;
  clientName: string;
  supplierName: string;
  contractType: string;
  startDate: string;
  endDate: string;
  value: string;
  currency: string;
  paymentTerms: string;
  description: string;
  terms: string[];
  deliverables: string[];
  parties: string[];
  obligations: string[];
  penalties: string[];
  terminationClauses: string[];
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
  keyDates: string[];
  insights: string[];
  warnings: string[];
  confidence: number;
}

export const analyzeContract = async (file: File): Promise<ContractGeminiAnalysis> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Cheia API Gemini nu este configurată');
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    const prompt = `
    Analizează acest contract românesc și extrage următoarele informații:
    
    INFORMAȚII DE BAZĂ:
    1. Titlul contractului
    2. Numele clientului/beneficiarului
    3. Numele furnizorului/prestatorului
    4. Tipul contractului (servicii, furnizare, mentenanță, consultanță, altele)
    5. Data de început
    6. Data de sfârșit
    7. Valoarea contractului (cu valuta)
    8. Termenii de plată
    9. Descrierea obiectului contractului
    
    CLAUZE ȘI TERMENI:
    10. Termenii și condițiile principale (listă)
    11. Livrabilele/serviciile (listă)
    12. Părțile contractante (listă)
    13. Obligațiile principale (listă)
    14. Penalitățile și sancțiunile (listă)
    15. Clauzele de reziliere (listă)
    
    ANALIZĂ DE RISC:
    16. Nivelul de risc (low/medium/high)
    17. Factorii de risc identificați (listă)
    18. Recomandări pentru gestionarea riscurilor (listă)
    
    DATE CHEIE:
    19. Datele importante din contract (listă)
    
    INSIGHTS ȘI AVERTISMENTE:
    20. Observații importante despre contract (listă)
    21. Avertismente sau aspecte de atenție (listă)
    22. Scor de încredere pentru extragerea datelor (0-100%)
    
    IMPORTANT: Răspunde DOAR cu un obiect JSON valid, fără text suplimentar, fără markdown, fără explicații.
    Toate proprietățile și valorile string trebuie să fie între ghilimele duble.
    
    Structura JSON exactă:
    {
      "title": "valoare_string",
      "clientName": "valoare_string",
      "supplierName": "valoare_string",
      "contractType": "valoare_string",
      "startDate": "valoare_string",
      "endDate": "valoare_string",
      "value": "valoare_string",
      "currency": "valoare_string",
      "paymentTerms": "valoare_string",
      "description": "valoare_string",
      "terms": [],
      "deliverables": [],
      "parties": [],
      "obligations": [],
      "penalties": [],
      "terminationClauses": [],
      "riskLevel": "medium",
      "riskFactors": [],
      "recommendations": [],
      "keyDates": [],
      "insights": [],
      "warnings": [],
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
        maxOutputTokens: 4096,
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
    console.error('Eroare la analiza contractului cu Gemini:', error);
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