# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Google Gemini API key

### Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     - Name: `GEMINI_API_KEY`
     - Value: Your Google Gemini API key
     - Environment: Production, Preview, Development

3. **Deploy**
   - Vercel will automatically detect the configuration
   - The build will create:
     - Static frontend assets
     - Serverless API functions at `/api/generate` and `/api/evaluate`

### Verification

After deployment:

1. **Check Frontend**: Visit your Vercel URL - the app should load without API key errors
2. **Check API Security**: 
   - View page source - no API keys should be visible
   - Check browser dev tools - no API keys in JavaScript bundles
3. **Test Functionality**: Generate a test to verify API endpoints work

### Environment Variables

- `GEMINI_API_KEY`: Server-side only, used by API functions
- No client-side environment variables needed

### Security Features

✅ API key stored server-side only  
✅ No sensitive data in client bundle  
✅ All AI operations through secure endpoints  
✅ CORS protection via Vercel functions  

### Troubleshooting

- **API errors**: Check Vercel function logs for environment variable issues
- **Build failures**: Ensure all dependencies are correctly specified in `api/package.json`
- **CORS issues**: API functions automatically handle CORS for same-origin requests