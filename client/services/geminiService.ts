
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { DocumentRequest, PortfolioProject, ResumeTemplate, Product, ResumeAnalysis, JobPosting, AnalysisResult, GroundingSource } from '../types';

const getApiKey = (): string | null => {
    try {
        if (process.env.API_KEY && process.env.API_KEY !== "placeholder_api_key") {
            return process.env.API_KEY;
        }
    } catch (e) {
        // process.env is not available in the browser, which is expected.
    }
    return null;
}

const getImageDataFromStorage = (imageId: string): string | null => {
    const IMAGES_DB_KEY = 'aiResumeGenImages';
    try {
        const imagesJson = localStorage.getItem(IMAGES_DB_KEY);
        if (!imagesJson) return null;
        const imagesDb = JSON.parse(imagesJson);
        return imagesDb[imageId] || null;
    } catch (e) {
        console.error("Error reading from image storage", e);
        return null;
    }
};


// --- FONT & COLOR HELPERS ---
const FONTS = ["'Lato', sans-serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Montserrat', sans-serif", "'Merriweather', serif", "'Playfair Display', serif", "'Source Sans Pro', sans-serif", "'Raleway', sans-serif", "'PT Sans', sans-serif", "'Lora', serif"];
const PALETTES = [
    { primary: '#0d6efd', bg: '#f8f9fa', text: '#212529', border: '#dee2e6', subtle: '#e9ecef', secondaryText: '#6c757d' }, // Blue
    { primary: '#198754', bg: '#f2f9f5', text: '#0c2e1e', border: '#d4e9e2', subtle: '#e1f0e9', secondaryText: '#4e6e5e' }, // Green
    { primary: '#6f42c1', bg: '#f6f3f9', text: '#2a1a4a', border: '#e3d9f1', subtle: '#f0ebf7', secondaryText: '#6a5a88' }, // Purple
    { primary: '#d63384', bg: '#fbeef3', text: '#4e1230', border: '#f3d7e5', subtle: '#f9e6ef', secondaryText: '#8f5c76' }, // Pink
    { primary: '#fd7e14', bg: '#fff8f2', text: '#4d2605', border: '#feeada', subtle: '#fff0e5', secondaryText: '#996f4e' }, // Orange
    { primary: '#20c997', bg: '#f2faf8', text: '#0a3d2c', border: '#d2ede4', subtle: '#e0f5ee', secondaryText: '#558778' }, // Teal
    { primary: '#dc3545', bg: '#fef3f4', text: '#52141a', border: '#f8d7da', subtle: '#fce8ea', secondaryText: '#9f5b61' }, // Red
    { primary: '#0dcaf0', bg: '#f2fafc', text: '#053e49', border: '#d2eef5', subtle: '#e0f5fa', secondaryText: '#508998' }, // Cyan
    { primary: '#6c757d', bg: '#f8f9fa', text: '#212529', border: '#dee2e6', subtle: '#e9ecef', secondaryText: '#495057' }, // Gray
    { primary: '#343a40', bg: '#f8f9fa', text: '#212529', border: '#dee2e6', subtle: '#e9ecef', secondaryText: '#495057' }, // Dark
];

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

// --- START GENERATED RESUME TEMPLATES ---
const createClassicVariant = (font: string, p: typeof PALETTES[0]) => (request: DocumentRequest) => `
<div style="font-family: ${font}; margin: 0 auto; max-width: 800px; background-color: ${p.bg}; color: ${p.text}; padding: 40px; border: 1px solid ${p.border};">
  <div style="text-align: center; border-bottom: 2px solid ${p.primary}; padding-bottom: 15px; margin-bottom: 25px;">
    <h1 style="font-size: 32px; margin: 0; color: ${p.primary}; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${request.name}</h1>
    <p style="margin: 10px 0 0; font-size: 14px; color: ${p.secondaryText};">${request.contact}</p>
  </div>
  <div style="display: flex; gap: 30px;">
    <div style="width: 65%;"><h2 style="font-size: 16px; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color:${p.text}">Professional Summary</h2><p style="margin-bottom: 25px; line-height: 1.6; font-size: 14px;"><!-- summary --></p><h2 style="font-size: 16px; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color:${p.text}">Work Experience</h2><div><!-- experience --></div></div>
    <div style="width: 35%;"><h2 style="font-size: 16px; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color:${p.text}">Skills</h2><div style="margin-bottom: 25px;"><!-- skills --></div><h2 style="font-size: 16px; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color:${p.text}">Education</h2><div><!-- education --></div></div>
  </div>
</div>`;

const CLASSIC_RESUME_TEMPLATE_2 = createClassicVariant(FONTS[0], PALETTES[0]);
const CLASSIC_RESUME_TEMPLATE_3 = createClassicVariant(FONTS[1], PALETTES[1]);
const CLASSIC_RESUME_TEMPLATE_4 = createClassicVariant(FONTS[2], PALETTES[2]);
const CLASSIC_RESUME_TEMPLATE_5 = createClassicVariant(FONTS[3], PALETTES[3]);
const CLASSIC_RESUME_TEMPLATE_6 = createClassicVariant(FONTS[4], PALETTES[4]);
const CLASSIC_RESUME_TEMPLATE_7 = createClassicVariant(FONTS[5], PALETTES[5]);
const CLASSIC_RESUME_TEMPLATE_8 = createClassicVariant(FONTS[6], PALETTES[6]);
const CLASSIC_RESUME_TEMPLATE_9 = createClassicVariant(FONTS[7], PALETTES[7]);
const CLASSIC_RESUME_TEMPLATE_10 = createClassicVariant(FONTS[8], PALETTES[8]);
const CLASSIC_RESUME_TEMPLATE_11 = createClassicVariant(FONTS[9], PALETTES[9]);
// --- END GENERATED RESUME TEMPLATES ---

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

