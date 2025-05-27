const express = require('express');
const cors = require('cors');
const { WebSocket } = require('ws');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;

// In-memory storage for MVP (use database in production)
const agents = {
  'demo-agent': {
    elevenlabsAgentId: 'agent_01jvg9443reddrc38gye4jhfvr', // Your ElevenLabs agent ID
    name: 'Demo Assistant',
    config: {
      firstMessage: 'Hi! How can I help you today?',
      systemPrompt: 'You are a helpful assistant.',
      tools: ['get_time', 'get_weather']
    }
  }
};

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve widget files

// Get agent configuration
app.get('/api/agent/:agentId', (req, res) => {
  const agent = agents[req.params.agentId];
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

// Proxy WebSocket connection to ElevenLabs
app.post('/api/agent/:agentId/connect', async (req, res) => {
  const agent = agents[req.params.agentId];
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // In production, create WebSocket connection to ElevenLabs here
  // For now, return connection info
  res.json({
    wsUrl: `ws://localhost:${PORT}/ws/${req.params.agentId}`,
    agentConfig: agent.config
  });
});

// Serve the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Simple WebSocket proxy (simplified for MVP)
const server = require('http').createServer(app);
const wss = new (require('ws').WebSocketServer)({ server });

wss.on('connection', (ws, req) => {
  console.log('Widget connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Here you would forward to ElevenLabs WebSocket
      // For demo, echo back with a more realistic response
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'response',
          message: `I heard you say: "${data.message}". This is a demo response from your AI assistant!`
        }));
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Widget disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Middleware server running on http://localhost:${PORT}`);
  console.log(`📝 Test page available at http://localhost:${PORT}`);
  console.log(`🎤 Widget script at http://localhost:${PORT}/widget.js`);
});