
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentRequest, PortfolioProject, ResumeTemplate } from '../types';

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

// --- RESUME TEMPLATES ---
const CLASSIC_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Georgia', 'Times New Roman', serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #333; padding: 40px; border: 1px solid #ddd;">
  <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px;">
    <h1 style="font-size: 32px; margin: 0; color: #000; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${request.name}</h1>
    <p style="margin: 10px 0 0; font-size: 14px; color: #555;">${request.contact}</p>
  </div>
  <div style="display: flex; gap: 30px;">
    <div style="width: 65%;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Professional Summary</h2>
      <p style="margin-bottom: 25px; line-height: 1.6; font-size: 14px;">
        <!-- Generate a 3-4 sentence professional summary here -->
      </p>
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Work Experience</h2>
      <div><!-- Generate each job entry as a div here. --></div>
    </div>
    <div style="width: 35%;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Skills</h2>
      <div style="margin-bottom: 25px;"><!-- Generate a list of skills as <p> tags here --></div>
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Education</h2>
      <div><!-- Generate education details here --></div>
    </div>
  </div>
</div>`;

const MODERN_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #212121; padding: 40px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0D9488; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
            <h1 style="font-size: 42px; margin: 0; color: #0D9488; font-weight: 300;">${request.name}</h1>
            <p style="margin: 5px 0 0; font-size: 18px; color: #555;">${request.targetJob}</p>
        </div>
        <p style="font-size: 12px; color: #555; text-align: right; line-height: 1.5;">${(request.contact || '').split('|').join('<br>')}</p>
    </div>
    <!-- Single column layout -->
    <div>
        <h2 style="font-size: 18px; color: #0D9488; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Summary</h2>
        <p style="margin-bottom: 30px; line-height: 1.6; font-size: 15px;"><!-- Generate summary --></p>
        <h2 style="font-size: 18px; color: #0D9488; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Experience</h2>
        <div style="margin-bottom: 30px;"><!-- Generate experience --></div>
        <h2 style="font-size: 18px; color: #0D9488; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Education</h2>
        <div style="margin-bottom: 30px;"><!-- Generate education --></div>
        <h2 style="font-size: 18px; color: #0D9488; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Skills</h2>
        <div><!-- Generate skills as a comma-separated list or pills --></div>
    </div>
</div>`;

const SIMPLE_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #111; padding: 50px; line-height: 1.7;">
  <div style="margin-bottom: 40px;">
    <h1 style="font-size: 28px; margin: 0; font-weight: 600;">${request.name}</h1>
    <p style="margin: 5px 0 0; font-size: 16px; color: #666;">${request.contact}</p>
  </div>
  <div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px;">Professional Experience</h2>
    <div style="margin-bottom: 30px;"><!-- Generate experience --></div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px;">Education</h2>
    <div style="margin-bottom: 30px;"><!-- Generate education --></div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px;">Skills</h2>
    <div><!-- Generate skills as a simple paragraph --></div>
  </div>
</div>`;

const CREATIVE_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Poppins', sans-serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #333; display: flex; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <!-- Left Sidebar -->
  <div style="width: 35%; background-color: #2C3E50; color: #fff; padding: 40px;">
    ${request.profilePicture ? `<img src="${request.profilePicture}" alt="Profile" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; display: block; border: 4px solid #3498DB;">` : '<div style="width: 120px; height: 120px; border-radius: 50%; background-color: #3498DB; margin: 0 auto 20px;"></div>'}
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #3498DB; padding-bottom: 10px; margin-bottom: 20px;">Contact</h2>
    <p style="font-size: 13px; line-height: 1.8; word-break: break-word;">${(request.contact || '').split('|').join('<br>')}</p>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #3498DB; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px;">Education</h2>
    <div style="font-size: 13px; line-height: 1.8;"><!-- Generate education --></div>
  </div>
  <!-- Right Content -->
  <div style="width: 65%; padding: 40px;">
    <div style="margin-bottom: 30px;">
        <h1 style="font-size: 40px; margin: 0; color: #2C3E50; font-weight: 700;">${request.name}</h1>
        <p style="font-size: 18px; margin: 5px 0 0; color: #3498DB; font-weight: 500;">${request.targetJob}</p>
    </div>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #2C3E50; margin-bottom: 15px;">Summary</h2>
    <p style="font-size: 14px; line-height: 1.7; margin-bottom: 30px;"><!-- Generate summary --></p>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #2C3E50; margin-bottom: 15px;">Experience</h2>
    <div style="margin-bottom: 30px;"><!-- Generate experience --></div>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #2C3E50; margin-bottom: 15px;">Skills</h2>
    <div><!-- Generate skills, maybe with visual bars --></div>
  </div>