// --- START GENERATED MODERN TEMPLATES ---
const createModernVariant = (font: string, p: typeof PALETTES[0]) => (request: DocumentRequest) => `
<div style="font-family: ${font}; margin: 0 auto; max-width: 800px; background-color: ${p.bg}; color: ${p.text}; padding: 40px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${p.primary}; padding-bottom: 20px; margin-bottom: 30px;">
        <div><h1 style="font-size: 42px; margin: 0; color: ${p.primary}; font-weight: 300;">${request.name}</h1><p style="margin: 5px 0 0; font-size: 18px; color: ${p.secondaryText};">${request.targetJob}</p></div>
        <p style="font-size: 12px; color: ${p.secondaryText}; text-align: right; line-height: 1.5;">${(request.contact || '').split('|').join('<br>')}</p>
    </div>
    <div>
        <h2 style="font-size: 18px; color: ${p.primary}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Summary</h2>
        <p style="margin-bottom: 30px; line-height: 1.6; font-size: 15px;"><!-- summary --></p>
        <h2 style="font-size: 18px; color: ${p.primary}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Experience</h2>
        <div style="margin-bottom: 30px;"><!-- experience --></div>
        <h2 style="font-size: 18px; color: ${p.primary}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Education</h2>
        <div style="margin-bottom: 30px;"><!-- education --></div>
        <h2 style="font-size: 18px; color: ${p.primary}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 15px;">Skills</h2>
        <div><!-- skills --></div>
    </div>
</div>`;
const MODERN_RESUME_TEMPLATE_2 = createModernVariant(FONTS[0], PALETTES[0]);
const MODERN_RESUME_TEMPLATE_3 = createModernVariant(FONTS[1], PALETTES[1]);
const MODERN_RESUME_TEMPLATE_4 = createModernVariant(FONTS[2], PALETTES[2]);
const MODERN_RESUME_TEMPLATE_5 = createModernVariant(FONTS[3], PALETTES[3]);
const MODERN_RESUME_TEMPLATE_6 = createModernVariant(FONTS[4], PALETTES[4]);
const MODERN_RESUME_TEMPLATE_7 = createModernVariant(FONTS[5], PALETTES[5]);
const MODERN_RESUME_TEMPLATE_8 = createModernVariant(FONTS[6], PALETTES[6]);
const MODERN_RESUME_TEMPLATE_9 = createModernVariant(FONTS[7], PALETTES[7]);
const MODERN_RESUME_TEMPLATE_10 = createModernVariant(FONTS[8], PALETTES[8]);
const MODERN_RESUME_TEMPLATE_11 = createModernVariant(FONTS[9], PALETTES[9]);
// --- END GENERATED MODERN TEMPLATES ---


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

// --- START GENERATED SIMPLE TEMPLATES ---
const createSimpleVariant = (font: string, p: typeof PALETTES[0]) => (request: DocumentRequest) => `
<div style="font-family: ${font}; margin: 0 auto; max-width: 800px; background-color: ${p.bg}; color: ${p.text}; padding: 50px; line-height: 1.7;">
  <div style="margin-bottom: 40px;">
    <h1 style="font-size: 28px; margin: 0; font-weight: 600; color: ${p.primary};">${request.name}</h1>
    <p style="margin: 5px 0 0; font-size: 16px; color: ${p.secondaryText};">${request.contact}</p>
  </div>
  <div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${p.secondaryText}; border-bottom: 1px solid ${p.subtle}; padding-bottom: 8px; margin-bottom: 16px;">Professional Experience</h2>
    <div style="margin-bottom: 30px;"><!-- experience --></div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${p.secondaryText}; border-bottom: 1px solid ${p.subtle}; padding-bottom: 8px; margin-bottom: 16px;">Education</h2>
    <div style="margin-bottom: 30px;"><!-- education --></div>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${p.secondaryText}; border-bottom: 1px solid ${p.subtle}; padding-bottom: 8px; margin-bottom: 16px;">Skills</h2>
    <div><!-- skills --></div>
  </div>
</div>`;
const SIMPLE_RESUME_TEMPLATE_2 = createSimpleVariant(FONTS[0], PALETTES[0]);
const SIMPLE_RESUME_TEMPLATE_3 = createSimpleVariant(FONTS[1], PALETTES[1]);
const SIMPLE_RESUME_TEMPLATE_4 = createSimpleVariant(FONTS[2], PALETTES[2]);
const SIMPLE_RESUME_TEMPLATE_5 = createSimpleVariant(FONTS[3], PALETTES[3]);
const SIMPLE_RESUME_TEMPLATE_6 = createSimpleVariant(FONTS[4], PALETTES[4]);
const SIMPLE_RESUME_TEMPLATE_7 = createSimpleVariant(FONTS[5], PALETTES[5]);
const SIMPLE_RESUME_TEMPLATE_8 = createSimpleVariant(FONTS[6], PALETTES[6]);
const SIMPLE_RESUME_TEMPLATE_9 = createSimpleVariant(FONTS[7], PALETTES[7]);
const SIMPLE_RESUME_TEMPLATE_10 = createSimpleVariant(FONTS[8], PALETTES[8]);
const SIMPLE_RESUME_TEMPLATE_11 = createSimpleVariant(FONTS[9], PALETTES[9]);
// --- END GENERATED SIMPLE TEMPLATES ---

