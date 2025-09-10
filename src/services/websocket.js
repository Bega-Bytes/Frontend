/**
 * WebSocket service for real-time communication with the backend
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isConnecting = false;
    this.isManualDisconnect = false;
    this.listeners = new Map();
    this.messageQueue = [];
    
    // Configuration
    this.backendUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';
    this.heartbeatInterval = 30000; // 30 seconds
    this.heartbeatTimer = null;
    
    console.log('🔌 WebSocket service initialized with URL:', this.backendUrl);
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('🔄 WebSocket connection already in progress');
      return Promise.resolve();
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.isManualDisconnect = false;
        
        console.log('🔗 Attempting WebSocket connection to:', this.backendUrl);
        this.ws = new WebSocket(this.backendUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Process queued messages
          this.processMessageQueue();
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Emit connection event
          this.emit('connected', { timestamp: Date.now() });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);
            
            // Handle specific message types
            if (data.type === 'ping') {
              this.handlePing();
            } else if (data.type === 'state_update') {
              this.emit('stateUpdate', data.data);
            } else if (data.type === 'command_result') {
              this.emit('commandResult', data.data);
            } else if (data.type === 'error') {
              this.emit('error', data.data);
            } else {
              // Emit generic message event
              this.emit('message', data);
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
            console.error('Raw message:', event.data);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`🔌 WebSocket connection closed: ${event.code} - ${event.reason}`);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          this.emit('disconnected', { 
            code: event.code, 
            reason: event.reason,
            timestamp: Date.now()
          });

          // Attempt reconnection if not manual disconnect
          if (!this.isManualDisconnect && this.shouldReconnect(event.code)) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          
          this.emit('error', { 
            message: 'WebSocket connection error',
            error,
            timestamp: Date.now()
          });
          
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            console.error('⏰ WebSocket connection timeout');
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    console.log('🔌 Manually disconnecting WebSocket');
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message through the WebSocket
   */
  sendMessage(message) {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now()
    };

    if (this.isConnected()) {
      try {
        const messageString = JSON.stringify(messageWithTimestamp);
        this.ws.send(messageString);
        console.log('📤 WebSocket message sent:', messageWithTimestamp);
        return true;
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
        this.queueMessage(messageWithTimestamp);
        return false;
      }
    } else {
      console.log('📋 Queueing message (WebSocket not connected):', messageWithTimestamp);
      this.queueMessage(messageWithTimestamp);
      
      // Try to reconnect
      if (!this.isConnecting) {
        this.connect().catch(console.error);
      }
      
      return false;
    }
  }

  /**
   * Send a voice command
   */
  sendVoiceCommand(text) {
    return this.sendMessage({
      type: 'voice_command',
      text: text
    });
  }

  /**
   * Request current vehicle state
   */
  requestState() {
    return this.sendMessage({
      type: 'get_state'
    });
  }

  /**
   * Queue a message for later sending
   */
  queueMessage(message) {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`📋 Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    messages.forEach(message => {
      if (this.isConnected()) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Error sending queued message:', error);
          this.queueMessage(message);
        }
      } else {
        this.queueMessage(message);
      }
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  /**
   * Handle automatic reconnection
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnectFailed', { 
        attempts: this.reconnectAttempts,
        timestamp: Date.now()
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.emit('reconnecting', { 
      attempt: this.reconnectAttempts,
      delay,
      timestamp: Date.now()
    });

    setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
          this.handleReconnect();
        });
      }
    }, delay);
  }

  /**
   * Determine if we should attempt to reconnect
   */
  shouldReconnect(closeCode) {
    // Don't reconnect for certain close codes
    const noReconnectCodes = [1000, 1001, 1005, 4000]; // Normal closure, going away, no status, custom app codes
    return !noReconnectCodes.includes(closeCode);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle ping from server
   */
  handlePing() {
    // Respond with pong
    if (this.isConnected()) {
      this.sendMessage({ type: 'pong' });
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      status: this.getStatus(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      url: this.backendUrl,
      heartbeatActive: !!this.heartbeatTimer,
      listeners: Object.fromEntries(
        Array.from(this.listeners.entries()).map(([event, callbacks]) => [event, callbacks.length])
      )
    };
  }
}

// Create and export singleton instance
export const wsService = new WebSocketService();

// Auto-connect when module loads (optional)
// wsService.connect().catch(console.error);

export default wsService;