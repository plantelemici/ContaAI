const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface BankStatementGeminiAnalysis {
  bankName: string;
  accountNumber: string;
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  openingBalance: string;
  closingBalance: string;
  transactions: Array<{
    date: string;
    description: string;
    amount: string;
    balance: string;
    reference: string;
    type: 'debit' | 'credit';
    category: string;
    counterparty: string;
    iban: string;
  }>;
  insights: string[];
  recommendations: string[];
  confidence: number;
}

export const analyzeBankStatement = async (file: File): Promise<BankStatementGeminiAnalysis> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Cheia API Gemini nu este configurată');
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    const prompt = `
    Analizează acest extras de cont bancar românesc și extrage următoarele informații:
    
    INFORMAȚII GENERALE:
    1. Numele băncii
    2. Numărul contului (IBAN sau număr cont)
    3. Perioada extrasului (data început și sfârșit)
    4. Soldul de deschidere
    5. Soldul de închidere
    
    TRANZACȚII:
    Pentru fiecare tranzacție extrage:
    - Data tranzacției
    - Descrierea/detaliile tranzacției
    - Suma (cu semnul + pentru încasări, - pentru plăți)
    - Soldul după tranzacție
    - Referința/numărul tranzacției
    - Tipul (debit/credit)
    - Categoria (transfer, plată card, încasare, comision, etc.)
    - Contrapartida (numele beneficiarului/plătitorului)
    - IBAN contrapartidă (dacă există)
    
    ANALIZĂ:
    - 3-5 insights despre activitatea contului
    - 2-3 recomandări pentru gestionarea financiară
    - Scor de încredere pentru extragerea datelor (0-100%)
    
    IMPORTANT: Răspunde DOAR cu un obiect JSON valid, fără text suplimentar, fără markdown, fără explicații.
    Toate proprietățile și valorile string trebuie să fie între ghilimele duble.
    
    Structura JSON exactă:
    {
      "bankName": "valoare_string",
      "accountNumber": "valoare_string",
      "statementPeriod": {
        "startDate": "valoare_string",
        "endDate": "valoare_string"
      },
      "openingBalance": "valoare_string",
      "closingBalance": "valoare_string",
      "transactions": [
        {
          "date": "valoare_string",
          "description": "valoare_string",
          "amount": "valoare_string",
          "balance": "valoare_string",
          "reference": "valoare_string",
          "type": "debit",
          "category": "valoare_string",
          "counterparty": "valoare_string",
          "iban": "valoare_string"
        }
      ],
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
    console.error('Eroare la analiza extrasului bancar cu Gemini:', error);
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