const CREATIVE_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'Lato', 'Helvetica Neue', sans-serif; margin: 0 auto; max-width: 800px; background-color: #F8F5F2; color: #333; display: flex; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
  <!-- Left Sidebar -->
  <div style="width: 33%; background-color: #1a2c3f; color: #fff; padding: 40px 30px;">
    ${request.profilePicture ? `<img src="${request.profilePicture}" alt="Profile" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 25px; display: block; border: 4px solid #c8a46e;">` : '<div style="width: 120px; height: 120px; border-radius: 50%; background-color: #c8a46e; margin: 0 auto 25px;"></div>'}
    <h2 style="font-family: 'Playfair Display', serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #c8a46e; padding-bottom: 10px; margin-bottom: 20px; color: #c8a46e;">Contact</h2>
    <div style="font-size: 13px; line-height: 1.9; word-break: break-word;">${(request.contact || '').split('|').map(item => `<div>${item.trim()}</div>`).join('')}</div>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #c8a46e; padding-bottom: 10px; margin-top: 35px; margin-bottom: 20px; color: #c8a46e;">Education</h2>
    <div style="font-size: 13px; line-height: 1.9;"><!-- Generate education --></div>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #c8a46e; padding-bottom: 10px; margin-top: 35px; margin-bottom: 20px; color: #c8a46e;">Skills</h2>
    <div style="font-size: 13px; line-height: 1.9;"><!-- Generate skills --></div>
  </div>
  <!-- Right Content -->
  <div style="width: 67%; padding: 50px 40px;">
    <div style="margin-bottom: 40px;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 48px; margin: 0; color: #1a2c3f; font-weight: 700; line-height: 1.2;">${request.name}</h1>
        <p style="font-size: 20px; margin: 8px 0 0; color: #c8a46e; font-weight: 500; font-family: 'Lato', sans-serif;">${request.targetJob}</p>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 20px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a2c3f; margin-bottom: 15px;">Summary</h2>
    <p style="font-size: 14px; line-height: 1.8; margin-bottom: 35px; color: #444;"><!-- Generate summary --></p>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 20px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a2c3f; margin-bottom: 20px;">Experience</h2>
    <div style="margin-bottom: 30px;"><!-- Generate experience --></div>
  </div>
</div>`;

// --- START GENERATED CREATIVE TEMPLATES ---
const createCreativeVariant = (font: string, p: typeof PALETTES[0]) => (request: DocumentRequest) => `
<div style="font-family: ${font}; margin: 0 auto; max-width: 800px; background-color: ${p.bg}; color: ${p.text}; display: flex; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <div style="width: 35%; background-color: ${p.primary}; color: ${p.bg}; padding: 40px;">
    ${request.profilePicture ? `<img src="${request.profilePicture}" alt="Profile" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; display: block; border: 4px solid ${p.bg};">` : `<div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${p.secondaryText}; margin: 0 auto 20px;"></div>`}
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid ${p.subtle}; padding-bottom: 10px; margin-bottom: 20px;">Contact</h2>
    <p style="font-size: 13px; line-height: 1.8; word-break: break-word;">${(request.contact || '').split('|').join('<br>')}</p>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid ${p.subtle}; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px;">Education</h2>
    <div style="font-size: 13px; line-height: 1.8;"><!-- education --></div>
  </div>
  <div style="width: 65%; padding: 40px; background-color: ${p.bg};">
    <div style="margin-bottom: 30px;">
        <h1 style="font-size: 40px; margin: 0; color: ${p.text}; font-weight: 700;">${request.name}</h1>
        <p style="font-size: 18px; margin: 5px 0 0; color: ${p.primary}; font-weight: 500;">${request.targetJob}</p>
    </div>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: ${p.text}; margin-bottom: 15px;">Summary</h2>
    <p style="font-size: 14px; line-height: 1.7; margin-bottom: 30px;"><!-- summary --></p>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: ${p.text}; margin-bottom: 15px;">Experience</h2>
    <div style="margin-bottom: 30px;"><!-- experience --></div>
    <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: ${p.text}; margin-bottom: 15px;">Skills</h2>
    <div><!-- skills --></div>
  </div>
</div>`;
const CREATIVE_RESUME_TEMPLATE_2 = createCreativeVariant(FONTS[0], PALETTES[0]);
const CREATIVE_RESUME_TEMPLATE_3 = createCreativeVariant(FONTS[1], PALETTES[1]);
const CREATIVE_RESUME_TEMPLATE_4 = createCreativeVariant(FONTS[2], PALETTES[2]);
const CREATIVE_RESUME_TEMPLATE_5 = createCreativeVariant(FONTS[3], PALETTES[3]);
const CREATIVE_RESUME_TEMPLATE_6 = createCreativeVariant(FONTS[4], PALETTES[4]);
const CREATIVE_RESUME_TEMPLATE_7 = createCreativeVariant(FONTS[5], PALETTES[5]);
const CREATIVE_RESUME_TEMPLATE_8 = createCreativeVariant(FONTS[6], PALETTES[6]);
const CREATIVE_RESUME_TEMPLATE_9 = createCreativeVariant(FONTS[7], PALETTES[7]);
const CREATIVE_RESUME_TEMPLATE_10 = createCreativeVariant(FONTS[8], PALETTES[8]);
const CREATIVE_RESUME_TEMPLATE_11 = createCreativeVariant(FONTS[9], PALETTES[9]);
// --- END GENERATED CREATIVE TEMPLATES ---


const TECHNICAL_RESUME_TEMPLATE = (request: DocumentRequest) => `
<div style="font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', monospace; margin: 0 auto; max-width: 850px; background-color: #FDFDFD; color: #333; padding: 50px; border: 1px solid #EAEAEA;">
  <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #EAEAEA; padding-bottom: 20px; margin-bottom: 30px;">
    <div>
        <h1 style="font-size: 28px; margin: 0; color: #111; font-weight: 500;">${request.name}</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: #007ACC;">${request.targetJob}</p>
    </div>
    <div style="text-align: right; font-size: 12px; color: #555; line-height: 1.6;">${(request.contact || '').split('|').map(item => `<div>${item.trim()}</div>`).join('')}</div>
  </div>
  <div>
    <h2 style="font-size: 14px; color: #007ACC; font-weight: 500; letter-spacing: 1px; margin-bottom: 15px;">SUMMARY</h2>
    <p style="font-size: 14px; line-height: 1.7; margin-bottom: 30px;"><!-- Generate summary --></p>
    
    <h2 style="font-size: 14px; color: #007ACC; font-weight: 500; letter-spacing: 1px; margin-bottom: 15px;">SKILL_MATRIX</h2>
    <div style="margin-bottom: 30px;"><!-- Generate skills grouped by category (e.g., Languages, Frameworks, Tools) in a clean, structured way --></div>

    <h2 style="font-size: 14px; color: #007ACC; font-weight: 500; letter-spacing: 1px; margin-bottom: 15px;">PROFESSIONAL_EXPERIENCE</h2>
    <div style="margin-bottom: 30px;"><!-- Generate experience --></div>

    <h2 style="font-size: 14px; color: #007ACC; font-weight: 500; letter-spacing: 1px; margin-bottom: 15px;">EDUCATION</h2>
    <div><!-- Generate education --></div>
  </div>
