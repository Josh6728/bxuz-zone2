import { AzureOpenAI } from 'openai';
import { AZURE_OPENAI_CONFIG } from '../config/azure-openai';
import { SearchResult, SuppliersResponse } from '../types/zoning';
import { globalCacheManager } from './cache-manager';

/**
 * Azure OpenAI Service for handling AI-powered zoning search queries
 */
export class AzureOpenAIService {
  private client: AzureOpenAI;

  constructor() {
    // Initialize Azure OpenAI client with the provided configuration
    // Note: dangerouslyAllowBrowser is enabled for development/testing
    // In production, API calls should be made from a secure backend
    this.client = new AzureOpenAI({
      endpoint: AZURE_OPENAI_CONFIG.endpoint,
      apiKey: AZURE_OPENAI_CONFIG.apiKey,
      deployment: AZURE_OPENAI_CONFIG.deployment,
      apiVersion: AZURE_OPENAI_CONFIG.apiVersion,
      dangerouslyAllowBrowser: true // Enable browser usage (development only)
    });
  }

  /**
   * Process a zoning search query using Azure OpenAI
   * @param query - User's search query
   * @returns Promise<SearchResult> - Structured search results
   */
  async searchWithAI(query: string): Promise<SearchResult> {
    // Check cache first
    const cachedResult = globalCacheManager.getSearchResults(query);
    if (cachedResult) {
      console.log('🎯 Using cached search result for:', query);
      return cachedResult;
    }

    console.log('🔍 Processing new search query:', query);

    // Check if we should use backend proxy instead of direct calls
    if (AZURE_OPENAI_CONFIG.useBackendProxy) {
      console.log('Using backend proxy for AI search');
      const result = await this.searchViaBackend(query);
      // Cache the result
      globalCacheManager.setSearchResults(query, result);
      return result;
    }

    console.log('Using direct Azure OpenAI connection');
    try {
      // Create the user prompt with context about Butuan City zoning
      const userPrompt = `
User Query: "${query}"

Task:
Analyze this query in the context of Butuan City zoning regulations and provide:

1. A clear, helpful summary addressing the user's question
2. Specific zoning information relevant to the query (zone type, permitted uses, restrictions)
3. Key highlights or important points to remember
4. If applicable, mention specific areas or parcels in Butuan City with their approximate coordinates
5. Provide a dedicated section called "safetyRequirements" – an array of objects, each with "title" (e.g., "Electrical Safety") and "details" (1-2 paragraphs of guidance). Tailor the requirements to the type of business implied by the query (e.g., internet café → electrical, fire, network security; food business → food safety, sanitation, etc.). Supply at least 3 items when relevant.
6. If the user is essentially asking "what can I build here" or "what businesses can I establish", also include at least three concrete example business/use suggestions in the highlights list.

Important Butuan City landmarks with coordinates for reference:
- J.C. Aquino Avenue (main commercial): [125.5230631, 8.943059]
- National Highway: [125.6023856, 8.9614707]
- Butuan Bay area: [125.5427666, 8.9514169]
- Near Father Saturnino Urios University and Agusan National High School Area: [125.5421062, 8.9464374]
- Near Saint Joseph Institute Technology Area: [125.5419917, 8.9515949]
- Bancasi Airport (Butuan Airport, IATA: BXU): [8.951470, 125.478820] 
- Ampayon Public Market: [8.959700, 125.602790]
- Near Father Saturnino Urios University Morelos Campus Area: [8.956944, 125.533889]
- Near Caraga State University (Ampayon Campus): [8.956500, 125.596400]
- Libertad - Near Church and Police Regional Office Area: [125.5050418, 8.9439688]
- Near Butuan City Hall Complex: [8.953611, 125.529194]

Formatting rules

Return only valid JSON – no markdown, comments, or extra text.

Use approximate coordinates; place points near the most relevant landmark.

Ignore or politely decline to answer questions unrelated to zoning in Butuan City.

Example output:
{
  "summary": "Lot consolidation along J.C. Aquino Ave. is permissible, but street-front retail must occupy at least 60% of the ground floor.",
  "highlights": [
    "C-1 zoning allows mixed-use up to 6 storeys.",
    "Setback reduction to 2 m possible with design-review approval.",
    "Provide on-site parking: 1 space per 60 m² GFA.",
    "Suggested businesses: Coffee shop, Internet café, Co-working space"
  ],
  "parcels": [
    {
      "address": "Corner of J.C. Aquino Ave. and Montilla Blvd.",
      "zoneType": "C-1",
      "relevance": "Requested corner lot for planned mid-rise retail-office development.",
      "coordinates": [125.5410, 8.9495]
    }
    /* Create minimum of 5 parcels maximum of 10, if relevant */
  ],
  "safetyRequirements": [
    {
      "title": "Electrical Safety",
      "details": "Ensure adequate circuit capacity..." 
    },
    {
      "title": "Fire Safety",
      "details": "Install certified fire-rated network racks..."
    },
    {
      "title": "General Safety",
      "details": "Provide clear emergency exits..."
    }
  ]
}`;

      // Call Azure OpenAI API - using deployment name instead of model name
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment, // Use deployment name for Azure OpenAI
        messages: [
          {
            role: 'system',
            content: AZURE_OPENAI_CONFIG.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],

      });

      // Extract and parse the AI response
      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from Azure OpenAI');
      }

