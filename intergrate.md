
# Ollama Chat Server API: Quick Integration Guide

This guide shows how to connect any web application (React, Vue, Angular, plain JS, etc.) to the Ollama Chat Server at `http://localhost:5000`.

---

## 1. List Available AI Models

- **Endpoint:** `GET /api/models`
- **Returns:** Array of model objects (e.g., `[ { name: "llama2" }, ... ]`)

**Example:**
```js
fetch('http://localhost:5000/api/models')
  .then(res => res.json())
  .then(data => console.log(data.models));
```

---

## 2. Send a Chat Message (Streaming Response)

- **Endpoint:** `POST /api/chat`
- **Body:**
  ```json
  {
    "message": "Your question here",
    "model": "llama2" // optional, defaults to "llama2"
  }
  ```
- **Response:** Plain text stream (tokens as they are generated)

**Example (JavaScript):**
```js
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, AI!', model: 'llama2' })
})
.then(res => {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  function read() {
    reader.read().then(({ done, value }) => {
      if (done) {
        console.log('AI response:', result);
        return;
      }
      result += decoder.decode(value);
      read();
    });
  }
  read();
});
```

---

## 3. Health Check

- **Endpoint:** `GET /api/health`
- **Returns:** Server status and timestamp

**Example:**
```js
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Integration Tips

- CORS is enabled: You can call these APIs from any frontend (localhost:3000, etc.).
- For chat, handle the streamed response as shown above.
- Make sure both the server and Ollama are running locally.

---

**With these endpoints, you can build a chat UI that lists models, sends messages, and displays AI responses in real time.**