</div>`;

// --- START GENERATED TECHNICAL TEMPLATES ---
const createTechnicalVariant = (font: string, p: {primary: string, bg: string, text: string, border: string, secondaryText: string}) => (request: DocumentRequest) => `
<div style="font-family: ${font}, 'Courier New', monospace; margin: 0 auto; max-width: 800px; background-color: ${p.bg}; color: ${p.text}; padding: 40px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 36px; margin: 0; color: ${p.primary}; font-weight: normal;">${request.name}</h1>
    <p style="margin: 8px 0; font-size: 16px; color: ${p.primary};">/* ${request.targetJob} */</p>
    <p style="margin: 8px 0 0; font-size: 14px; color: ${p.secondaryText};">${request.contact}</p>
  </div>
  <div>
    <h2 style="font-size: 18px; color: ${p.primary}; font-weight: normal; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom: 15px;">// SUMMARY</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 30px;"><!-- summary --></p>
    <h2 style="font-size: 18px; color: ${p.primary}; font-weight: normal; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom: 15px;">// EXPERIENCE</h2>
    <div style="margin-bottom: 30px;"><!-- experience --></div>
    <h2 style="font-size: 18px; color: ${p.primary}; font-weight: normal; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom: 15px;">// SKILLS</h2>
    <div style="margin-bottom: 30px;"><!-- skills --></div>
    <h2 style="font-size: 18px; color: ${p.primary}; font-weight: normal; border-bottom: 1px solid ${p.border}; padding-bottom: 5px; margin-bottom: 15px;">// EDUCATION</h2>
    <div><!-- education --></div>
  </div>
