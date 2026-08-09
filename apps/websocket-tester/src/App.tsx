import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Plug, Unplug, Trash2 } from 'lucide-react';
import {
  isValidWsUrl,
  createWsConnection,
  createSystemMessage,
  createSentMessage,
  createReceivedMessage,
  formatTimestamp,
  type ConnectionStatus,
  type WsMessage,
} from '@/utils/wsClient';
import { toast, ToastToaster } from "@/components/ui/toast";

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400 animate-pulse',
  connected: 'bg-green-500',
  error: 'bg-destructive',
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Connected',
  error: 'Error',
};

export default function App() {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [autoReconnect, setAutoReconnect] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((msg: WsMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const connect = useCallback(() => {
    if (!isValidWsUrl(url)) {
      toast.add({
        title: 'Invalid URL',
        description: 'Please enter a valid ws:// or wss:// URL.',
        type: "error",
      });
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    addMessage(createSystemMessage(`Connecting to ${url}...`));

    try {
      const ws = createWsConnection(url, {
        onOpen: () => {
          setStatus('connected');
          addMessage(createSystemMessage('Connection established.'));
        },
        onMessage: (data) => {
          addMessage(createReceivedMessage(data));
        },
        onClose: (code, reason) => {
          setStatus('disconnected');
          addMessage(
            createSystemMessage(
              `Connection closed. Code: ${code}${reason ? `, Reason: ${reason}` : ''}`,
            ),
          );
          wsRef.current = null;

          if (autoReconnect && code !== 1000) {
            addMessage(createSystemMessage('Auto-reconnecting in 3 seconds...'));
            reconnectTimerRef.current = setTimeout(() => {
              connect();
            }, 3000);
          }
        },
        onError: () => {
          setStatus('error');
          addMessage(createSystemMessage('Connection error occurred.'));
        },
      });

      wsRef.current = ws;
    } catch (e) {
      setStatus('error');
      addMessage(createSystemMessage(`Failed to connect: ${e instanceof Error ? e.message : 'Unknown error'}`));
    }
  }, [url, autoReconnect, addMessage, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(messageInput);
    addMessage(createSentMessage(messageInput));
    setMessageInput('');
  }, [messageInput, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const isConnected = status === 'connected';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">WebSocket Tester</h1>
            <p className="text-muted-foreground">
              WebSocket接続をテストし、メッセージの送受信をリアルタイムで確認できます。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Connection
                <span className="flex items-center gap-2 text-sm font-normal">
                  <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`} />
                  {STATUS_LABELS[status]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="wss://echo.websocket.org"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isConnected}
                  onKeyDown={(e) => e.key === 'Enter' && !isConnected && connect()}
                />
                {isConnected ? (
                  <Button type="button" variant="destructive" onClick={disconnect}>
                    <Unplug className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={connect}
                    disabled={status === 'connecting'}
                  >
                    <Plug className="mr-2 h-4 w-4" /> Connect
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-reconnect"
                  checked={autoReconnect}
                  onChange={(e) => setAutoReconnect(e.target.checked)}
                />
                <Label htmlFor="auto-reconnect" className="text-sm">
                  Auto-reconnect on disconnect
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Messages
                <Button type="button" variant="outline" size="sm" onClick={clearMessages}>
                  <Trash2 className="mr-1 h-3 w-3" /> Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message log */}
              <div className="border rounded-md h-[400px] overflow-y-auto p-3 space-y-2 bg-muted/20">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Connect and send a message to start.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 text-sm ${
                        msg.direction === 'system'
                          ? 'justify-center'
                          : msg.direction === 'sent'
                            ? 'justify-end'
                            : 'justify-start'
                      }`}
                    >
                      {msg.direction === 'system' ? (
                        <span className="text-xs text-muted-foreground italic px-3 py-1">
                          [{formatTimestamp(msg.timestamp)}] {msg.content}
                        </span>
                      ) : (
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            msg.direction === 'sent'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs opacity-70">
                              {msg.direction === 'sent' ? 'Sent' : 'Received'}
                            </span>
                            <span className="text-xs opacity-50">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                          </div>
                          <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                            {msg.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send message */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter message to send..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <Button
                  type="button"
                  onClick={sendMessage}
                  disabled={!isConnected || !messageInput.trim()}
                >
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
