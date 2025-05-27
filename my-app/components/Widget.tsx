'use dom';

import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';

import tools from '../utils/tools';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.log(error);
    console.error('Microphone permission denied');
    return false;
  }
}

// Wave Icon Component
const WaveIcon = ({ isActive }) => (
  <svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    fill="none"
    style={{ transition: 'all 0.3s ease' }}
  >
    <path
      d="M2 8C2 8 4 4 6 8C8 12 10 4 12 8C14 12 16 4 18 8C20 12 22 8 22 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isActive ? 'wave-active' : 'wave-inactive'}
    />
    <path
      d="M1 8C1 8 3 6 5 8C7 10 9 6 11 8C13 10 15 6 17 8C19 10 21 8 23 8"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
      className={isActive ? 'wave-active-2' : 'wave-inactive-2'}
    />
  </svg>
);

export default function Widget({
  platform,
  get_battery_level,
  change_brightness,
  flash_screen,
}: {
  dom?: import('expo/dom').DOMProps;
  platform: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
}) {
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      setIsConnecting(false);
    },
    onMessage: (message) => {
      console.log('Agent message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setIsConnecting(false);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required for voice chat');
        setIsConnecting(false);
        return;
      }

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'agent_01jvg9443reddrc38gye4jhfvr',
        dynamicVariables: {
          platform,
        },
        clientTools: {
          get_battery_level,
          change_brightness,
          flash_screen,
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsConnecting(false);
    }
  }, [conversation, platform, get_battery_level, change_brightness, flash_screen]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const getStatusText = () => {
    if (conversation.status === 'connected') return 'VOICE CHAT';
    if (isConnecting || conversation.status === 'connecting') return 'CONNECTING...';
    return 'VOICE CHAT';
  };

  const handlePress = () => {
    if (conversation.status === 'disconnected') {
      startConversation();
    } else {
      stopConversation();
    }
  };

  const isActive = conversation.status === 'connected';

  return (
    <Pressable
      style={[
        styles.widgetContainer,
        isActive && styles.widgetContainerActive
      ]}
      onPress={handlePress}
      id="voice-widget"
    >
      {/* Voice button with wave icon */}
      <View
        style={[
          styles.voiceButton,
          isActive && styles.voiceButtonActive
        ]}
      >
        <WaveIcon isActive={isActive} />
      </View>

      {/* Text label */}
      <Text style={[styles.mainText, isActive && styles.mainTextActive]}>
        {getStatusText()}
      </Text>

      {/* Language/Region selector (optional) */}
      <View style={styles.languageSelector}>
        <Text style={styles.flagText}>🇺🇸</Text>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: 50,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: 280,
    zIndex: 10000,
  },
  widgetContainerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: 'rgba(239, 68, 68, 0.3)',
    shadowOpacity: 0.4,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  voiceButtonActive: {
    backgroundColor: '#ffffff',
    animation: 'pulse-button 2s infinite',
  },
  mainText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: '0.5px',
    flex: 1,
    textTransform: 'uppercase',
  },
  mainTextActive: {
    color: '#ffffff',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  flagText: {
    fontSize: 16,
  },
});

// Add global styles for animations and hover effects
const globalStyles = `
  @keyframes pulse-button {
    0% { 
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }

  @keyframes wave-animation {
    0%, 100% {
      d: path("M2 8C2 8 4 4 6 8C8 12 10 4 12 8C14 12 16 4 18 8C20 12 22 8 22 8");
    }
    25% {
      d: path("M2 8C2 8 4 6 6 8C8 10 10 6 12 8C14 10 16 6 18 8C20 10 22 8 22 8");
    }
    50% {
      d: path("M2 8C2 8 4 8 6 8C8 8 10 8 12 8C14 8 16 8 18 8C20 8 22 8 22 8");
    }
    75% {
      d: path("M2 8C2 8 4 10 6 8C8 6 10 10 12 8C14 6 16 10 18 8C20 6 22 8 22 8");
    }
  }

  @keyframes wave-animation-2 {
    0%, 100% {
      d: path("M1 8C1 8 3 6 5 8C7 10 9 6 11 8C13 10 15 6 17 8C19 10 21 8 23 8");
    }
    33% {
      d: path("M1 8C1 8 3 5 5 8C7 11 9 5 11 8C13 11 15 5 17 8C19 11 21 8 23 8");
    }
    66% {
      d: path("M1 8C1 8 3 10 5 8C7 6 9 10 11 8C13 6 15 10 17 8C19 6 21 8 23 8");
    }
  }

  .wave-active {
    animation: wave-animation 1.5s ease-in-out infinite;
    stroke: #1a1a1a !important;
  }

  .wave-active-2 {
    animation: wave-animation-2 1.8s ease-in-out infinite;
    stroke: #1a1a1a !important;
    opacity: 0.6 !important;
  }

  .wave-inactive {
    stroke: white;
  }

  .wave-inactive-2 {
    stroke: white;
    opacity: 0.6;
  }

  #voice-widget:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  }

  #voice-widget .voice-button:hover {
    transform: scale(1.05);
  }

  /* Additional styling for active state */
  #voice-widget.active {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}