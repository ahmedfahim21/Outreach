"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle, AlertCircle, Users, MessageSquare } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  searchIntent: string;
  customSearchIntent?: string;
  targetSkills: string[];
  selectedTools: string[];
  totalBudgetInUSDC: number;
  totalBudgetInEURC: number;
  autoNegotiation: boolean;
  autoFollowups: boolean;
  isPaid: boolean;
  status: string;
  paymentAmount?: string;
  paymentToken?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    contactEmail: string;
    walletAddress: string;
  };
}

interface Contact {
  id: string;
  campaignId: string;
  name: string;
  role?: string;
  description?: string;
  ai_score?: number;
  ai_strengths?: string[];
  ai_concerns?: string[];
  ai_reasoning?: string;
  contacted?: boolean;
  responded?: boolean;
}

interface StreamMessage {
  type: string;
  content: string | { name: string; inputs?: object } | { candidates?: Contact[] } | unknown;
  timestamp: string;
  session_id?: string;
}

interface ScoredCandidate {
  name: string;
  description?: string;
  role?: string;
  ai_score: number;
  ai_strengths: string[];
  ai_concerns: string[];
  ai_reasoning: string;
}

interface SummaryData {
  raw_user_query?: string;
  candidates_found?: number;
  top_candidates?: number;
  outreach_messages?: number;
  meetings_scheduled?: number;
  errors?: number;
  function_calls?: number;
}