</div>`;
const TECHNICAL_RESUME_TEMPLATE_2 = createTechnicalVariant("'Source Code Pro'", { primary: '#56b6c2', bg: '#1e1e1e', text: '#d4d4d4', border: '#444444', secondaryText: '#808080' });
const TECHNICAL_RESUME_TEMPLATE_3 = createTechnicalVariant("'Fira Code'", { primary: '#4ec9b0', bg: '#282c34', text: '#abb2bf', border: '#3b4048', secondaryText: '#5c6370' });
const TECHNICAL_RESUME_TEMPLATE_4 = createTechnicalVariant("'JetBrains Mono'", { primary: '#ffc600', bg: '#191919', text: '#e6e6e6', border: '#555555', secondaryText: '#777777' });
const TECHNICAL_RESUME_TEMPLATE_5 = createTechnicalVariant("'Inconsolata'", { primary: '#c586c0', bg: '#252526', text: '#cccccc', border: '#3e3e42', secondaryText: '#858585' });
const TECHNICAL_RESUME_TEMPLATE_6 = createTechnicalVariant("'Anonymous Pro'", { primary: '#a5c261', bg: '#002b36', text: '#839496', border: '#073642', secondaryText: '#586e75' });
const TECHNICAL_RESUME_TEMPLATE_7 = createTechnicalVariant("'Cutive Mono'", { primary: '#66d9ef', bg: '#272822', text: '#f8f8f2', border: '#75715e', secondaryText: '#888475' });
const TECHNICAL_RESUME_TEMPLATE_8 = createTechnicalVariant("'Roboto Mono'", { primary: '#eeffff', bg: '#263238', text: '#babdb6', border: '#37474f', secondaryText: '#78909c' });
const TECHNICAL_RESUME_TEMPLATE_9 = createTechnicalVariant("'Ubuntu Mono'", { primary: '#ff5555', bg: '#2d2d2d', text: '#d3d3d3', border: '#515151', secondaryText: '#777777' });
const TECHNICAL_RESUME_TEMPLATE_10 = createTechnicalVariant("'Share Tech Mono'", { primary: '#8be9fd', bg: '#282a36', text: '#f8f8f2', border: '#44475a', secondaryText: '#6272a4' });
const TECHNICAL_RESUME_TEMPLATE_11 = createTechnicalVariant("'IBM Plex Mono'", { primary: '#00e676', bg: '#1c1c1c', text: '#e0e0e0', border: '#4a4a4a', secondaryText: '#8e8e8e' });
// --- END GENERATED TECHNICAL TEMPLATES ---


const getResumeSystemInstruction = (request: DocumentRequest) => {
    const { resumeTemplate = 'classic' } = request;
    let populatedTemplate;

    switch (resumeTemplate) {
        case 'classic': populatedTemplate = CLASSIC_RESUME_TEMPLATE(request); break;
        case 'classic-2': populatedTemplate = CLASSIC_RESUME_TEMPLATE_2(request); break;
        case 'classic-3': populatedTemplate = CLASSIC_RESUME_TEMPLATE_3(request); break;
        case 'classic-4': populatedTemplate = CLASSIC_RESUME_TEMPLATE_4(request); break;
        case 'classic-5': populatedTemplate = CLASSIC_RESUME_TEMPLATE_5(request); break;
        case 'classic-6': populatedTemplate = CLASSIC_RESUME_TEMPLATE_6(request); break;
        case 'classic-7': populatedTemplate = CLASSIC_RESUME_TEMPLATE_7(request); break;
        case 'classic-8': populatedTemplate = CLASSIC_RESUME_TEMPLATE_8(request); break;
        case 'classic-9': populatedTemplate = CLASSIC_RESUME_TEMPLATE_9(request); break;
        case 'classic-10': populatedTemplate = CLASSIC_RESUME_TEMPLATE_10(request); break;
        case 'classic-11': populatedTemplate = CLASSIC_RESUME_TEMPLATE_11(request); break;
        case 'modern': populatedTemplate = MODERN_RESUME_TEMPLATE(request); break;
        case 'modern-2': populatedTemplate = MODERN_RESUME_TEMPLATE_2(request); break;
        case 'modern-3': populatedTemplate = MODERN_RESUME_TEMPLATE_3(request); break;
        case 'modern-4': populatedTemplate = MODERN_RESUME_TEMPLATE_4(request); break;
        case 'modern-5': populatedTemplate = MODERN_RESUME_TEMPLATE_5(request); break;
        case 'modern-6': populatedTemplate = MODERN_RESUME_TEMPLATE_6(request); break;
        case 'modern-7': populatedTemplate = MODERN_RESUME_TEMPLATE_7(request); break;
        case 'modern-8': populatedTemplate = MODERN_RESUME_TEMPLATE_8(request); break;
        case 'modern-9': populatedTemplate = MODERN_RESUME_TEMPLATE_9(request); break;
        case 'modern-10': populatedTemplate = MODERN_RESUME_TEMPLATE_10(request); break;
        case 'modern-11': populatedTemplate = MODERN_RESUME_TEMPLATE_11(request); break;
        case 'simple': populatedTemplate = SIMPLE_RESUME_TEMPLATE(request); break;
        case 'simple-2': populatedTemplate = SIMPLE_RESUME_TEMPLATE_2(request); break;
        case 'simple-3': populatedTemplate = SIMPLE_RESUME_TEMPLATE_3(request); break;
        case 'simple-4': populatedTemplate = SIMPLE_RESUME_TEMPLATE_4(request); break;
        case 'simple-5': populatedTemplate = SIMPLE_RESUME_TEMPLATE_5(request); break;
        case 'simple-6': populatedTemplate = SIMPLE_RESUME_TEMPLATE_6(request); break;
        case 'simple-7': populatedTemplate = SIMPLE_RESUME_TEMPLATE_7(request); break;
        case 'simple-8': populatedTemplate = SIMPLE_RESUME_TEMPLATE_8(request); break;
        case 'simple-9': populatedTemplate = SIMPLE_RESUME_TEMPLATE_9(request); break;
        case 'simple-10': populatedTemplate = SIMPLE_RESUME_TEMPLATE_10(request); break;
        case 'simple-11': populatedTemplate = SIMPLE_RESUME_TEMPLATE_11(request); break;
        case 'creative': populatedTemplate = CREATIVE_RESUME_TEMPLATE(request); break;
        case 'creative-2': populatedTemplate = CREATIVE_RESUME_TEMPLATE_2(request); break;
        case 'creative-3': populatedTemplate = CREATIVE_RESUME_TEMPLATE_3(request); break;
        case 'creative-4': populatedTemplate = CREATIVE_RESUME_TEMPLATE_4(request); break;
        case 'creative-5': populatedTemplate = CREATIVE_RESUME_TEMPLATE_5(request); break;
        case 'creative-6': populatedTemplate = CREATIVE_RESUME_TEMPLATE_6(request); break;
        case 'creative-7': populatedTemplate = CREATIVE_RESUME_TEMPLATE_7(request); break;
        case 'creative-8': populatedTemplate = CREATIVE_RESUME_TEMPLATE_8(request); break;
        case 'creative-9': populatedTemplate = CREATIVE_RESUME_TEMPLATE_9(request); break;
        case 'creative-10': populatedTemplate = CREATIVE_RESUME_TEMPLATE_10(request); break;
        case 'creative-11': populatedTemplate = CREATIVE_RESUME_TEMPLATE_11(request); break;
        case 'technical': populatedTemplate = TECHNICAL_RESUME_TEMPLATE(request); break;
        case 'technical-2': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_2(request); break;
        case 'technical-3': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_3(request); break;
        case 'technical-4': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_4(request); break;
        case 'technical-5': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_5(request); break;
        case 'technical-6': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_6(request); break;
        case 'technical-7': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_7(request); break;
        case 'technical-8': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_8(request); break;
        case 'technical-9': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_9(request); break;
        case 'technical-10': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_10(request); break;
        case 'technical-11': populatedTemplate = TECHNICAL_RESUME_TEMPLATE_11(request); break;
        default: populatedTemplate = CLASSIC_RESUME_TEMPLATE(request);
    }

    return `
