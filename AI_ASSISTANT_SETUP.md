# CareerSync AI - AI Assistant Feature Setup Guide

## Overview
The AI Assistant page provides three powerful features:
1. **CV Analysis** - Analyzes CVs and provides feedback, optionally comparing against job descriptions
2. **Cover Letter Generator** - Creates tailored cover letters based on job details
3. **Job Description Generator** - Creates comprehensive job descriptions for posting

## Setup Instructions

### Step 1: Install OpenAI Package
Navigate to the server directory and install the OpenAI package:

```bash
cd server
npm install openai
```

### Step 2: Configure OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create a `.env` file in the server directory (or copy from `.env.example`)
3. Add your OpenAI API key:

```env
OPENAI_API_KEY=sk_your_actual_api_key_here
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Step 3: Restart the Server
If the server is running, restart it to load the new environment variables:

```bash
# In server directory
npm run dev
```

### Step 4: Access the AI Assistant
1. Navigate to http://localhost:5173 (or your app URL)
2. Login to your account
3. Click "AI Assistant" in the navbar or navigate to `/ai`

## Features

### CV Analysis
- **Input**: Paste your CV content
- **Optional**: Provide a job description for role-specific analysis
- **Output**: AI-powered feedback including:
  - Key strengths
  - Areas for improvement
  - Match percentage (if job description provided)
  - Top 3 action items

### Cover Letter Generator
- **Inputs**: 
  - Job title and company name (required)
  - Job description (optional)
  - Key qualifications from CV (optional)
  - Tone preference (professional, friendly, formal, creative)
- **Output**: Ready-to-use cover letter (250-350 words)

### Job Description Generator
- **Inputs**:
  - Job title and company name (required)
  - Department (optional)
  - Seniority level (optional)
  - Key responsibilities (optional)
- **Output**: Comprehensive job description including:
  - Job summary
  - Key responsibilities (5-7 items)
  - Required qualifications
  - Preferred qualifications
  - Skills & competencies
  - What we offer

## API Endpoints

### POST /api/ai/analyze-cv
Analyzes a CV with optional job description context.

**Request:**
```json
{
  "cvText": "string - CV content",
  "jobDescription": "string - optional job description"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "string - AI-generated analysis"
}
```

### POST /api/ai/generate-cover-letter
Generates a tailored cover letter.

**Request:**
```json
{
  "jobTitle": "string",
  "companyName": "string",
  "jobDescription": "string - optional",
  "cvHighlights": "string - optional",
  "tone": "professional|friendly|formal|creative"
}
```

**Response:**
```json
{
  "success": true,
  "coverLetter": "string - complete cover letter"
}
```

### POST /api/ai/generate-job-description
Generates a comprehensive job description.

**Request:**
```json
{
  "jobTitle": "string",
  "companyName": "string",
  "department": "string - optional",
  "seniority": "string - optional",
  "keyResponsibilities": "string - optional"
}
```

**Response:**
```json
{
  "success": true,
  "jobDescription": "string - complete job description"
}
```

## Authentication
All AI endpoints require authentication. Users must be logged in to access the AI Assistant features.

## Error Handling
- Missing required fields return 400 Bad Request
- Authentication failures return 401 Unauthorized
- OpenAI API errors return 500 Internal Server Error with descriptive message

## Rate Limiting
Consider implementing rate limiting in production to manage API costs:
- Limit requests per user/hour
- Cache recent analyses to avoid duplicate API calls
- Implement user quotas if desired

## Cost Considerations
- Each AI request uses OpenAI's API, which incurs costs
- GPT-4 is more capable but more expensive than GPT-3.5
- Consider implementing usage tracking and limits
- Average cost per request: $0.02-0.10 depending on input/output size

## Frontend Files Modified/Created
- `/client/src/pages/AIAssistant.tsx` - Main AI page component
- `/client/src/services/aiService.ts` - API service helpers
- `/client/src/routes/AppRoutes.tsx` - Added /ai route
- `/client/src/components/Navbar.tsx` - Added AI Assistant link
- `/client/src/index.css` - Added AI styling

## Backend Files Modified/Created
- `/server/controllers/aiController.js` - AI request handlers
- `/server/routes/aiRoutes.js` - AI API routes
- `/server/server.js` - Registered AI routes
- `/server/package.json` - Added openai dependency
- `/server/.env.example` - Configuration template

## Troubleshooting

### "OPENAI_API_KEY is not set"
- Check that .env file exists in the server directory
- Verify API key is correctly set
- Restart the server after adding .env

### "Cannot POST /api/ai/..."
- Check that aiRoutes are properly imported in server.js
- Verify server has restarted
- Check network tab in browser for actual error message

### Slow responses
- OpenAI API can take 2-10 seconds depending on load
- Ensure timeout in frontend is sufficient (currently set to reasonable defaults)
- Consider showing loading indicators

## Future Enhancements
- Add prompt templates for different industries
- Implement history/favorites system
- Add batch processing for multiple CVs
- Implement cost tracking dashboard
- Add support for other AI models
- Integrate with document parsing for PDF/image uploads
- Add email export functionality