export default function ExecutingPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [executionComplete, setExecutionComplete] = useState(false);
  const [currentInputPrompt, setCurrentInputPrompt] = useState("");
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  const [actualContacts, setActualContacts] = useState<Contact[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const router = useRouter();

  // Debug effect to track sessionId changes
  useEffect(() => {
    console.log('SessionId changed to:', sessionId);
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Memoized sendMessage function to avoid stale closures
  const sendMessage = useCallback(async (message: string) => {
    const currentSessionId = sessionIdRef.current;
    console.log('sendMessage called with sessionId from ref:', sessionIdRef.current);
    
    if (!currentSessionId) {
      console.error('Cannot send message: No session ID available');
      return false;
    }

    console.log('Sending message to session:', currentSessionId, 'Message preview:', message.substring(0, 100) + '...');

    try {
      const response = await fetch(`/api/ai/send-message/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const result = await response.json();
      console.log('Send message result:', result);
      return result.success;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const markCampaignComplete = useCallback(async () => {
    if (!campaign?.id) return;

    try {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      });
    } catch (error) {
      console.error('Error marking campaign complete:', error);
    }
  }, [campaign?.id]);

  const fetchContactsFromDB = useCallback(async () => {
    if (!campaign?.id) return;
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/contacts`);
      const result = await response.json();
      if (result.success && result.contacts) {
        setActualContacts(result.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts from database:', error);
    }
  }, [campaign?.id]);

  // Fetch contacts when campaign changes
  useEffect(() => {
    if (campaign?.id) {
      fetchContactsFromDB();
    }
  }, [campaign?.id, fetchContactsFromDB]);

  const saveContactsToDatabase = useCallback(async (scoredCandidates: ScoredCandidate[]) => {
    if (!campaign?.id || !scoredCandidates || scoredCandidates.length === 0) {
      return;
    }

    try {
      console.log('Saving contacts to database:', scoredCandidates);
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          contacts: scoredCandidates.map(candidate => ({
            name: candidate.name || 'Unknown',
            role: candidate.role || null,
            description: candidate.description || null,
            ai_score: candidate.ai_score || 0,
            ai_strengths: candidate.ai_strengths || [],
            ai_concerns: candidate.ai_concerns || [],
            ai_reasoning: candidate.ai_reasoning || null
          }))
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Contacts saved successfully:', result.contacts?.length);
        // Refresh contacts from database to show updated count
        await fetchContactsFromDB();
      } else {
        console.error('Failed to save contacts:', result.error);
      }
    } catch (error) {
      console.error('Error saving contacts to database:', error);
    }
  }, [campaign?.id, fetchContactsFromDB]);

  const handleStreamMessage = useCallback(async (message: StreamMessage) => {
    if (message.type === 'heartbeat' || message.type === 'connected') {
      return;
    }

    // Use functional state update to avoid stale state issues
    setStreamMessages(prev => [...prev, message]);

    switch (message.type) {
      case 'input_request':
        setWaitingForInput(true);
        setCurrentInputPrompt(typeof message.content === 'string' ? message.content : '');
        break;

      case 'completion':
        setExecutionComplete(true);
        await markCampaignComplete();
        break;
        
      case 'function_result':
        // Check if this function result contains scored_candidates
        if (typeof message.content === 'object' && message.content !== null) {
          const contentObj = message.content as { scored_candidates?: ScoredCandidate[] };
          if (contentObj.scored_candidates && Array.isArray(contentObj.scored_candidates)) {
            console.log('Found scored candidates in function result:', contentObj.scored_candidates.length);
            await saveContactsToDatabase(contentObj.scored_candidates);
          }
        }

        const currentSessionId = sessionIdRef.current || message.session_id;
        if (currentSessionId) {
          console.log('Fetching summary for session:', currentSessionId);
          try {
            const summaryResponse = await fetch(`/api/ai/get-summary/${currentSessionId}`);
            const summaryResult = await summaryResponse.json();
            if (summaryResult.success) {
                console.log('Summary fetched successfully:', summaryResult.message);
              setSummaryData(summaryResult.message);
            }
          } catch (error) {
            console.error('Error fetching summary:', error);
          }
        } else {
          console.warn('Cannot fetch summary: sessionId is null in ref and message');
        }
        break;
        
      case 'error':
        break;
    }
  }, [markCampaignComplete, saveContactsToDatabase]);

  const connectToStream = useCallback(async (sessionId: string) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`/api/ai/stream/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('Stream connected successfully');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle connection confirmation
          if (data.type === 'connected') {
            setIsConnected(true);
            setStreamReady(true);
            console.log('Stream confirmed ready');
            return;
          }
          
          // Skip heartbeat messages but use them to maintain connection status
          if (data.type === 'heartbeat') {
            setIsConnected(true);
            return;
          }
          
          handleStreamMessage(data);
        } catch (error) {
          console.error('Error parsing stream message:', error);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('Error connecting to stream:', error);
    }
  }, [handleStreamMessage]);

  // Effect to send initial message when stream is ready
  useEffect(() => {
    if (streamReady && pendingInitialMessage && sessionIdRef.current) {
      console.log('Stream ready, sending pending initial message with sessionId:', sessionIdRef.current);
      sendMessage(pendingInitialMessage)
        .then(() => {
          setPendingInitialMessage(null);
        })
        .catch(console.error);
    }
  }, [streamReady, pendingInitialMessage, sendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [streamMessages]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignIdFromUrl = urlParams.get('campaignId');
        const campaignId = campaignIdFromUrl || sessionStorage.getItem('pendingCampaignId');
        
        if (campaignId) {
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const result = await response.json();
          
          if (result.campaign) {
            if (!result.campaign.isPaid) {
              router.push(`/paywall?campaignId=${campaignId}`);
              return;
            }
            
            setCampaign(result.campaign);
            
            if (result.campaign.isPaid) {
              sessionStorage.removeItem('pendingCampaignId');
              // Start AI session with campaign data
              await startAISession(campaignId, result.campaign);
            }
          } else {
            router.push('/paywall');
          }
        } else {
          router.push('/paywall');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        router.push('/paywall');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [router]);

  const startAISession = async (campaignId: string, campaignData: Campaign) => {
    try {
      const response = await fetch('/api/ai/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId })
      });

      const result = await response.json();
      console.log('AI session start result:', result);
      if (result.success) {
        const newSessionId = result.sessionId;
        
        // Update both state and ref immediately
        setSessionId(newSessionId);
        sessionIdRef.current = newSessionId;

        console.log('AI session started with ID:', newSessionId);
        
        // Wait a tiny bit for React to process the state update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Prepare the initial message
        const initialMessage = `Start outreach campaign for: ${campaignData.title}. 
Campaign Description: ${campaignData.description}
Search Intent: ${campaignData.searchIntent}
${campaignData.customSearchIntent ? `Custom Search Intent: ${campaignData.customSearchIntent}` : ''}
Target Skills: ${campaignData.targetSkills.join(', ')}`;
        
        console.log('Setting pending initial message');
        setPendingInitialMessage(initialMessage);
        await connectToStream(newSessionId);
      }
    } catch (error) {
      console.error('Error starting AI session:', error);
    }
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim() || !sessionIdRef.current) return;

    const message = inputValue;
    setInputValue("");
    setWaitingForInput(false);
    setCurrentInputPrompt("");

    await sendMessage(message);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'function_call':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'input_request':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <div className="h-5 w-5 bg-blue-500 rounded-full" />;
      case 'user_message':
        return <div className="h-5 w-5 bg-purple-500 rounded-full" />;
      case 'agent_thought':
        return <div className="h-5 w-5 bg-green-400 rounded-full" />;
      case 'agent_thinking':
        return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />;
      case 'display_to_user':
        return <div className="h-5 w-5 bg-gray-500 rounded-full" />;
      case 'function_result':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const formatMessageContent = (type: string, content: StreamMessage['content']) => {
    switch (type) {
      case 'function_call':
        if (typeof content === 'object' && content !== null && 'name' in content) {
          const functionCall = content as { name: string };
          return `🔧 Executing: ${functionCall.name.replace('_', ' ')}`;
        }
        return '🔧 Executing function...';
      case 'function_result':
        if (typeof content === 'object' && content !== null) {
          const objContent = content as { 
            type?: string; 
            candidates?: Contact[]; 
            results?: unknown[];
            count?: number;
          };
          
          if (objContent.type === 'candidates') {
            return `✅ Found ${objContent.count || 0} qualified candidates`;
          } else if (objContent.type === 'search_results') {
            return `🔍 Found ${objContent.count || 0} search results`;
          } else if (objContent.count !== undefined) {
            return `📊 Processed ${objContent.count} items`;
          } else {
            // Try to make JSON more readable
            const jsonStr = JSON.stringify(content, null, 2);
            if (jsonStr.length > 200) {
              return `📄 Result: ${jsonStr}`;
            }
            return `📄 ${jsonStr}`;
          }
        }
        return String(content);
      case 'info':
        return `ℹ️ ${String(content)}`;
      case 'user_message':
        return `👤 You: ${String(content)}`;
      case 'agent_thought':
        return `💭 ${String(content)}`;
      case 'agent_thinking':
        return `🤔 ${String(content)}`;
      case 'display_message':
        return `💬 ${String(content)}`;
      case 'completion':
        return `🎉 ${String(content)}`;
      case 'error':
        return `❌ ${String(content)}`;
      default:
        return String(content);
    }
  };

  const renderSummaryData = () => {
    if (!summaryData) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <div className="animate-pulse">
            <div className="h-3 w-3 bg-gray-400 rounded-full mx-auto mb-4"></div>
            <p>Waiting for campaign summary...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summaryData.candidates_found || 0}</div>
            <div className="text-sm text-muted-foreground">Candidates Found</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summaryData.top_candidates || 0}</div>
            <div className="text-sm text-muted-foreground">Top Candidates</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summaryData.outreach_messages || 0}</div>
            <div className="text-sm text-muted-foreground">Messages Sent</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summaryData.meetings_scheduled || 0}</div>
            <div className="text-sm text-muted-foreground">Meetings Scheduled</div>
          </div>
        </div>
        
        <div className="space-y-3">
          
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading campaign...</h2>
          <p className="text-muted-foreground">Processing your payment and campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Campaign Info */}
        {campaign && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {campaign.title}
                <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Campaign Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Campaign Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Description:</span> {campaign.description}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> {campaign.totalBudgetInUSDC} USDC / {campaign.totalBudgetInEURC} EURC
                    </div>
                  </div>
                </div>
                
                {/* Target Criteria */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Target Criteria</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground mb-1 block">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {campaign.targetSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground mb-1 block">Tools:</span>
                      <div className="flex flex-wrap gap-1">
                        {campaign.selectedTools.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Stats */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Progress</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{actualContacts.length}</div>
                      <div className="text-xs text-muted-foreground">Contacts Found</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {actualContacts.filter(contact => contact.contacted).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Contacted</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-muted-foreground">
                      {isConnected ? 'AI Connected' : 'AI Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Execution Stream */}
          <Card className="h-[550px] flex flex-col overflow-scroll">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                Execution Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-scroll space-y-3 mb-4">
                {streamMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="animate-pulse">
                      <div className="h-3 w-3 bg-gray-400 rounded-full mx-auto mb-4"></div>
                      <p>Waiting for AI to start processing...</p>
                    </div>
                  </div>
                )}
                {streamMessages.map((message, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {message.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="break-anywhere overflow-hidden">
                          <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {formatMessageContent(message.type, message.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Field */}
              {waitingForInput && (
                <div className="border-t pt-4">
                  <div className="mb-2 text-sm font-medium">{currentInputPrompt}</div>
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter your response..."
                      onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                    />
                    <Button onClick={handleInputSubmit} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacts Found */}
          <Card className="h-[550px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Summary Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {renderSummaryData()}
            </CardContent>
          </Card>
        </div>

        {/* Completion Actions */}
        {executionComplete && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Campaign Execution Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  Found {actualContacts.length} potential contacts for your outreach campaign.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}