</div>`;

const TECHNICAL_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Menlo', 'Monaco', 'Courier New', monospace; margin: 0 auto; max-width: 800px; background-color: #1A1A1A; color: #EAEAEA; padding: 40px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 36px; margin: 0; color: #00FF9B; font-weight: normal;">${request.name}</h1>
    <p style="margin: 8px 0; font-size: 16px; color: #00FF9B;">&lt;${request.targetJob}&gt;</p>
    <p style="margin: 8px 0 0; font-size: 14px; color: #999;">${request.contact}</p>
  </div>
  <div>
    <h2 style="font-size: 18px; color: #00FF9B; font-weight: normal; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 15px;">// SUMMARY</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 30px;"><!-- Generate summary --></p>
    
    <h2 style="font-size: 18px; color: #00FF9B; font-weight: normal; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 15px;">// PROFESSIONAL_EXPERIENCE</h2>
    <div style="margin-bottom: 30px;"><!-- Generate experience --></div>

    <h2 style="font-size: 18px; color: #00FF9B; font-weight: normal; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 15px;">// SKILL_MATRIX</h2>
    <div style="margin-bottom: 30px;"><!-- Generate skills grouped by category (e.g., Languages, Frameworks, Tools) --></div>

    <h2 style="font-size: 18px; color: #00FF9B; font-weight: normal; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 15px;">// EDUCATION</h2>
    <div><!-- Generate education --></div>
  </div>
</div>`;

const getResumeSystemInstruction = (request: DocumentRequest) => {
    const { resumeTemplate = 'classic' } = request;
    let populatedTemplate;

    switch (resumeTemplate) {
        case 'classic': populatedTemplate = CLASSIC_RESUME_TEMPLATE(request); break;
        case 'modern': populatedTemplate = MODERN_RESUME_TEMPLATE(request); break;
        case 'simple': populatedTemplate = SIMPLE_RESUME_TEMPLATE(request); break;
        case 'creative': populatedTemplate = CREATIVE_RESUME_TEMPLATE(request); break;
        case 'technical': populatedTemplate = TECHNICAL_RESUME_TEMPLATE(request); break;
        default: populatedTemplate = CLASSIC_RESUME_TEMPLATE(request);
    }

    return `
**ROLE & GOAL:** You are an expert career coach and professional writer. Your goal is to create a Resume that is a single, self-contained, and professionally styled HTML document. It MUST bypass AI detection tools by using varied, natural language. It must adhere strictly to the provided HTML structure for the chosen template.

**CRITICAL INSTRUCTIONS:**
1.  **HTML ONLY:** The entire output MUST be a single HTML string. Do not use markdown like \`\`\`html or any text outside of the main \`<div>\` container.
2.  **INLINE CSS:** Use inline CSS (the 'style' attribute) for ALL styling. Do not use <style> tags.
3.  **NATURAL LANGUAGE:** Avoid robotic language and clichés. Use strong action verbs and quantify achievements with metrics where possible.
4.  **ADHERE TO TEMPLATE:** Use the exact HTML structure provided below. Populate the content within the specified divs and comments. For the 'creative' template, if a profile picture is not provided, use the placeholder div.

**HTML Template to Follow (Template: ${resumeTemplate}):**
${populatedTemplate}
`;
}

// --- COVER LETTER ---
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

