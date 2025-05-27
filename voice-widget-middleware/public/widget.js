(function() {
  'use strict';

  // Configuration from script tag attributes
  const script = document.currentScript;
  const config = {
    agentId: script.getAttribute('data-agent-id') || 'demo-agent',
    apiUrl: script.getAttribute('data-api-url') || 'http://localhost:3001',
    position: script.getAttribute('data-position') || 'bottom-right'
  };

  let isOpen = false;
  let ws = null;
  let mediaRecorder = null;
  let audioChunks = [];

  // Create widget HTML
  function createWidget() {
    const widgetHtml = `
      <div id="voice-widget" style="
        position: fixed;
        ${config.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
        ${config.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      ">
        <!-- Main floating button container -->
        <div id="widget-container" style="
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 50px;
          padding: 8px 20px 8px 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 200px;
        ">
          <!-- Voice button -->
          <div id="widget-button" style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          ">
            <!-- Phone icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="transition: all 0.3s ease;">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
          
          <!-- Text label -->
          <div style="
            color: #1a1a1a;
            font-weight: 600;
            font-size: 15px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          ">
            VOICE CHAT
          </div>
          
          <!-- Status indicator -->
          <div id="status-dot" style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            margin-left: auto;
            transition: all 0.3s ease;
          "></div>
        </div>
        
        <!-- Chat panel -->
        <div id="widget-panel" style="
          position: absolute;
          ${config.position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
          ${config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
          width: 380px;
          height: 500px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(10px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <!-- Header -->
          <div style="
            padding: 20px 24px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
            ">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">Voice Assistant</div>
                <div id="connection-status" style="font-size: 12px; opacity: 0.8;">Connected</div>
              </div>
            </div>
            <button id="close-widget" style="
              background: none;
              border: none;
              color: white;
              font-size: 24px;
              cursor: pointer;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            ">×</button>
          </div>
          
          <!-- Messages area -->
          <div id="chat-messages" style="
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: transparent;
            display: flex;
            flex-direction: column;
            gap: 16px;
          ">
            <div style="
              color: #6b7280;
              text-align: center;
              margin-top: 60px;
              font-size: 15px;
              line-height: 1.5;
            ">
              <div style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              Press and hold the microphone button<br>to start your conversation
            </div>
          </div>
          
          <!-- Controls -->
          <div style="
            padding: 20px 24px;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            background: rgba(248, 250, 252, 0.8);
          ">
            <button id="record-btn" style="
              width: 100%;
              padding: 16px 24px;
              border: none;
              border-radius: 12px;
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              color: white;
              cursor: pointer;
              font-weight: 600;
              font-size: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: all 0.2s ease;
              user-select: none;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              Hold to Talk
            </button>
            <div id="status-text" style="
              text-align: center;
              margin-top: 12px;
              font-size: 13px;
              color: #6b7280;
              font-weight: 500;
            ">Ready to listen</div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHtml);
    attachEventListeners();
    loadAgent();
  }

  // Load agent configuration
  async function loadAgent() {
    try {
      const response = await fetch(`${config.apiUrl}/api/agent/${config.agentId}`);
      const agent = await response.json();
      console.log('Loaded agent:', agent.name);
      
      // Initialize WebSocket connection
      initWebSocket();
    } catch (error) {
      console.error('Failed to load agent:', error);
      updateStatus('Connection error', 'error');
    }
  }

  // Initialize WebSocket connection
  async function initWebSocket() {
    try {
      const response = await fetch(`${config.apiUrl}/api/agent/${config.agentId}/connect`, {
        method: 'POST'
      });
      const connectionInfo = await response.json();
      
      const wsUrl = connectionInfo.wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to voice agent');
        updateStatus('Connected', 'connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleAgentResponse(data);
      };
      
      ws.onclose = () => {
        updateStatus('Reconnecting...', 'connecting');
        setTimeout(initWebSocket, 3000); // Auto-reconnect
      };
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      updateStatus('Connection failed', 'error');
    }
  }

  // Handle agent responses
  function handleAgentResponse(response) {
    if (response.type === 'response') {
      addMessage(response.message, 'agent');
      // Text-to-speech for agent responses
      speakText(response.message);
    }
  }

  // Text-to-speech
  function speakText(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    
    // Clear welcome message if it's the first real message
    if (messagesDiv.children.length === 1 && messagesDiv.children[0].textContent.includes('Press and hold')) {
      messagesDiv.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
      ${sender === 'agent' ? 
        `
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
          align-self: flex-start;
          border-bottom-left-radius: 6px;
        ` : 
        `
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 6px;
        `
      }
    `;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Update status
  function updateStatus(status, type = 'ready') {
    const statusEl = document.getElementById('status-text');
    const dotEl = document.getElementById('status-dot');
    const connectionEl = document.getElementById('connection-status');
    
    if (statusEl) statusEl.textContent = status;
    if (connectionEl) connectionEl.textContent = status;
    
    if (dotEl) {
      const colors = {
        connected: '#10b981',
        connecting: '#f59e0b',
        error: '#ef4444',
        ready: '#10b981'
      };
      dotEl.style.background = colors[type] || colors.ready;
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    const container = document.getElementById('widget-container');
    const panel = document.getElementById('widget-panel');
    const closeBtn = document.getElementById('close-widget');
    const recordBtn = document.getElementById('record-btn');

    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #widget-container:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
      }
      
      #widget-button:hover {
        transform: scale(1.05);
      }
      
      #close-widget:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      
      #record-btn:hover {
        background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%) !important;
        transform: translateY(-1px);
      }
      
      #record-btn:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    container.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        panel.style.display = 'flex';
        setTimeout(() => {
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        }, 10);
      } else {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(10px)';
        setTimeout(() => {
          panel.style.display = 'none';
        }, 300);
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = false;
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(10px)';
      setTimeout(() => {
        panel.style.display = 'none';
      }, 300);
    });

    // Recording events
    recordBtn.addEventListener('mousedown', startRecording);
    recordBtn.addEventListener('mouseup', stopRecording);
    recordBtn.addEventListener('mouseleave', stopRecording);
    
    // Touch events for mobile
    recordBtn.addEventListener('touchstart', startRecording);
    recordBtn.addEventListener('touchend', stopRecording);
  }

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      updateStatus('Listening...', 'connecting');
      
      const recordBtn = document.getElementById('record-btn');
      recordBtn.innerHTML = `
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse 1.5s infinite;
        "></div>
        Recording...
      `;
      recordBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      
      // Add pulse animation if not already added
      if (!document.getElementById('pulse-animation')) {
        const pulseStyle = document.createElement('style');
        pulseStyle.id = 'pulse-animation';
        pulseStyle.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(pulseStyle);
      }
      
    } catch (error) {
      console.error('Recording failed:', error);
      updateStatus('Microphone access denied', 'error');
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      updateStatus('Processing...', 'connecting');
      
      const recordBtn = document.getElementById('record-btn');
      recordBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        Hold to Talk
      `;
      recordBtn.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
    }
  }

  // Process audio
  function processAudio(audioBlob) {
    // Demo simulation
    const demoMessages = [
      'Hello, how can I help you today?',
      'What would you like to know about?',
      'I\'m here to assist you with any questions.',
      'How can I make your day better?',
      'What\'s on your mind?'
    ];
    
    const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
    addMessage('Hello, can you help me?', 'user');
    
    // Simulate agent response delay
    setTimeout(() => {
      addMessage(randomMessage, 'agent');
      updateStatus('Ready to listen', 'ready');
    }, 1000);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        message: randomMessage,
      }));
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();