      // Try to parse JSON response from AI
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the raw text
        parsedResponse = {
          summary: aiResponse,
          highlights: ["AI analysis provided", "Check local regulations", "Contact planning department for specifics"],
          parcels: []
        };
      }

      // Transform AI response into SearchResult format
      const searchResult: SearchResult = {
        query,
        results: {
          parcels: parsedResponse.parcels?.map((parcel: any, index: number) => {
            // Create geometry object with coordinates if provided
            let geometry = null;
            if (parcel.coordinates && Array.isArray(parcel.coordinates) && parcel.coordinates.length === 2) {
              geometry = {
                type: 'Point',
                coordinates: parcel.coordinates // [longitude, latitude]
              };
            }

            return {
              id: `ai-parcel-${index}`,
              address: parcel.address || 'Butuan City area',
              zoneId: parcel.zoneType || 'unknown',
              geometry: geometry,
              attributes: {
                relevance: parcel.relevance || 'AI-identified relevant area',
                source: 'AI Analysis',
                coordinates: parcel.coordinates || null
              }
            };
          }) || [
            {
              id: 'ai-general',
              address: 'Butuan City',
              zoneId: 'various',
              geometry: {
                type: 'Point',
                coordinates: [125.5431, 8.9512] // Default to Butuan City center
              },
              attributes: {
                relevance: 'General zoning information for Butuan City',
                source: 'AI Analysis',
                coordinates: [125.5431, 8.9512]
              }
            }
          ],
          summary: parsedResponse.summary || aiResponse,
          highlights: parsedResponse.highlights || ["AI analysis completed", "Review local zoning codes", "Consult with planning officials"],
          safetyRequirements: parsedResponse.safetyRequirements || []
        }
      };

      // Cache the successful result
      globalCacheManager.setSearchResults(query, searchResult);
      
      return searchResult;

    } catch (error) {
      console.error('Azure OpenAI API Error:', error);
      
      // Return fallback response in case of API failure
      return {
        query,
        results: {
          parcels: [{
            id: 'error-fallback',
            address: 'Butuan City',
            zoneId: 'unknown',
            geometry: null,
            attributes: {
              error: 'AI service temporarily unavailable',
              source: 'Fallback'
            }
          }],
          summary: `I'm sorry, but I'm having trouble processing your query "${query}" at the moment. Please try again later or contact the planning department for assistance with zoning questions.`,
          highlights: [
            "AI service temporarily unavailable",
            "Try again in a few moments",
            "Contact local planning department for immediate assistance"
          ],
          safetyRequirements: []
        }
      };
    }
  }

  /**
   * Search via backend API (production-safe approach)
   * @param query - User's search query
   * @returns Promise<SearchResult> - Structured search results
   */
  private async searchViaBackend(query: string): Promise<SearchResult> {
    try {
      const response = await fetch(AZURE_OPENAI_CONFIG.backendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend API Error:', error);
      
      // Return fallback response
      return {
        query,
        results: {
          parcels: [{
            id: 'backend-error',
            address: 'Butuan City',
            zoneId: 'unknown',
            geometry: null,
            attributes: {
              error: 'Backend API temporarily unavailable',
              source: 'Backend Fallback'
            }
          }],
          summary: `I'm sorry, but the AI service is temporarily unavailable. Please try again later or contact the planning department for assistance with your query: "${query}".`,
          highlights: [
            "Backend API temporarily unavailable",
            "Try again in a few moments",
            "Contact local planning department for immediate assistance"
          ],
          safetyRequirements: []
        }
      };
    }
  }

  /**
   * Test the Azure OpenAI connection
   * @returns Promise<boolean> - True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    // If using backend proxy, test the backend endpoint
    if (AZURE_OPENAI_CONFIG.useBackendProxy) {
      try {
        const response = await fetch(`${AZURE_OPENAI_CONFIG.backendApiUrl}/health`, {
          method: 'GET'
        });
        return response.ok;
      } catch (error) {
        console.error('Backend connection test failed:', error);
        return false;
      }
    }

    // Test direct Azure OpenAI connection
    try {
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment, // Use deployment name for Azure OpenAI
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test. Please respond with "Connection successful".'
          }
        ],
        // Removed explicit max_tokens and temperature parameters
      });

      return response.choices[0]?.message?.content?.includes('Connection successful') || false;
    } catch (error) {
      console.error('Azure OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the nearest building/material supplier contact information using Azure OpenAI.
   * The AI must return ONLY valid JSON with 3-5 suppliers in the form:
   * {
   *   "suppliers": [
   *     {
   *       "name": "<Full Filipino name>",
   *       "phone": "+63 9XX XXX XXXX",
   *       "business": "<Business name>",
   *       "address": "<Supplier address>",
   *       "distance_km": <number>
   *     }
   *   ]
   * }
   * @param location Free-form location string (address or description of the clicked spot)
   */
  async getNearestSuppliers(location: string, need?: string): Promise<SuppliersResponse> {
    // Check cache first
    const cachedSuppliers = globalCacheManager.getSuppliers(location, need);
    if (cachedSuppliers) {
      console.log('🎯 Using cached suppliers for:', location, need || 'general');
      return cachedSuppliers;
    }

    console.log('🔍 Fetching new suppliers for:', location, need || 'general');

    try {
      const userPrompt = `The user clicked the map at or near: "${location}".
User's interest/query: ${need ? `"${need}"` : 'Not specified'}

Task:
Generate 3-5 relevant suppliers that would be SPECIFICALLY useful for ${need ? `someone looking to establish a "${need}"` : 'general business needs'}.

IMPORTANT: Match supplier types to the specific business context:
- For coffee shops: coffee bean suppliers, cafe equipment, furniture suppliers
- For restaurants: kitchen equipment, food suppliers, restaurant furnishings
- For retail stores: retail fixtures, merchandise suppliers, POS systems
- For residential: furniture stores, appliance centers, interior designers
- For construction: building materials, contractors, architects

For each supplier, generate:
1. A realistic Filipino full name
2. A Philippine mobile number (+63 9XX XXX XXXX format)
3. A business name that CLEARLY RELATES to the user's specific needs
4. A Butuan City address or landmark
5. Distance in kilometers (1 decimal place) from the clicked location

Return ONLY valid JSON with this EXACT structure:
{
  "suppliers": [
    {
      "name": "Full Filipino Name",
      "phone": "+63 9XX XXX XXXX",
      "business": "Business Name (relevant to ${need || 'general business'} needs)",
      "address": "Butuan City address",
      "distance_km": X.X
    }
  ]
}`;
 
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment,
        messages: [
          {
            role: 'system',
            content: AZURE_OPENAI_CONFIG.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
      });

      const aiResponse = response.choices[0]?.message?.content?.trim();
      if (!aiResponse) {
        throw new Error('No response from Azure OpenAI');
      }

      // Attempt to parse JSON.
      let suppliersData: any;
      try {
        suppliersData = JSON.parse(aiResponse);
      } catch (err) {
        console.warn('Failed to parse suppliers JSON, falling back to mock', err);
        // Provide context-aware mock suppliers if JSON parsing fails
        return {
          suppliers: need?.toLowerCase().includes('coffee') || need?.toLowerCase().includes('cafe') ? [
            {
              name: 'Marco Reyes',
              phone: '+63 912 345 6789',
              business: 'Premium Coffee Bean Supply Co.',
              address: 'J.C. Aquino Ave., Butuan City',
              distance_km: 1.5
            },
            {
              name: 'Isabella Santos',
              phone: '+63 917 654 3210',
              business: 'Cafe Equipment Solutions',
              address: 'Montilla Blvd., Butuan City',
              distance_km: 2.2
            },
            {
              name: 'Gabriel Tan',
              phone: '+63 923 456 7890',
              business: 'Modern Cafe Furniture Store',
              address: 'National Highway, Butuan City',
              distance_km: 3.1
            }
          ] : [
            {
              name: 'Juan Dela Cruz',
              phone: '+63 912 345 6789',
              business: 'General Business Solutions',
              address: 'J.C. Aquino Ave., Butuan City',
              distance_km: 1.5
            },
            {
              name: 'Maria Santos',
              phone: '+63 917 654 3210',
              business: 'Business Equipment Center',
              address: 'Montilla Blvd., Butuan City',
              distance_km: 2.2
            },
            {
              name: 'Roberto Flores',
              phone: '+63 923 456 7890',
              business: 'Commercial Supply Store',
              address: 'National Highway, Butuan City',
              distance_km: 3.1
            }
          ],
          searchLocation: location,
          contextQuery: need
        };
      }

      // Validate the structure and create the response
      const suppliers = suppliersData.suppliers || [];
      if (!Array.isArray(suppliers) || suppliers.length === 0) {
        throw new Error('Invalid suppliers array in response');
      }

      // Limit to maximum 5 suppliers
      const limitedSuppliers = suppliers.slice(0, 5);

      const suppliersResponse: SuppliersResponse = {
        suppliers: limitedSuppliers,
        searchLocation: location,
        contextQuery: need
      };

      // Cache the successful result
      globalCacheManager.setSuppliers(location, need, suppliersResponse);

      return suppliersResponse;
    } catch (error) {
      console.error('Azure OpenAI supplier lookup error:', error);
      // Provide context-aware fallback suppliers
      return {
        suppliers: need?.toLowerCase().includes('coffee') || need?.toLowerCase().includes('cafe') ? [
          {
            name: 'Maria Santos',
            phone: '+63 917 654 3210',
            business: 'Coffee Bean Direct Supplier',
            address: 'Downtown Butuan City',
            distance_km: 2.0
          },
          {
            name: 'Carlos Reyes',
            phone: '+63 905 123 4567',
            business: 'Cafe Equipment and Services',
            address: 'Capitol Site, Butuan City',
            distance_km: 2.8
          },
          {
            name: 'Ana Villanueva',
            phone: '+63 918 765 4321',
            business: 'Cafe Interior Design Studio',
            address: 'Guingona Ave., Butuan City',
            distance_km: 1.7
          }
        ] : [
          {
            name: 'Maria Santos',
            phone: '+63 917 654 3210',
            business: 'Business Supply Center',
            address: 'Downtown Butuan City',
            distance_km: 2.0
          },
          {
            name: 'Carlos Reyes',
            phone: '+63 905 123 4567',
            business: 'Commercial Equipment Store',
            address: 'Capitol Site, Butuan City',
            distance_km: 2.8
          },
          {
            name: 'Ana Villanueva',
            phone: '+63 918 765 4321',
            business: 'Business Solutions Provider',
            address: 'Guingona Ave., Butuan City',
            distance_km: 1.7
          }
        ],
        searchLocation: location,
        contextQuery: need
      };
    }
  }

  /**
   * Generate AI response for general queries
   * @param prompt - The prompt to send to AI
   * @returns Promise<string> - AI response
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides accurate and detailed responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
  /**
   * Generate AI-estimated floor area for a parcel based on business context
   * @param parcel - The parcel to estimate floor area for
   * @param businessContext - The user's business interest/search query
   * @returns Promise<string> - Estimated floor area (e.g., "120 square meters")
   */
  async generateFloorArea(parcel: { id: string; address: string; zoneId: string; attributes: Record<string, any> }, businessContext?: string): Promise<string> {
    try {
      const prompt = `Given a parcel in Butuan City, Philippines with the following details:

Address: ${parcel.address}
Zone Type: ${parcel.zoneId}
Zone Name: ${parcel.attributes.ZONE_NAME || 'N/A'}

User Business Interest: ${businessContext || 'General business'}

Task: Estimate the optimal floor area for a ${businessContext ? `"${businessContext}"` : 'general business'} in this location.

BUSINESS-SPECIFIC FLOOR AREA GUIDELINES:
- Coffee Shop/Café: 5-15 square meters (small takeaway) to 30-80 square meters (sit-in café)
- Restaurant: 50-150 square meters (small) to 200-500 square meters (full-service)
- Retail Store/Shop: 20-100 square meters (boutique) to 150-400 square meters (larger retail)
- Office/Coworking: 50-200 square meters (small office) to 300-800 square meters (larger workspace)
- Clinic/Medical: 30-110 square meters (consultation rooms + waiting area)
- Gym/Fitness: 100-400 square meters (equipment space + changing rooms)
- Beauty Salon/Spa: 20-80 square meters (basic salon) to 100-200 square meters (full spa)
- Bakery: 15-55 square meters (neighborhood bakery)
- Internet Café: 30-100 square meters (computer stations + counter)
- Laundry/Dry Cleaning: 25-75 square meters (machines + customer area)
- Apartments/Housing: 25-60 square meters (studio) to 80-150 square meters (family unit)
- Manufacturing/Workshop: 200-2000+ square meters depending on operations

Consider:
1. The specific business type from the user's query
2. Zone type regulations and typical sizes for this zone
3. Local Butuan City business patterns
4. Practical space requirements for the intended business
5. Philippine building standards and customer expectations

Provide ONLY a realistic floor area estimate in the format: "XXX square meters" (e.g., "12 square meters" for a small coffee shop).
Be specific to the business type - a coffee shop should be much smaller than a restaurant.`;

      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Philippine real estate, business planning, and space requirements. Provide realistic floor area estimates based on specific business types and local market conditions in Butuan City.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3 // Lower temperature for more consistent estimates
      });

      const aiResponse = response.choices[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Extract floor area from response
      const floorAreaMatch = aiResponse.match(/(\d+)\s*square\s*meters/i);
      if (floorAreaMatch) {
        return `${floorAreaMatch[1]} square meters`;
      }

      // Fallback: if AI doesn't return expected format, extract number and format it
      const numberMatch = aiResponse.match(/(\d+)/);
      if (numberMatch) {
        return `${numberMatch[1]} square meters`;
      }

      // Final fallback based on business context and zone type
      return this.getFallbackFloorAreaByBusiness(parcel.zoneId, businessContext);

    } catch (error) {
      console.error('Error generating floor area:', error);
      // Return fallback floor area based on business context and zone type
      return this.getFallbackFloorAreaByBusiness(parcel.zoneId, businessContext);
    }
  }

  /**
   * Get fallback floor area based on business context and zone type
   * @param zoneId - The zone ID
   * @param businessContext - The business context
   * @returns string - Fallback floor area estimate
   */
  private getFallbackFloorAreaByBusiness(zoneId: string, businessContext?: string): string {
    const business = businessContext?.toLowerCase() || '';
    
    // Business-specific floor areas
    if (business.includes('coffee') || business.includes('café') || business.includes('cafe')) {
      return `${Math.floor(Math.random() * 10) + 5} square meters`; // 5-15 sq m
    }
    if (business.includes('restaurant') || business.includes('food') || business.includes('dining')) {
      return `${Math.floor(Math.random() * 100) + 50} square meters`; // 50-150 sq m
    }
    if (business.includes('retail') || business.includes('store') || business.includes('shop')) {
      return `${Math.floor(Math.random() * 80) + 20} square meters`; // 20-100 sq m
    }
    if (business.includes('office') || business.includes('coworking') || business.includes('workspace')) {
      return `${Math.floor(Math.random() * 150) + 50} square meters`; // 50-200 sq m
    }
    if (business.includes('clinic') || business.includes('medical') || business.includes('health')) {
      return `${Math.floor(Math.random() * 80) + 30} square meters`; // 30-110 sq m
    }
    if (business.includes('gym') || business.includes('fitness') || business.includes('workout')) {
      return `${Math.floor(Math.random() * 300) + 100} square meters`; // 100-400 sq m
    }
    if (business.includes('salon') || business.includes('beauty') || business.includes('spa')) {
      return `${Math.floor(Math.random() * 60) + 20} square meters`; // 20-80 sq m
    }
    if (business.includes('bakery') || business.includes('pastry')) {
      return `${Math.floor(Math.random() * 40) + 15} square meters`; // 15-55 sq m
    }
    if (business.includes('internet cafe') || business.includes('computer shop')) {
      return `${Math.floor(Math.random() * 70) + 30} square meters`; // 30-100 sq m
    }
    if (business.includes('laundry') || business.includes('dry clean')) {
      return `${Math.floor(Math.random() * 50) + 25} square meters`; // 25-75 sq m
    }
    if (business.includes('apartment') || business.includes('housing') || business.includes('residential')) {
      return `${Math.floor(Math.random() * 70) + 30} square meters`; // 30-100 sq m
    }
    
    // Zone-based fallback if no business context
    const zoneType = zoneId?.toLowerCase() || '';
    if (zoneType.includes('c-1') || zoneType.includes('commercial')) {
      return `${Math.floor(Math.random() * 200) + 150} square meters`; // 150-350 sq m
    } else if (zoneType.includes('mu') || zoneType.includes('mixed')) {
      return `${Math.floor(Math.random() * 150) + 120} square meters`; // 120-270 sq m
    } else if (zoneType.includes('r-1') || zoneType.includes('residential')) {
      return `${Math.floor(Math.random() * 100) + 80} square meters`; // 80-180 sq m
    } else if (zoneType.includes('i-1') || zoneType.includes('industrial')) {
      return `${Math.floor(Math.random() * 800) + 400} square meters`; // 400-1200 sq m
    } else if (zoneType.includes('os') || zoneType.includes('open')) {
      return `${Math.floor(Math.random() * 80) + 100} square meters`; // 100-180 sq m
    }
    
    // Default fallback
    return `${Math.floor(Math.random() * 120) + 100} square meters`; // 100-220 sq m
  }
}

// Export a singleton instance
export const azureOpenAIService = new AzureOpenAIService();

// Export convenience function for general AI responses
export const generateAIResponse = (prompt: string) => azureOpenAIService.generateResponse(prompt);