**ROLE & GOAL:** You are an expert career coach and professional writer. Your goal is to create a Resume that is a single, self-contained, and professionally styled HTML document. It MUST bypass AI detection tools by using varied, natural language. It must adhere strictly to the provided HTML structure for the chosen template.

**CRITICAL INSTRUCTIONS:**
1.  **HTML ONLY:** The entire output MUST be a single HTML string. Do not use markdown like \`\`\`html or any text outside of the main \`<div>\` container.
2.  **INLINE CSS:** Use inline CSS (the 'style' attribute) for ALL styling. Do not use <style> tags.
3.  **NATURAL LANGUAGE:** Avoid robotic language and clichés. Use strong action verbs and quantify achievements with metrics where possible.
4.  **ADHERE TO TEMPLATE:** Use the exact HTML structure provided below. Populate the content within the specified divs and comments. For the 'creative' template, if a profile picture is not provided, use the placeholder div.
5.  **PROFILE PICTURE:** If a profile picture placeholder (e.g., {{PROFILE_PICTURE}}) is provided in the user details, you MUST use it as the 'src' for the <img> tag in templates that support it ('creative').

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

// --- PORTFOLIO ---

const getPortfolioSystemInstruction = (request: DocumentRequest) => {
    const { portfolioTemplate = 'onyx' } = request;
    
    // Define theme properties. This could be expanded.
    const themes: { [key: string]: any } = {
        onyx: { primary: '#5EEAD4', bg: '#111827', text: '#D1D5DB', cardBg: '#1F2937', font: "'Inter', sans-serif" },
        quartz: { primary: '#2563EB', bg: '#FFFFFF', text: '#333333', cardBg: '#F9FAFB', font: "'Georgia', serif" },
        sapphire: { primary: '#4F46E5', bg: '#F0F4F8', text: '#1E293B', cardBg: '#FFFFFF', font: "'Poppins', sans-serif" },
        emerald: { primary: '#81B29A', bg: '#F5F5F5', text: '#3D405B', cardBg: '#FFFFFF', font: "'Lato', sans-serif" },
        ruby: { primary: '#9A1750', bg: '#1a1a1a', text: '#EAEAEA', cardBg: '#222222', font: "'Cormorant Garamond', serif" },
    };
    const themeKey = portfolioTemplate.split('-')[0] as keyof typeof themes;
    const theme = themes[themeKey] || themes.onyx;

    return `
**ROLE & GOAL:** You are an expert frontend developer building a sophisticated, single-file, interactive portfolio website using only HTML, CSS, and vanilla JavaScript. The final output must be a single, self-contained HTML document that functions as a Single Page Application (SPA).