// --- PORTFOLIO TEMPLATES ---
const ONYX_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #111827; color: #D1D5DB;">
  <!-- HERO -->
  <div style="text-align: center; padding: 120px 24px 80px 24px;">
    <h1 style="font-size: 56px; font-weight: 800; color: #FFFFFF; margin: 0;">${request.name || ''}</h1>
    <p style="font-size: 22px; color: #5EEAD4; margin-top: 8px;">${request.targetJob || ''}</p>
  </div>
  <!-- ABOUT -->
  <div id="about" style="max-width: 768px; margin: 0 auto; padding: 48px 24px;">
    <h2 style="font-size: 32px; font-weight: 700; color: #FFFFFF; border-bottom: 2px solid #5EEAD4; padding-bottom: 12px; margin-bottom: 24px;">About Me</h2>
    <p style="font-size: 18px; line-height: 1.7; color: #D1D5DB;">${request.portfolioBio || ''}</p>
  </div>
  <!-- PROJECTS -->
  <div id="projects" style="max-width: 1200px; margin: 0 auto; padding: 48px 24px;">
    <h2 style="text-align: center; font-size: 32px; font-weight: 700; color: #FFFFFF; margin-bottom: 48px;">My Work</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px;">
      <!-- For each project, generate a card -->
    </div>
  </div>
  <!-- CONTACT -->
  <div id="contact" style="background-color: #1F2937; padding: 80px 24px; text-align: center; margin-top: 48px;">
    <h2 style="font-size: 32px; font-weight: 700; color: #FFFFFF;">Get In Touch</h2>
    <p style="margin-top: 16px; font-size: 18px; color: #D1D5DB; max-width: 512px; margin-left: auto; margin-right: auto;">${request.contact || ''}</p>
    <div style="margin-top: 32px; display: flex; justify-content: center; gap: 24px;">
      <!-- Generate social links -->
    </div>
  </div>
</div>
<!-- Project Card Structure (for AI to follow)
<div style="background-color: #1F2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151; transition: transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
    <img src="<-- BASE64 IMAGE -->" alt="Project Title" style="width: 100%; height: 224px; object-fit: cover;">
    <div style="padding: 24px;">
        <h3 style="font-size: 20px; font-weight: 600; color: #FFFFFF;">Project Title</h3>
        <p style="margin-top: 8px; font-size: 14px; line-height: 1.6; color: #9CA3AF;">Project Description</p>
        <a href="<-- LINK -->" target="_blank" style="display: inline-block; margin-top: 16px; color: #5EEAD4; text-decoration: none; font-weight: 600;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">View Project &rarr;</a>
    </div>
</div>
-->
`;

const QUARTZ_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Georgia', 'Times New Roman', serif; background-color: #FFFFFF; color: #333333;">
  <!-- HEADER -->
  <div style="padding: 48px 24px; border-bottom: 1px solid #E5E7EB; text-align: center;">
    <h1 style="font-size: 48px; font-weight: 600; color: #111827;">${request.name || ''}</h1>
    <p style="font-size: 20px; color: #4B5563; margin-top: 8px;">${request.targetJob || ''}</p>
  </div>
  <!-- MAIN CONTENT -->
  <div style="max-width: 1100px; margin: 48px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 3fr; gap: 48px;">
    <!-- LEFT SIDEBAR -->
    <div style="border-right: 1px solid #E5E7EB; padding-right: 24px;">
      <h2 style="font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #111827;">Contact</h2>
      <p style="margin-top: 16px; font-size: 16px; line-height: 1.6;">${request.contact || ''}</p>
      <h2 style="font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-top: 32px;">Links</h2>
      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
        <!-- Generate social links -->
      </div>
    </div>
    <!-- RIGHT CONTENT -->
    <div>
      <h2 style="font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #111827;">About Me</h2>
      <p style="margin-top: 16px; font-size: 16px; line-height: 1.8;">${request.portfolioBio || ''}</p>
      <h2 style="font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-top: 48px;">Projects</h2>
      <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr; gap: 32px;">
        <!-- For each project, generate a card -->
      </div>
    </div>
  </div>
</div>
<!-- Project Card Structure
<div style="display: flex; gap: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 32px;">
    <img src="<-- BASE64 IMAGE -->" alt="Project Title" style="width: 200px; height: 125px; object-fit: cover; border-radius: 4px;">
    <div>
        <h3 style="font-size: 22px; font-weight: 600; color: #1F2937;">Project Title</h3>
        <p style="margin-top: 8px; font-size: 15px; line-height: 1.6; color: #4B5563;">Project Description</p>
        <a href="<-- LINK -->" target="_blank" style="display: inline-block; margin-top: 12px; color: #2563EB; text-decoration: none; font-weight: 600;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Learn More</a>
    </div>
</div>
-->
`;

