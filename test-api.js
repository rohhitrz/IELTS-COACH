// Test the production API endpoints
const API_BASE = 'https://ielts-coach-l4xu2il3v-rohits-projects-f028bcc9.vercel.app';

async function testAPI() {
    console.log('Testing production API...');
    
    try {
        const response = await fetch(`${API_BASE}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testType: 'writing' }),
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response:', result);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAPI();