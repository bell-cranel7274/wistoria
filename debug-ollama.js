// Debug script to test Ollama connection directly

const OLLAMA_URL = 'http://127.0.0.1:11434';

async function testOllamaDirectly() {
  console.log('🔍 Testing direct Ollama connection...\n');
  
  try {
    // Test 1: Check if Ollama is running
    console.log('1. Testing Ollama health...');
    try {
      const healthResponse = await fetch(`${OLLAMA_URL}/api/tags`);
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log('✅ Ollama is running');
        console.log('Available models:', data.models.map(m => m.name));
      } else {
        console.log('❌ Ollama health check failed:', healthResponse.status);
        return;
      }
    } catch (error) {
      console.log('❌ Ollama health check failed:', error.message);
      return;
    }

    // Test 2: Try different API endpoints
    console.log('\n2. Testing /api/generate endpoint...');
    try {
      const generateResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemma3:latest',
          prompt: 'Hello! Just testing.',
          stream: false
        })
      });
      
      if (generateResponse.ok) {
        const data = await generateResponse.json();
        console.log('✅ /api/generate works');
        console.log('Response:', data.response);
      } else {
        console.log('❌ /api/generate failed:', generateResponse.status);
        const errorText = await generateResponse.text();
        console.log('Error details:', errorText);
      }
    } catch (error) {
      console.log('❌ /api/generate failed:', error.message);
    }

    // Test 3: Try /api/chat endpoint
    console.log('\n3. Testing /api/chat endpoint...');
    try {
      const chatResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemma3:latest',
          messages: [
            {
              role: 'user',
              content: 'Hello! Just testing.'
            }
          ],
          stream: false
        })
      });
      
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        console.log('✅ /api/chat works');
        console.log('Response:', data.message.content);
      } else {
        console.log('❌ /api/chat failed:', chatResponse.status);
        const errorText = await chatResponse.text();
        console.log('Error details:', errorText);
      }
    } catch (error) {
      console.log('❌ /api/chat failed:', error.message);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

// Run the test
testOllamaDirectly();