const SAPPHIRE_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Poppins', 'Helvetica Neue', sans-serif; background-color: #F0F4F8; color: #1E293B;">
  <!-- HERO -->
  <div style="background-color: #4F46E5; color: #FFFFFF; padding: 80px 24px;">
    <div style="max-width: 1024px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 32px;">
      <div>
        <h1 style="font-size: 64px; font-weight: 700; line-height: 1.1;">${request.name || ''}</h1>
        <p style="font-size: 24px; opacity: 0.9; margin-top: 16px;">${request.targetJob || ''}</p>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 12px;">
         <p style="font-size: 16px; line-height: 1.7;">${request.portfolioBio || ''}</p>
      </div>
    </div>
  </div>
  <!-- PROJECTS -->
  <div id="projects" style="max-width: 1200px; margin: 0 auto; padding: 64px 24px;">
    <h2 style="font-size: 36px; font-weight: 700; color: #1E293B; text-align: center; margin-bottom: 48px;">Featured Work</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 32px;">
      <!-- For each project, generate a card -->
    </div>
  </div>
  <!-- CONTACT -->
  <div id="contact" style="background-color: #1E293B; color: #F0F4F8; padding: 64px 24px; text-align: center;">
    <h2 style="font-size: 36px; font-weight: 700;">Let's Collaborate</h2>
    <p style="margin-top: 16px; font-size: 18px; max-width: 512px; margin-left: auto; margin-right: auto; opacity: 0.8;">${request.contact || ''}</p>
    <div style="margin-top: 32px; display: flex; justify-content: center; gap: 24px;">
       <!-- Generate social links with white color -->
    </div>
  </div>
</div>
<!-- Project Card Structure
<div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';">
    <div style="position: relative;">
        <img src="<-- BASE64 IMAGE -->" alt="Project Title" style="width: 100%; height: 240px; object-fit: cover;">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); padding: 16px;">
             <h3 style="font-size: 22px; font-weight: 600; color: #FFFFFF;">Project Title</h3>
        </div>
    </div>
    <div style="padding: 24px;">
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">Project Description</p>
        <a href="<-- LINK -->" target="_blank" style="display: inline-block; margin-top: 16px; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 9999px; font-size: 14px; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#4338CA';" onmouseout="this.style.backgroundColor='#4F46E5';">View Case Study</a>
    </div>
</div>
-->
`;

const EMERALD_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Lato', 'Helvetica Neue', sans-serif; background-color: #F8F9FA; color: #343A40;">
  <!-- HEADER -->
  <div style="background-color: #fff; padding: 60px 24px; text-align: center; border-bottom: 1px solid #E9ECEF;">
    ${request.profilePicture ? `<img src="${request.profilePicture}" alt="Profile" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 5px solid #28A745;">` : ''}
    <h1 style="font-size: 48px; font-weight: 700; color: #212529; margin: 0;">${request.name || ''}</h1>
    <p style="font-size: 22px; color: #6C757D; margin-top: 8px;">${request.targetJob || ''}</p>
    <div style="margin-top: 24px; display: flex; justify-content: center; gap: 24px;">
      <!-- Generate social links here with a professional look -->
    </div>
  </div>
  <!-- ABOUT -->
  <div id="about" style="max-width: 800px; margin: 60px auto; padding: 0 24px; text-align: center;">
    <h2 style="font-size: 32px; font-weight: 700; color: #28A745; margin-bottom: 16px;">About Me</h2>
    <p style="font-size: 18px; line-height: 1.8;">${request.portfolioBio || ''}</p>
  </div>
  <!-- PROJECTS -->
  <div id="projects" style="background-color: #FFFFFF; padding: 60px 24px;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <h2 style="text-align: center; font-size: 32px; font-weight: 700; color: #28A745; margin-bottom: 48px;">Portfolio</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
        <!-- For each project, generate a card -->
      </div>
    </div>
  </div>
  <!-- CONTACT -->
  <div id="contact" style="background-color: #343A40; color: #F8F9FA; padding: 60px 24px; text-align: center;">
    <h2 style="font-size: 32px; font-weight: 700;">Contact Me</h2>
    <p style="margin-top: 16px; font-size: 18px; max-width: 512px; margin-left: auto; margin-right: auto; opacity: 0.9;">${request.contact || ''}</p>
  </div>
