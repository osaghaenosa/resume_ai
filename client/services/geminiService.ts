
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
    
    // Enhanced theme properties with more detailed styling
    const themes: { [key: string]: any } = {
        onyx: { 
            primary: '#5EEAD4', 
            bg: '#111827', 
            text: '#D1D5DB', 
            cardBg: '#1F2937', 
            font: "'Inter', sans-serif",
            secondary: '#374151',
            accent: '#10B981',
            shadow: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px'
        },
        quartz: { 
            primary: '#2563EB', 
            bg: '#FFFFFF', 
            text: '#333333', 
            cardBg: '#F9FAFB', 
            font: "'Georgia', serif",
            secondary: '#F3F4F6',
            accent: '#1D4ED8',
            shadow: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
        },
        sapphire: { 
            primary: '#4F46E5', 
            bg: '#F0F4F8', 
            text: '#1E293B', 
            cardBg: '#FFFFFF', 
            font: "'Poppins', sans-serif",
            secondary: '#E2E8F0',
            accent: '#3730A3',
            shadow: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '10px'
        },
        emerald: { 
            primary: '#81B29A', 
            bg: '#F5F5F5', 
            text: '#3D405B', 
            cardBg: '#FFFFFF', 
            font: "'Lato', sans-serif",
            secondary: '#E8F5E8',
            accent: '#059669',
            shadow: 'rgba(129, 178, 154, 0.2)',
            borderRadius: '15px'
        },
        ruby: { 
            primary: '#9A1750', 
            bg: '#1a1a1a', 
            text: '#EAEAEA', 
            cardBg: '#222222', 
            font: "'Cormorant Garamond', serif",
            secondary: '#2D2D2D',
            accent: '#BE185D',
            shadow: 'rgba(154, 23, 80, 0.3)',
            borderRadius: '6px'
        },
        // New themes
        diamond: {
            primary: '#06B6D4',
            bg: '#F8FAFC',
            text: '#0F172A',
            cardBg: '#FFFFFF',
            font: "'Nunito Sans', sans-serif",
            secondary: '#E2E8F0',
            accent: '#0891B2',
            shadow: 'rgba(6, 182, 212, 0.15)',
            borderRadius: '16px'
        },
        obsidian: {
            primary: '#F59E0B',
            bg: '#0C0C0C',
            text: '#F3F4F6',
            cardBg: '#1C1C1C',
            font: "'JetBrains Mono', monospace",
            secondary: '#262626',
            accent: '#F97316',
            shadow: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '4px'
        }
    };
    
    const themeKey = portfolioTemplate.split('-')[0] as keyof typeof themes;
    const theme = themes[themeKey] || themes.onyx;

    // Enhanced system instruction with better structure and more detailed requirements
    return `
**ROLE & GOAL:** You are an expert frontend developer building a sophisticated, single-file, interactive portfolio website using only HTML, CSS, and vanilla JavaScript. The final output must be a single, self-contained HTML document that functions as a Single Page Application (SPA) with modern design principles and excellent user experience.

**CRITICAL REQUIREMENTS:**

### 1. FILE STRUCTURE & ARCHITECTURE
- **SINGLE FILE SPA:** The entire output MUST be one HTML file with hash-based routing
- **HTML STRUCTURE:** Must include proper DOCTYPE, semantic HTML5 elements, and accessibility features
- **HEAD SECTION:** Include title, meta tags, Google Fonts import, and conditional scripts
- **BODY SECTION:** Single root element \`<div id="app-root"></div>\` for SPA rendering
- **SCRIPT ORGANIZATION:** All JavaScript logic in a single script tag with proper module organization

### 2. ENHANCED CSS REQUIREMENTS
All styling MUST be inside the \`<style>\` tag and follow these guidelines:
- **Theme Consistency:** Strictly follow the **'${portfolioTemplate}'** theme aesthetic
- **Color Palette:**
  - Primary: ${theme.primary}
  - Background: ${theme.bg}
  - Text: ${theme.text}
  - Card Background: ${theme.cardBg}
  - Secondary: ${theme.secondary}
  - Accent: ${theme.accent}
- **Typography:** Use ${theme.font} with proper font weights and sizes
- **Design Elements:**
  - Border Radius: ${theme.borderRadius}
  - Box Shadows: ${theme.shadow}
  - Smooth transitions and hover effects
  - Responsive design with mobile-first approach
- **Modern CSS Features:**
  - CSS Grid and Flexbox for layouts
  - CSS Custom Properties (variables)
  - Smooth animations and micro-interactions
  - Progressive enhancement

### 3. ENHANCED JAVASCRIPT ARCHITECTURE
Create a well-structured SPA with these components:

\`\`\`javascript
// State Management
const state = {
    user: {...}, // User data from request
    projects: [...], // Portfolio projects
    products: [...], // Products for sale
    cart: [], // Shopping cart items
    currentPage: 'home',
    loading: false,
    error: null
};

// Router with better error handling
const router = () => {
    // Hash-based routing logic
    // Error boundaries for failed routes
    // Loading states
};

// Component system
const components = {
    navbar: () => { /* Enhanced navbar with active states */ },
    hero: () => { /* Hero section with animations */ },
    projectCard: (project) => { /* Project card component */ },
    productCard: (product) => { /* Product card component */ },
    footer: () => { /* Footer component */ }
};

// Page renderers with better UX
const pages = {
    home: () => { /* Home page with smooth scrolling sections */ },
    product: (id) => { /* Product detail with image gallery */ },
    checkout: () => { /* Enhanced checkout with validation */ },
    notFound: () => { /* 404 page with helpful navigation */ }
};
\`\`\`

### 4. ENHANCED FEATURES & FUNCTIONALITY
- **Navigation:** Smooth scrolling, sticky header, mobile hamburger menu
- **Image Handling:** Lazy loading, proper alt texts, responsive images
- **Cart System:** Local state management, quantity controls, total calculations
- **Payment Integration:** Enhanced UI for all payment methods
- **Form Validation:** Client-side validation with user feedback
- **Error Handling:** Graceful error states and user feedback
- **Performance:** Optimized rendering and minimal reflows

### 5. ACCESSIBILITY & SEO
- **Semantic HTML:** Proper heading hierarchy, landmarks, and ARIA labels
- **Keyboard Navigation:** Tab order, focus management, keyboard shortcuts
- **Screen Reader Support:** Descriptive text, skip links, live regions
- **Meta Tags:** Proper Open Graph and Twitter Card tags
- **Performance:** Fast loading, optimized images, minimal JavaScript

### 6. RESPONSIVE DESIGN BREAKPOINTS
\`\`\`css
/* Mobile First Approach */
/* Base styles: 320px+ */
@media (min-width: 480px) { /* Small tablets */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 1024px) { /* Desktops */ }
@media (min-width: 1440px) { /* Large screens */ }
\`\`\`

### 7. ENHANCED PAYMENT HANDLING
Implement sophisticated payment UI based on \`product.paymentMethod\`:
- **'link':** Styled call-to-action buttons with security indicators
- **'bank':** Formatted bank details with copy-to-clipboard functionality
- **'flutterwave':** Professional payment modal with proper error handling
- **Cart system:** Quantity management, total calculations, tax handling

### 8. IMAGE OPTIMIZATION
- Use provided placeholders: \`{{PROFILE_PICTURE}}\`, \`{{PROJECT_IMAGE_id}}\`, \`{{PRODUCT_IMAGE_id}}\`
- Implement lazy loading and proper aspect ratios
- Add loading states and error fallbacks

### 9. THEME-SPECIFIC ENHANCEMENTS
Based on the **${themeKey}** theme, implement:
- Theme-appropriate animations and transitions
- Consistent visual hierarchy and spacing
- Brand-aligned iconography and graphics
- Theme-specific interactive elements

**OUTPUT REQUIREMENTS:**
Generate a complete, single HTML file that:
1. Starts with \`<!DOCTYPE html>\`
2. Is fully functional without external dependencies (except Google Fonts and payment scripts)
3. Provides excellent user experience across all devices
4. Follows modern web development best practices
5. Is production-ready and performant

**QUALITY STANDARDS:**
- Clean, maintainable code structure
- Consistent naming conventions
- Comprehensive error handling
- Smooth user interactions
- Professional visual design
- Accessible to all users
`;
};

// Enhanced error handling and validation
const validateDocumentRequest = (request: DocumentRequest): string[] => {
    const errors: string[] = [];
    
    if (!request.name?.trim()) {
        errors.push("Name is required");
    }
    
    if (!request.contact?.trim()) {
        errors.push("Contact information is required");
    }
    
    if (request.docType === 'Portfolio') {
        if (!request.portfolioBio?.trim()) {
            errors.push("Portfolio bio is required");
        }
        
        if (request.products?.length) {
            request.products.forEach((product, index) => {
                if (!product.title?.trim()) {
                    errors.push(`Product ${index + 1}: Title is required`);
                }
                if (!product.price || product.price <= 0) {
                    errors.push(`Product ${index + 1}: Valid price is required`);
                }
            });
        }
    }
    
    return errors;
};


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
