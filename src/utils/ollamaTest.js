// Test utility to verify Ollama API integration
export const testOllamaConnection = async () => {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔄 Testing Ollama API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test models endpoint
    const modelsResponse = await fetch(`${baseUrl}/api/models`);
    if (!modelsResponse.ok) {
      throw new Error(`Models fetch failed: ${modelsResponse.status}`);
    }
    const modelsData = await modelsResponse.json();
    console.log('✅ Models fetched:', modelsData);
    
    // Test chat endpoint with a simple message
    console.log('🔄 Testing chat endpoint...');
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Can you respond with a simple greeting?',
        model: modelsData.models?.[0]?.name || 'llama2'
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat failed: ${chatResponse.status}`);
    }
    
    // Read the streaming response
    const reader = chatResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullResponse += chunk;
    }
    
    console.log('✅ Chat test completed. Response:', fullResponse.substring(0, 100) + '...');
    
    return {
      success: true,
      health: healthData,
      models: modelsData,
      testResponse: fullResponse
    };
    
  } catch (error) {
    console.error('❌ Ollama API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to display connection instructions
export const showConnectionInstructions = () => {
  console.log(`
🚀 Ollama Chat Integration Setup Instructions:

1. Make sure Ollama is installed and running:
   - Download from: https://ollama.ai/
   - Run: ollama serve (starts on port 11434)

2. Start the Ollama Chat Server:
   - The integration document shows it should run on localhost:5000
   - Make sure the server is configured with CORS enabled

3. Available Models:
   - The system will automatically fetch available models
   - Default model: llama2
   - You can change models in the chat settings

4. Chat Features:
   - 💬 Real-time streaming responses
   - 🔄 Connection status indicator  
   - 📝 Persistent chat history
   - ⚙️ Model selection
   - 🗑️ Clear chat history

5. Usage:
   - Click the chat icon in the top navigation
   - Type your message and press Enter
   - Watch the AI respond in real-time!

🔧 Troubleshooting:
   - Red indicator = Server disconnected
   - Green indicator = Connected and ready
   - Check browser console for detailed error messages
  `);
};

export default {
  testOllamaConnection,
  showConnectionInstructions
};