</div>
<!-- Project Card Structure for Emerald
<div style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 25px rgba(0,0,0,0.08); overflow: hidden; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)';" onmouseout="this.style.transform='none';">
    <img src="<-- BASE64 IMAGE -->" alt="Project Title" style="width: 100%; height: 200px; object-fit: cover;">
    <div style="padding: 24px;">
        <h3 style="font-size: 20px; font-weight: 700; color: #343A40;">Project Title</h3>
        <p style="margin-top: 8px; font-size: 15px; line-height: 1.6; color: #6C757D;">Project Description</p>
        <a href="<-- LINK -->" target="_blank" style="display: inline-block; margin-top: 16px; color: #28A745; text-decoration: none; font-weight: 700;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">View Details &rarr;</a>
    </div>
</div>
-->
`;

const RUBY_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Playfair Display', serif; background-color: #121212; color: #E0E0E0;">
  <!-- HERO -->
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px;">
    <div>
        ${request.profilePicture ? `<img src="${request.profilePicture}" alt="Profile" style="width: 180px; height: 180px; border-radius: 50%; object-fit: cover; margin: 0 auto 30px; display: block; border: 6px solid #C2185B;">` : ''}
        <h1 style="font-size: 8vw; font-weight: 700; color: #FFFFFF; line-height: 1; margin: 0;">${request.name || ''}</h1>
        <p style="font-size: 2.5vw; color: #C2185B; margin-top: 16px; font-family: 'Roboto Condensed', sans-serif; text-transform: uppercase; letter-spacing: 2px;">${request.targetJob || ''}</p>
    </div>
  </div>
  <!-- ABOUT -->
  <div style="padding: 80px 24px; background-color: #1A1A1A;">
    <div style="max-width: 800px; margin: 0 auto; text-align: center;">
      <p style="font-size: 22px; line-height: 1.8; color: #BDBDBD;">${request.portfolioBio || ''}</p>
    </div>
  </div>
  <!-- PROJECTS -->
  <div id="projects" style="max-width: 1400px; margin: 0 auto; padding: 80px 24px;">
    <h2 style="text-align: center; font-size: 48px; font-weight: 700; color: #FFFFFF; margin-bottom: 60px;">Selected Work</h2>
    <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px;">
      <!-- Generate project cards here, using varied grid-column spans for a masonry effect -->
    </div>
  </div>
  <!-- CONTACT -->
  <div id="contact" style="background-color: #C2185B; color: #FFFFFF; padding: 80px 24px; text-align: center;">
    <h2 style="font-size: 48px; font-weight: 700;">Let's Create Together</h2>
    <p style="margin-top: 16px; font-size: 20px; max-width: 600px; margin-left: auto; margin-right: auto;">${request.contact || ''}</p>
    <div style="margin-top: 32px; display: flex; justify-content: center; gap: 32px;">
       <!-- Generate social links here with white color -->
    </div>
  </div>
</div>
<!-- Project Card Structure for Ruby. Use "grid-column: span X" where X is 4, 6, or 8 to create a dynamic layout.
<div style="background-color: #1A1A1A; border-radius: 4px; overflow: hidden; grid-column: span 6;">
    <img src="<-- BASE64 IMAGE -->" alt="Project Title" style="width: 100%; height: auto; display: block;">
    <div style="padding: 24px;">
        <h3 style="font-size: 28px; font-weight: 700; color: #FFFFFF;">Project Title</h3>
        <p style="margin-top: 12px; font-size: 16px; line-height: 1.7; color: #BDBDBD; font-family: 'Roboto Condensed', sans-serif;">Project Description</p>
        <a href="<-- LINK -->" target="_blank" style="display: inline-block; margin-top: 20px; color: #C2185B; text-decoration: none; font-weight: 700; font-family: 'Roboto Condensed', sans-serif; letter-spacing: 1px;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">EXPLORE</a>
    </div>
</div>
-->
`;


