
# StudyFlow AI Platform

A comprehensive React toolkit for students, combining powerful PDF manipulation with generative AI analysis.

## Features
- **PDF Toolkit**: Merge, Split, and Compress files locally.
- **AI OCR**: Extract text from images and documents using Gemini 1.5 Pro.
- **AI Student Studio**: Chat-based tutor to summarize, explain, and quiz you on uploaded materials.
- **Jobs System**: Real-time background job status for processing multiple tasks.

## Run Instructions
1. Ensure you have Node.js 18+ installed.
2. Clone this repository or download the files.
3. Install dependencies: `npm install` (requires `@google/genai`, `react-router-dom`, `lucide-react` or material icons).
4. Create a `.env` file in the root directory and add:
   `GEMINI_API_KEY=your_actual_key_here`
5. Start the development server: `npm start`.

## Security Note
This application uses the Google Gemini API. In this demonstration, the client-side `geminiService.ts` interacts directly with the SDK. For production deployments, these calls should be proxied through a secure backend to prevent leaking the API key to the client browser.