**CRITICAL REQUIREMENTS:**
1.  **SINGLE FILE SPA:** The entire output MUST be one HTML file. It will use hash-based routing (e.g., \`#/\`, \`#/product/...\`).
2.  **HTML STRUCTURE:** The file must have a \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, and \`<body>\`.
    -   The \`<head>\` must contain a \`<title>\`, a \`<style>\` tag for all CSS, and any necessary external scripts (like Flutterwave if used).
    -   The \`<body>\` must contain a single root element, e.g., \`<div id="app-root"></div>\`, where the SPA will be rendered.
    -   A \`<script>\` tag at the end of the \`<body>\` will contain ALL JavaScript logic.
3.  **CSS:** All styling MUST be inside the \`<style>\` tag. It must be professional, responsive, and strictly follow the aesthetic of the chosen **'${portfolioTemplate}'** theme. Use the provided theme guidelines below.
4.  **JAVASCRIPT LOGIC (SPA):** The main \`<script>\` tag must contain all logic for the application:
    -   **State:** Create a global \`state\` object: \`const state = { user: {...}, projects: [], products: [], cart: [] };\`. You MUST populate this state object with the user, project, and product data provided in the prompt.
    -   **Routing:** Implement a \`router\` function that reads \`window.location.hash\`. It should handle routes like \`'#/'\` (home), \`'#/product/:id'\`, and \`'#/checkout'\`.
    -   **Page Rendering:** Create functions to render each page (e.g., \`renderHomePage()\`, \`renderProductPage(id)\`, \`renderCheckoutPage()\`) into the \`#app-root\`. These functions will use the data from the \`state\` object.
    -   **Component Templates:** Use JavaScript template literals to define the HTML structure for pages and repeatable components (like product cards).
    -   **Event Handling:** Add event listeners for navigation clicks (which should change the window hash), "Add to Cart" buttons, and checkout actions.
    -   **Initial Load & Navigation:** Call the \`router\` on the \`DOMContentLoaded\` event and listen for the \`hashchange\` event to re-route and re-render the page.
5.  **PRODUCT & PAYMENT HANDLING:**
    -   On the home page, product cards must link to their detail page using a hash route (e.g., \`href="#/product/prod_123"\`).
    -   On the product detail page, display all product info. The purchase action depends on \`product.paymentMethod\`:
        -   **'link'**: Render an \`<a>\` button linking to \`product.checkoutLink\`.
        -   **'bank'**: Render the \`product.bankDetails\` in a pre-formatted, easy-to-copy block.
        -   **'flutterwave'**: Render a button that, when clicked, triggers the \`FlutterwaveCheckout\` function using the user's details and the \`product.flutterwaveKey\`. You must ensure the Flutterwave script is included in the \`<head>\` if any product uses this method.
6.  **IMAGE PLACEHOLDERS:** You MUST use the exact image placeholders provided (e.g., \`{{PROJECT_IMAGE_proj123}}\`, \`{{PRODUCT_IMAGE_prod456}}\`, \`{{PROFILE_PICTURE}}\`) in the 'src' attributes for all images. These will be replaced by the system later.
7.  **TEMPLATE-SPECIFIC IMPLEMENTATION & STYLING:**
    -   You MUST style the entire SPA according to the **${portfolioTemplate}** theme.
    -   **Theme Guidelines for '${portfolioTemplate}':**
        -   **Primary Color:** ${theme.primary}
        -   **Background Color:** ${theme.bg}
        -   **Text Color:** ${theme.text}
        -   **Card/Element Background:** ${theme.cardBg}
        -   **Font Family:** ${theme.font} (ensure you import it from Google Fonts in the <head> if needed)
        -   **General Aesthetic:** Create a design that reflects the name '${themeKey}'. For example, 'onyx' should be dark and modern; 'quartz' should be clean and light; 'ruby' should be bold and elegant.

**YOUR TASK:** Generate the complete, single HTML file for the portfolio SPA based on the user's data below and the specified '${portfolioTemplate}' theme. Do not add any commentary. The output must start with \`<!DOCTYPE html>\` and be a valid HTML file.
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
    return `
    <div style="font-family: sans-serif; padding: 40px; background-color: #111; color: #fff; text-align: center;">
        <h1 style="font-size: 2em;">Portfolio Generation is an Advanced Feature</h1>
        <p style="font-size: 1.2em; color: #ccc;">This is a mock response. The interactive portfolio with product pages is a premium feature.</p>
        <p style="margin-top: 20px;">To enable real AI generation, please set the API_KEY environment variable in your project configuration.</p>
        <p style="margin-top: 40px; font-size: 0.9em; color: #888;">Request Data Received: ${request.name}, ${request.portfolioTemplate} template.</p>
    </div>
    `;
};

export const generateDocument = async (request: DocumentRequest): Promise<string> => {
    const apiKey = getApiKey();

    // In a real app, this deep copy would be handled more robustly.
    const resolvedRequest: DocumentRequest = JSON.parse(JSON.stringify(request));
    
    // Resolve image IDs to base64 strings if not using mock data
    if (apiKey) {
        if (resolvedRequest.profilePicture && resolvedRequest.profilePicture.startsWith('img_')) {
            resolvedRequest.profilePicture = getImageDataFromStorage(resolvedRequest.profilePicture) || '';
        }
        if (resolvedRequest.portfolioProjects) {
            for (const project of resolvedRequest.portfolioProjects) {
                if (project.image && project.image.startsWith('img_')) {
                    project.image = getImageDataFromStorage(project.image) || '';
                }
            }
        }
        if (resolvedRequest.products) {
            for (const product of resolvedRequest.products) {
                if (product.image && product.image.startsWith('img_')) {
                    product.image = getImageDataFromStorage(product.image) || '';
                }
            }
        }
    }


    if (!apiKey) {
        console.warn("API_KEY environment variable not set. Using a mock response.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (request.docType === 'Resume') return getMockHtmlResume(request);
        if (request.docType === 'Portfolio') return getMockHtmlPortfolio(request);
        return `<div style="padding: 40px; font-family: Arial, sans-serif;"><h1>Mock Cover Letter for ${request.name}</h1><p>This is a mock response because the API key is not configured.</p></div>`;
    }

    const { docType } = resolvedRequest;
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        let systemInstruction;
        let userPrompt;
        const imagePlaceholderMap: { [key: string]: string } = {};
    
        switch (docType) {
            case 'Portfolio': {
                let processedProfilePicture = resolvedRequest.profilePicture;
                if (resolvedRequest.profilePicture) {
                    const placeholder = `{{PROFILE_PICTURE}}`;
                    imagePlaceholderMap[placeholder] = resolvedRequest.profilePicture;
                    processedProfilePicture = placeholder;
                }
    
                const processedProjects = (resolvedRequest.portfolioProjects || []).map(project => {
                    if (project.image) {
                        const placeholder = `{{PROJECT_IMAGE_${project.id}}}`;
                        imagePlaceholderMap[placeholder] = project.image;
                        return { ...project, image: placeholder };
                    }
                    return project;
                });
    
                const processedProducts = (resolvedRequest.products || []).map(product => {
                    if (product.image) {
                        const placeholder = `{{PRODUCT_IMAGE_${product.id}}}`;
                        imagePlaceholderMap[placeholder] = product.image;
                        return { ...product, image: placeholder };
                    }
                    return product;
                });
    
                const requestWithPlaceholders = {
                    ...resolvedRequest,
                    profilePicture: processedProfilePicture,
                    portfolioProjects: processedProjects,
                    products: processedProducts,
                };
    
                systemInstruction = getPortfolioSystemInstruction(requestWithPlaceholders);
                // We pass the full data here for the AI to embed in the script tag.
                // The image fields will contain placeholders.
                const userDataForPrompt = JSON.stringify(requestWithPlaceholders, null, 2);

                userPrompt = `
    **TASK:** Based on the user details below, generate the full HTML for the Portfolio SPA by following all rules in the system instructions.

    **USER DETAILS (JSON):**
    ${userDataForPrompt}

    Produce only the single, complete HTML file as requested.`.trim();
                break;
            }
    
            case 'Cover Letter':
                systemInstruction = getCoverLetterSystemInstruction(resolvedRequest);
                userPrompt = `
    **TASK:** Based on the user details below, generate the full HTML for the Cover Letter.
    **USER DETAILS:**
    - **Name:** ${resolvedRequest.name}
    - **Contact:** ${resolvedRequest.contact}
    - **Target Job:** ${resolvedRequest.targetJob}
    - **Target Company:** ${resolvedRequest.targetCompany}
    - **Relevant Experience/Skills:** ${resolvedRequest.experience}
    Produce only the HTML content as requested.`.trim();
                break;
    
            case 'Resume':
            default: {
                let processedRequest = { ...resolvedRequest };
                if (resolvedRequest.profilePicture) {
                    const placeholder = `{{PROFILE_PICTURE}}`;
                    imagePlaceholderMap[placeholder] = resolvedRequest.profilePicture;
                    processedRequest.profilePicture = placeholder;
                }
                systemInstruction = getResumeSystemInstruction(processedRequest);
                userPrompt = `
    **TASK:** Based on the user details below, generate the full HTML for the ${docType} by populating the template provided in the system instructions.
    
    **USER DETAILS:**
    - **Work Experience:** ${processedRequest.experience}
    - **Education:** ${processedRequest.education}
    - **Skills:** ${processedRequest.skills}
    - **Target Job Title:** ${processedRequest.targetJob}
    - **Target Company:** ${processedRequest.targetCompany}
    - **Template:** ${processedRequest.resumeTemplate}
    - **Profile Picture:** ${processedRequest.profilePicture ? processedRequest.profilePicture : 'Not Provided'}
    
    Produce only the HTML content as requested.`.trim();
                break;
            }
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        let generatedHtml = response.text;

        // Replace placeholders with actual base64 data
        for (const placeholder in imagePlaceholderMap) {
            // Escape special characters for regex
            const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            generatedHtml = generatedHtml.replace(new RegExp(escapedPlaceholder, 'g'), imagePlaceholderMap[placeholder]);
        }

        return generatedHtml;

    } catch (error) {
        console.error("Error generating document with Gemini API:", error);
         if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The configured API key is not valid. Please check your configuration.");
        }
        throw new Error("Failed to generate document. The AI service may be temporarily unavailable.");
    }
};


export const analyseResume = async (resumeText: string): Promise<AnalysisResult> => {
     const apiKey = getApiKey();
     if (!apiKey) {
        console.warn("API_KEY environment variable not set. Using a mock response for analysis.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            analysis: {
                overallFeedback: { score: 75, summary: "This is a mock analysis. The resume shows good potential but could be improved by setting a valid API key." },
                strengths: ["Clear structure.", "Good use of action verbs."],
                weaknesses: ["Lacks quantifiable achievements."],
                corrections: [{ original: "Moked analysis", suggestion: "Mocked analysis", explanation: "Typo." }],
                aiContentScore: { probability: 50, explanation: "The analysis is mocked." },
                recommendedRoles: ["Mock Role 1", "Mock Role 2"]
            },
            jobs: [{
                title: "Mock Job: Software Engineer",
                company: "MockCorp",
                description: "Develop mock features for a mock application.",
                requirements: "Experience with mock data and APIs.",
                datePosted: "Just now",
                url: "#"
            }],
            sources: [{ title: "Mock Source", uri: "#"}]
        };
    }
    const ai = new GoogleGenAI({ apiKey });

    // Step 1: Get the detailed analysis
    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            overallFeedback: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.INTEGER, description: "Overall score from 0-100." },
                    summary: { type: Type.STRING, description: "A brief summary of the feedback." }
                }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strengths." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of weaknesses." },
            corrections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        original: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    }
                }
            },
            aiContentScore: {
                type: Type.OBJECT,
                properties: {
                    probability: { type: Type.INTEGER, description: "Probability (0-100) it was AI-written." },
                    explanation: { type: Type.STRING, description: "Reasoning for the score." }
                }
            },
            recommendedRoles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of suitable job roles." }
        }
    };

    const analysisResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyse the following resume text: \n\n${resumeText}`,
        config: {
            systemInstruction: "You are a world-class resume reviewer. Provide a detailed, constructive critique based on the provided text. Adhere strictly to the JSON schema.",
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        }
    });

    const analysis: ResumeAnalysis = JSON.parse(analysisResponse.text);

    // Step 2: Search for jobs based on recommended roles
    if (!analysis.recommendedRoles || analysis.recommendedRoles.length === 0) {
        return { analysis, jobs: [], sources: [] };
    }
    const rolesString = analysis.recommendedRoles.slice(0, 3).join(', '); // Use top 3 roles for search query

    const jobSearchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find 5 recent job postings in the US for a ${rolesString}. For each job, provide title, company, a short description, key requirements, and posting date. Format EACH job strictly as: '[JOB_START]Title: [title]|Company: [company]|Description: [desc]|Requirements: [reqs]|Date: [date][JOB_END]'`,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const jobText = jobSearchResponse.text;
    const sources = (jobSearchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web) || []).filter(s => s) as GroundingSource[];
    
    // Step 3: Parse the job search results
    const jobs: JobPosting[] = [];
    const jobSegments = jobText.split('[JOB_START]').slice(1);

    for (const segment of jobSegments) {
        const jobData = segment.split('[JOB_END]')[0];
        const parts = jobData.split('|').reduce((acc, part) => {
            const [key, ...value] = part.split(':');
            if(key && value.length > 0) {
                acc[key.trim().toLowerCase()] = value.join(':').trim();
            }
            return acc;
        }, {} as Record<string, string>);

        if(parts.title) {
            jobs.push({
                title: parts.title,
                company: parts.company || 'N/A',
                description: parts.description || 'N/A',
                requirements: parts.requirements || 'N/A',
                datePosted: parts.date || 'N/A',
                url: '#' // Placeholder URL
            });
        }
    }
    
    // Attempt to match jobs to sources if possible (simple matching)
    for (let i = 0; i < jobs.length; i++) {
        if (sources[i]) {
            jobs[i].url = sources[i].uri;
        }
    }

    return { analysis, jobs, sources };
};