const getPortfolioSystemInstruction = (request: DocumentRequest) => {
    const { portfolioTemplate = 'onyx' } = request;
    let populatedTemplate;

    switch (portfolioTemplate) {
        case 'onyx': populatedTemplate = ONYX_TEMPLATE(request); break;
        case 'quartz': populatedTemplate = QUARTZ_TEMPLATE(request); break;
        case 'sapphire': populatedTemplate = SAPPHIRE_TEMPLATE(request); break;
        case 'emerald': populatedTemplate = EMERALD_TEMPLATE(request); break;
        case 'ruby': populatedTemplate = RUBY_TEMPLATE(request); break;
        default: populatedTemplate = ONYX_TEMPLATE(request);
    }

    return `
**ROLE & GOAL:** You are a world-class web designer and frontend developer. Your task is to create a stunning, single-file HTML portfolio for a user. The entire output must be a single, self-contained HTML document. It must be visually appealing, responsive, and modern.

**CRITICAL INSTRUCTIONS:**
1.  **HTML ONLY:** The entire output MUST be a single HTML string, starting with the outer \`<div>\` and ending with its corresponding \`</div>\`. DO NOT use markdown like \`\`\`html or any text outside the main container.
2.  **INLINE CSS ONLY:** Use inline CSS (the 'style' attribute) for ALL styling. Do NOT use \`<style>\` tags or external stylesheets. Use Flexbox or Grid for layout to ensure responsiveness.
3.  **IMAGES:** The user provides Base64 encoded images for their projects and potentially a profile picture. You MUST use the exact Base64 string in the 'src' attribute of the \`<img>\` tag. For example: \`<img src="data:image/jpeg;base64,..." alt="Project Title">\`. DO NOT use placeholder image services. If a profile picture is not provided for a template that supports it, omit the \`<img>\` tag entirely or use the specified placeholder structure.
4.  **PROJECTS:** The user provides a list of projects. You must iterate through this list and create a project 'card' for each one, using the specific HTML structure for a project card as commented out in the chosen template below. For the 'Ruby' template, you should dynamically assign "grid-column: span X;" (where X is 4, 6, or 8) to create a varied, masonry-style layout.
5.  **LINKS:** Populate social links and project links where indicated.

**HTML STRUCTURE TO POPULATE (Template: ${portfolioTemplate}):**
${populatedTemplate}
`;
}


const getMockHtmlResume = (request: DocumentRequest) => `
<div style="font-family: 'Georgia', 'Times New Roman', serif; margin: 0 auto; max-width: 800px; background-color: #fff; color: #333; padding: 40px; border: 1px solid #ddd;">
  <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px;">
    <h1 style="font-size: 32px; margin: 0; color: #000; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${request.name} (MOCK)</h1>
    <p style="margin: 10px 0 0; font-size: 14px; color: #555;">${request.contact}</p>
  </div>
  <div style="display: flex; gap: 30px;">
    <div style="width: 65%;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Professional Summary</h2>
      <p style="margin-bottom: 25px; line-height: 1.6; font-size: 14px;">This is a mock response. To enable real AI generation, please set the API_KEY environment variable.</p>
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Work Experience</h2>
      <div><div style="margin-bottom: 20px;"><h3 style="font-size: 16px; margin: 0; font-weight: bold;">Previous Role</h3><p style="margin: 5px 0; font-style: italic;">Some Company | 2018 - 2022</p><ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px;"><li style="margin-bottom: 8px; line-height: 1.6;">${request.experience}</li></ul></div></div>
    </div>
    <div style="width: 35%;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Skills</h2>
      <div style="margin-bottom: 25px;"><p>${request.skills.split(',').join(', ')}</p></div>
      <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Education</h2>
      <div><p style="margin:0; font-weight:bold;">${request.education.split(',')[0]}</p><p style="margin:5px 0 0;">${request.education.split(',').slice(1).join(',')}</p></div>
    </div>
  </div>
</div>`;

