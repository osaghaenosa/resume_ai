import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentRequest } from '../types';

const getApiKey = (): string | null => {
    try {
        // This will fail gracefully if process or process.env is not defined in the browser.
        if (process.env.API_KEY && process.env.API_KEY !== "placeholder_api_key") {
            return process.env.API_KEY;
        }
    } catch (e) {
        // process.env is not available in the browser, which is expected.
    }
    return null;
}

const getResumeSystemInstruction = (request: DocumentRequest) => `
**ROLE & GOAL:** You are an expert career coach and professional writer. Your goal is to create a Resume that is a single, self-contained, and professionally styled HTML document. It MUST bypass AI detection tools by using varied, natural language. It must adhere strictly to the provided HTML structure.

**CRITICAL INSTRUCTIONS:**
1.  **HTML ONLY:** The entire output MUST be a single HTML string. Do not use markdown like \`\`\`html or any text outside of the main \`<div>\` container.
2.  **INLINE CSS:** Use inline CSS (the 'style' attribute) for ALL styling. Do not use <style> tags.
3.  **NATURAL LANGUAGE:** Avoid robotic language and clichés. Use strong action verbs and quantify achievements with metrics.
4.  **ADHERE TO TEMPLATE:** Use the exact two-column HTML structure provided. Populate the content within the specified divs.

**HTML Template to Follow (Fill in content based on user details):**
<div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #212121; padding: 40px; border: 1px solid #ddd;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 36px; margin: 0; color: #000; font-weight: bold;">${request.name}</h1>
    <p style="margin: 10px 0 0; font-size: 14px; color: #555;">${request.contact}</p>
  </div>
  <!-- Main Content -->
  <div style="display: flex; gap: 40px;">
    <!-- Left Column (35%) -->
    <div style="width: 35%;">
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Skills</h2>
      <div style="margin-bottom: 30px;">
        <!-- Generate a list of skills as <p> tags based on user input -->
      </div>
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Education</h2>
      <div>
        <!-- Generate education details here -->
      </div>
    </div>
    <!-- Right Column (65%) -->
    <div style="width: 65%;">
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Professional Summary</h2>
      <p style="margin-bottom: 30px; line-height: 1.6;">
        <!-- Generate a 3-4 sentence professional summary here -->
      </p>
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Work Experience</h2>
      <div>
        <!-- Generate each job entry as a div here. Use ul/li for bullet points. -->
      </div>
    </div>
  </div>
</div>
`;

const getCoverLetterSystemInstruction = (request: DocumentRequest) => `
**ROLE & GOAL:** You are an expert career coach creating a professional Cover Letter as a single, self-contained HTML document. Use natural, persuasive language to bypass AI detectors.

**CRITICAL INSTRUCTIONS:**
1.  **HTML ONLY:** The entire output MUST be a single HTML string. Do not use markdown.
2.  **INLINE CSS:** Use inline CSS (the 'style' attribute) for ALL styling. Do not use <style> tags.
3.  **LETTER FORMAT:** The letter should be professional, engaging, and structured in 3-4 paragraphs. It should connect the user's experience to the target role.

**HTML Template to Follow:**
<div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #212121; padding: 40px; border: 1px solid #ddd; line-height: 1.6;">
  <div style="margin-bottom: 30px;">
    <h1 style="font-size: 28px; margin: 0; color: #000; font-weight: bold;">${request.name}</h1>
    <p style="margin: 5px 0 0; font-size: 14px; color: #555;">${request.contact}</p>
  </div>
  <div style="margin-bottom: 20px; font-size: 14px;">
    <p style="margin: 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="margin: 20px 0 0;">Hiring Manager</p>
    <p style="margin: 0;">${request.targetCompany}</p>
  </div>
  <div style="font-size: 14px;">
    <h2 style="font-size: 16px; margin-bottom: 20px; font-weight: bold;">Re: Application for ${request.targetJob}</h2>
    <!-- Generate 3-4 paragraphs of the cover letter here as <p> tags -->
    <p style="margin-top: 20px;">Sincerely,</p>
    <p style="margin-top: 10px;">${request.name}</p>
  </div>
</div>
`;


const getMockHtmlResume = (request: DocumentRequest) => `
<div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #212121; padding: 40px; border: 1px solid #ddd;">
  <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 36px; margin: 0; color: #000; font-weight: bold;">${request.name} (MOCK)</h1>
    <p style="margin: 10px 0 0; font-size: 14px; color: #555;">${request.contact}</p>
  </div>
  <div style="display: flex; gap: 40px;">
    <div style="width: 35%;">
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Skills</h2>
      <div style="margin-bottom: 30px;"><p style="margin-bottom: 8px;">${request.skills.split(',').join('</p><p style="margin-bottom: 8px;">')}</p></div>
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Education</h2>
      <div><p style="margin:0; font-weight:bold;">${request.education.split(',')[0]}</p><p style="margin:5px 0 0;">${request.education.split(',').slice(1).join(',')}</p></div>
    </div>
    <div style="width: 65%;">
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Professional Summary</h2>
      <p style="margin-bottom: 30px; line-height: 1.6;">This is a mock response. To enable real AI generation, please set the API_KEY environment variable.</p>
      <h2 style="font-size: 16px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom:15px; color: #333; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Work Experience</h2>
      <div><div style="margin-bottom: 20px;"><h3 style="font-size: 16px; margin: 0; font-weight: bold;">Previous Role</h3><p style="margin: 5px 0; font-style: italic;">Some Company | 2018 - 2022</p><ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px;"><li style="margin-bottom: 8px; line-height: 1.6;">${request.experience}</li></ul></div></div>
    </div>
  </div>
</div>`;


export const generateDocument = async (request: DocumentRequest): Promise<string> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY environment variable not set. Using a mock response.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Return a mock HTML response for development
        if (request.docType === 'Resume') {
            return getMockHtmlResume(request);
        }
        // Basic mock for cover letter if needed
        return `<div style="padding: 40px; font-family: Arial, sans-serif;"><h1>Mock Cover Letter for ${request.name}</h1><p>This is a mock response because the API key is not configured.</p></div>`;
    }

    const { docType, experience, education, skills, targetJob, targetCompany } = request;
    const isResume = docType === 'Resume';

    const systemInstruction = isResume ? getResumeSystemInstruction(request) : getCoverLetterSystemInstruction(request);

    const userPrompt = `
**TASK:** Based on the user details below, generate the full HTML for the ${docType} by populating the template provided in the system instructions.

**USER DETAILS:**
- **Work Experience:** ${experience}
- **Education:** ${education}
- **Skills:** ${skills}
- **Target Job Title:** ${targetJob}
- **Target Company:** ${targetCompany}

Produce only the HTML content as requested.
    `.trim();

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating document with Gemini API:", error);
         if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The configured API key is not valid. Please check your configuration.");
        }
        throw new Error("Failed to generate document. The AI service may be temporarily unavailable.");
    }
};