const getMockHtmlPortfolio = (request: DocumentRequest) => {
    const projectHtml = (request.portfolioProjects || []).map(p => `
    <div style="background-color: #1F2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
        <img src="${p.image || 'https://images.unsplash.com/photo-1517694712202-1428bc38aa5a?q=80&w=800&auto=format&fit=crop'}" alt="${p.title}" style="width: 100%; height: 224px; object-fit: cover;">
        <div style="padding: 24px;">
            <h3 style="font-size: 20px; font-weight: 600; color: #FFFFFF;">${p.title} (MOCK)</h3>
            <p style="margin-top: 8px; font-size: 14px; line-height: 1.6; color: #9CA3AF;">${p.description}</p>
            ${p.link ? `<a href="${p.link}" target="_blank" style="display: inline-block; margin-top: 16px; color: #5EEAD4; text-decoration: none; font-weight: 600;">View Project &rarr;</a>` : ''}
        </div>
    </div>`).join('');

    return `
    <div style="font-family: 'Inter', sans-serif; background-color: #111827; color: #D1D5DB;">
      <div style="text-align: center; padding: 120px 24px 80px 24px;">
        <h1 style="font-size: 56px; font-weight: 800; color: #FFFFFF; margin: 0;">${request.name} (MOCK)</h1>
        <p style="font-size: 22px; color: #5EEAD4; margin-top: 8px;">${request.targetJob}</p>
      </div>
      <div style="max-width: 768px; margin: 0 auto; padding: 48px 24px;">
        <h2 style="font-size: 32px; font-weight: 700; color: #FFFFFF; border-bottom: 2px solid #5EEAD4; padding-bottom: 12px; margin-bottom: 24px;">About Me</h2>
        <p style="font-size: 18px; line-height: 1.7; color: #D1D5DB;">This is a mock portfolio. Configure your API key to generate a real one. ${request.portfolioBio}</p>
      </div>
      <div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px;">
        <h2 style="text-align: center; font-size: 32px; font-weight: 700; color: #FFFFFF; margin-bottom: 48px;">My Work</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px;">
          ${projectHtml}
        </div>
      </div>
    </div>`;
};

export const generateDocument = async (request: DocumentRequest): Promise<string> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY environment variable not set. Using a mock response.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (request.docType === 'Resume') return getMockHtmlResume(request);
        if (request.docType === 'Portfolio') return getMockHtmlPortfolio(request);
        return `<div style="padding: 40px; font-family: Arial, sans-serif;"><h1>Mock Cover Letter for ${request.name}</h1><p>This is a mock response because the API key is not configured.</p></div>`;
    }

    const { docType } = request;
    
    let systemInstruction;
    let userPrompt;
    
    switch (docType) {
        case 'Portfolio':
            systemInstruction = getPortfolioSystemInstruction(request);
            userPrompt = `
**TASK:** Based on the user details below, generate the full HTML for the Portfolio by populating the template provided in the system instructions. You MUST use the provided Base64 strings for images and create project cards for all projects listed.

**USER DETAILS:**
- **Name:** ${request.name}
- **Tagline/Title:** ${request.targetJob}
- **Profile Picture:** ${request.profilePicture ? 'Provided' : 'Not Provided'}
- **Bio:** ${request.portfolioBio}
- **Projects List:** ${JSON.stringify(request.portfolioProjects)}
- **Contact Info:** ${request.contact}
- **Social Links:** ${request.portfolioSocialLinks}
- **Template:** ${request.portfolioTemplate}

Produce only the HTML content as requested.`.trim();
            break;

        case 'Cover Letter':
            systemInstruction = getCoverLetterSystemInstruction(request);
            userPrompt = `
**TASK:** Based on the user details below, generate the full HTML for the Cover Letter.
**USER DETAILS:**
- **Name:** ${request.name}
- **Contact:** ${request.contact}
- **Target Job:** ${request.targetJob}
- **Target Company:** ${request.targetCompany}
- **Relevant Experience/Skills:** ${request.experience}
Produce only the HTML content as requested.`.trim();
            break;

        case 'Resume':
        default:
            systemInstruction = getResumeSystemInstruction(request);
            userPrompt = `
**TASK:** Based on the user details below, generate the full HTML for the ${docType} by populating the template provided in the system instructions.

**USER DETAILS:**
- **Work Experience:** ${request.experience}
- **Education:** ${request.education}
- **Skills:** ${request.skills}
- **Target Job Title:** ${request.targetJob}
- **Target Company:** ${request.targetCompany}
- **Template:** ${request.resumeTemplate}
- **Profile Picture:** ${request.profilePicture ? 'Provided' : 'Not Provided'}

Produce only the HTML content as requested.`.trim();
            break;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
