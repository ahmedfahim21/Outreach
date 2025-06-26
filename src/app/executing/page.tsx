"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { Loader2, Send, CheckCircle, AlertCircle, Users, MessageSquare, Play, BarChart3, Square, Trash2, Bot, Zap, Target, TrendingUp, Clock, Activity, Sparkles, ArrowLeft, Settings, Brain, Eye, FileText, Link, Hash, Coffee } from "lucide-react";
import Image from "next/image";

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
    console.log('📤 sendMessage called:', {
      sessionIdFromRef: currentSessionId,
      messagePreview: message.substring(0, 50) + '...',
      messageLength: message.length
    });
    
    if (!currentSessionId) {
      console.error('❌ Cannot send message: No session ID available');
      return false;
    }

    console.log('📡 Making POST request to send message...');

    try {
      const response = await fetch(`/api/ai/send-message/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      console.log('📡 Send message response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Send message result:', result);
      
      if (result.success) {
        console.log('✅ Message sent successfully');
      } else {
        console.error('❌ Message send failed:', result);
      }
      
      return result.success;
    } catch (error) {
      console.error('💥 Error sending message:', error);
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
    console.log('📨 handleStreamMessage called with:', message.type, message);
    
    if (message.type === 'heartbeat' || message.type === 'connected') {
      console.log('💗 Skipping heartbeat/connected message');
      return;
    }

    console.log('📝 Adding message to stream:', message.type);
    // Use functional state update to avoid stale state issues
    setStreamMessages(prev => {
      console.log('📊 Current messages count:', prev.length, '-> Adding 1 more');
      return [...prev, message];
    });

    console.log('🔄 Processing message type:', message.type);
    switch (message.type) {
      case 'input_request':
        console.log('❓ Input request received:', message.content);
        setWaitingForInput(true);
        setCurrentInputPrompt(typeof message.content === 'string' ? message.content : '');
        break;

      case 'completion':
        console.log('✅ Completion message received');
        await markCampaignComplete();
        break;
        
      case 'function_result':
        console.log('🔧 Function result received, checking for scored_candidates...');
        // Check if this function result contains scored_candidates
        if (typeof message.content === 'object' && message.content !== null) {
          const contentObj = message.content as { scored_candidates?: ScoredCandidate[] };
          if (contentObj.scored_candidates && Array.isArray(contentObj.scored_candidates)) {
            console.log('🎯 Found scored candidates in function result:', contentObj.scored_candidates.length);
            await saveContactsToDatabase(contentObj.scored_candidates);
          } else {
            console.log('🔍 No scored_candidates found in function result');
          }
        }

        const currentSessionId = sessionIdRef.current || message.session_id;
        if (currentSessionId) {
          console.log('📊 Fetching summary for session:', currentSessionId);
          try {
            const summaryResponse = await fetch(`/api/ai/get-summary/${currentSessionId}`);
            const summaryResult = await summaryResponse.json();
            console.log('📊 Summary fetch result:', summaryResult);
            if (summaryResult.success) {
              console.log('✅ Summary fetched successfully:', summaryResult.message);
              setSummaryData(summaryResult.message);
            }
          } catch (error) {
            console.error('💥 Error fetching summary:', error);
          }
        } else {
          console.warn('⚠️ Cannot fetch summary: sessionId is null in ref and message');
        }
        break;
        
      case 'error':
        console.error('❌ Error message received:', message.content);
        break;
        
      default:
        console.log('📋 Other message type:', message.type);
        break;
    }
  }, [markCampaignComplete, saveContactsToDatabase]);

  const connectToStream = useCallback(async (sessionId: string) => {
    console.log('🔌 connectToStream called with sessionId:', sessionId);
    
    // Close existing connection if any
    if (eventSourceRef.current) {
      console.log('🔌 Closing existing EventSource connection...');
      eventSourceRef.current.close();
    }

    try {
      console.log('🔌 Creating new EventSource connection...');
      const eventSource = new EventSource(`/api/ai/stream/${sessionId}`);
      eventSourceRef.current = eventSource;
      console.log('🔌 EventSource created, setting up handlers...');

      eventSource.onopen = () => {
        console.log('✅ EventSource connection opened');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        console.log('📨 EventSource message received:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          console.log('📊 Parsed message data:', data);
          
          // Handle connection confirmation
          if (data.type === 'connected') {
            console.log('🤝 Stream connection confirmed');
            setIsConnected(true);
            setStreamReady(true);
            return;
          }
          
          // Skip heartbeat messages but use them to maintain connection status
          if (data.type === 'heartbeat') {
            console.log('💗 Heartbeat received');
            setIsConnected(true);
            return;
          }
          
          console.log('📨 Processing stream message:', data.type);
          handleStreamMessage(data);
        } catch (error) {
          console.error('💥 Error parsing stream message:', error, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
        setIsConnected(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('💥 Error connecting to stream:', error);
    }
  }, [handleStreamMessage]);

  // Effect to send initial message when stream is ready
  useEffect(() => {
    console.log('🔄 Initial message effect triggered:', {
      streamReady,
      hasPendingMessage: !!pendingInitialMessage,
      sessionIdFromRef: sessionIdRef.current
    });
    
    if (streamReady && pendingInitialMessage && sessionIdRef.current) {
      console.log('✅ Conditions met, sending pending initial message...');
      console.log('📝 Message preview:', pendingInitialMessage.substring(0, 100) + '...');
      
      sendMessage(pendingInitialMessage)
        .then((success) => {
          console.log('📤 Initial message send result:', success);
          if (success) {
            console.log('✅ Initial message sent successfully, clearing pending message');
            setPendingInitialMessage(null);
          } else {
            console.error('❌ Failed to send initial message');
          }
        })
        .catch((error) => {
          console.error('💥 Error sending initial message:', error);
        });
    } else {
      console.log('⏸️ Not ready to send initial message yet:', {
        streamReady,
        hasPendingMessage: !!pendingInitialMessage,
        sessionId: sessionIdRef.current
      });
    }
  }, [streamReady, pendingInitialMessage, sendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [streamMessages]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      console.log('🔄 Starting fetchCampaignData...');
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignIdFromUrl = urlParams.get('campaignId');
        const campaignIdFromSession = sessionStorage.getItem('pendingCampaignId');
        const campaignId = campaignIdFromUrl || campaignIdFromSession;
        
        console.log('📋 Campaign ID sources:', {
          fromUrl: campaignIdFromUrl,
          fromSession: campaignIdFromSession,
          final: campaignId
        });
        
        if (campaignId) {
          console.log('🚀 Fetching campaign data for ID:', campaignId);
          
          const response = await fetch(`/api/campaigns/${campaignId}`);
          console.log('📡 Campaign fetch response status:', response.status);
          
          const result = await response.json();
          console.log('📊 Campaign fetch result:', result);
          
          if (result.campaign) {
            console.log('✅ Campaign found, setting state:', result.campaign);
            setCampaign(result.campaign);
            sessionStorage.removeItem('pendingCampaignId');
            
            console.log('🤖 Starting AI session with campaign data...');
            await startAISession(campaignId, result.campaign);
          } else {
            console.error('❌ Campaign not found in result');
            router.push('/dashboard');
          }
        } else {
          console.error('❌ No campaign ID provided');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('💥 Error fetching campaign:', error);
        router.push('/paywall');
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [router]);

  const startAISession = async (campaignId: string, campaignData: Campaign) => {
    console.log('🤖 startAISession called with:', { campaignId, campaignTitle: campaignData.title });
    
    try {
      console.log('📡 Making request to /api/ai/start-session...');
      
      const response = await fetch('/api/ai/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId })
      });

      console.log('📡 AI session response status:', response.status);
      
      const result = await response.json();
      console.log('🔄 AI session start result:', result);
      
      if (result.success) {
        const newSessionId = result.sessionId;
        console.log('✅ AI session started successfully with ID:', newSessionId);
        
        // Update both state and ref immediately
        setSessionId(newSessionId);
        sessionIdRef.current = newSessionId;
        console.log('📝 Updated sessionId state and ref to:', newSessionId);

        // Wait a tiny bit for React to process the state update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Prepare the initial message
        const initialMessage = `${campaignData.description}
          Looking for People with Skills: ${campaignData.targetSkills.join(', ')}
          With a budget of ${campaignData.totalBudgetInUSDC} USDC}`;
        
        console.log('💬 Prepared initial message (first 100 chars):', initialMessage.substring(0, 100) + '...');
                    
        console.log('⏳ Setting pending initial message and connecting to stream...');
        setPendingInitialMessage(initialMessage);
        await connectToStream(newSessionId);
      } else {
        console.error('❌ AI session start failed:', result);
      }
    } catch (error) {
      console.error('💥 Error starting AI session:', error);
    }
  };

  const clearChat = () => {
    setStreamMessages([]);
    setSummaryData(null);
  };

  const getSummary = async () => {
    if (!isConnected || !sessionIdRef.current) return;

    try {
      const summaryResponse = await fetch(`/api/ai/get-summary/${sessionIdRef.current}`);
      const summaryResult = await summaryResponse.json();
      if (summaryResult.success) {
        setSummaryData(summaryResult.message);
      }
    } catch (error) {
      console.error('Error getting summary:', error);
    }
  };

  const endSession = async () => {
    if (!isConnected || !sessionIdRef.current) return;

    try {
      await fetch(`/api/ai/end-session/${sessionIdRef.current}`, { method: 'POST' });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsConnected(false);
      setSessionId(null);
      sessionIdRef.current = null;
      setStreamMessages(prev => [...prev, {
        type: 'system',
        content: 'Session ended',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const startNewSession = async () => {
    console.log('🔄 startNewSession called');
    
    if (!campaign?.id) {
      console.error('❌ Cannot start new session: no campaign ID');
      return;
    }
    
    console.log('🚀 Starting new session for campaign:', campaign.id);
    try {
      await startAISession(campaign.id, campaign);
      console.log('✅ New session started successfully');
    } catch (error) {
      console.error('💥 Error starting new session:', error);
    }
  };

  const handleInputSubmit = async () => {
    console.log('📝 handleInputSubmit called:', {
      inputValue: inputValue.trim(),
      hasSessionId: !!sessionIdRef.current,
      sessionId: sessionIdRef.current
    });
    
    if (!inputValue.trim() || !sessionIdRef.current) {
      console.warn('⚠️ Cannot submit: missing input or session ID');
      return;
    }

    const message = inputValue;
    console.log('📤 Preparing to send message:', message.substring(0, 50) + '...');
    
    setInputValue("");
    
    // Add user message to the chat immediately for better UX
    console.log('📝 Adding user message to chat for immediate display');
    setStreamMessages(prev => [...prev, {
      type: 'user_message',
      content: message,
      timestamp: new Date().toISOString()
    }]);

    // If this was in response to an input request, clear the waiting state
    if (waitingForInput) {
      console.log('✅ Clearing waitingForInput state');
      setWaitingForInput(false);
      setCurrentInputPrompt("");
    }

    console.log('🚀 Sending message via sendMessage function...');
    const success = await sendMessage(message);
    console.log('📊 Message send completed with success:', success);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'function_call':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'input_request':
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'user_message':
        return <Users className="h-4 w-4 text-white" />;
      case 'agent_thought':
        return <Brain className="h-4 w-4 text-green-500" />;
      case 'agent_thinking':
        return <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />;
      case 'display_to_user':
      case 'display_message':
        return <Bot className="h-4 w-4 text-purple-500" />;
      case 'function_result':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMessageClass = (type: string) => {
    const baseClass = "p-3 rounded-lg border-l-4 transition-all duration-300 ";
    switch (type) {
      case 'user_message':
        return baseClass + "bg-blue-50 border-blue-400";
      case 'agent_thought':
        return baseClass + "bg-green-50 border-green-400";
      case 'display_message':
        return baseClass + "bg-purple-50 border-purple-400";
      case 'function_call':
        return baseClass + "bg-yellow-50 border-yellow-400";
      case 'function_result':
        return baseClass + "bg-cyan-50 border-cyan-400";
      case 'input_request':
        return baseClass + "bg-orange-50 border-orange-400";
      case 'error':
        return baseClass + "bg-red-50 border-red-400";
      case 'system':
        return baseClass + "bg-gray-50 border-gray-400";
      case 'completion':
        return baseClass + "bg-green-50 border-green-400";
      default:
        return baseClass + "bg-gray-50 border-gray-300";
    }
  };

  const getMessageIconBg = (type: string) => {
    switch (type) {
      case 'user_message':
        return "bg-blue-500/10 border border-blue-200";
      case 'agent_thought':
        return "bg-green-500/10 border border-green-200";
      case 'display_message':
        return "bg-purple-500/10 border border-purple-200";
      case 'function_call':
        return "bg-blue-500/10 border border-blue-200";
      case 'function_result':
        return "bg-cyan-500/10 border border-cyan-200";
      case 'input_request':
        return "bg-orange-500/10 border border-orange-200";
      case 'error':
        return "bg-red-500/10 border border-red-200";
      case 'system':
        return "bg-gray-500/10 border border-gray-200";
      case 'completion':
        return "bg-green-500/10 border border-green-200";
      default:
        return "bg-gray-500/10 border border-gray-200";
    }
  };

  const getMessageLabel = (type: string) => {
    switch (type) {
      case 'user_message':
        return "You";
      case 'agent_thought':
        return "Agent Thinking";
      case 'display_message':
        return "Agent";
      case 'function_call':
        return "Function Call";
      case 'function_result':
        return "Result";
      case 'input_request':
        return "Input Required";
      case 'error':
        return "Error";
      case 'system':
        return "System";
      case 'completion':
        return "Complete";
      default:
        return "Message";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageContent = (type: string, content: StreamMessage['content']) => {
    switch (type) {
      case 'function_call':
        if (typeof content === 'object' && content !== null && 'name' in content) {
          const functionCall = content as { name: string };
          return `Executing: ${functionCall.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
        }
        return 'Executing function...';
      case 'function_result':
        if (typeof content === 'object' && content !== null) {
          const objContent = content as { 
            type?: string; 
            candidates?: Contact[]; 
            results?: unknown[];
            count?: number;
          };
          
          if (objContent.type === 'candidates') {
            return `Found ${objContent.count || 0} qualified candidates`;
          } else if (objContent.type === 'search_results') {
            return `Found ${objContent.count || 0} search results`;
          } else if (objContent.count !== undefined) {
            return `Processed ${objContent.count} items`;
          } else {
            // Try to make JSON more readable
            const jsonStr = JSON.stringify(content, null, 2);
            if (jsonStr.length > 200) {
              return `Result data available (${jsonStr.length} chars)`;
            }
            return jsonStr;
          }
        }
        return String(content);
      case 'info':
        return String(content);
      case 'user_message':
        return String(content);
      case 'agent_thought':
        return String(content);
      case 'agent_thinking':
        return String(content);
      case 'display_message':
        return String(content);
      case 'completion':
        return String(content);
      case 'error':
        return String(content);
      default:
        return String(content);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <Card className="p-8 max-w-md mx-4">
                <div className="bg-primary rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
                <CardTitle className="text-2xl mb-3">Loading Campaign</CardTitle>
                <p className="text-muted-foreground leading-relaxed">Processing your campaign data and establishing connection...</p>
                <div className="mt-4 flex justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0s] mx-1" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s] mx-1" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s] mx-1" />
                </div>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      {/* Custom Campaign Sidebar */}
      <Sidebar className="w-80">
        <SidebarHeader className="bg-background border-b border-border">
          <div className="p-4">
            {/* Back to Dashboard Button - Moved to top */}
            <div className="rounded-xl border-2 border-border bg-muted/30 mb-8 overflow-hidden">
              <Button 
              onClick={() => router.push('/dashboard')} 
              variant="ghost" 
              className="w-full justify-start hover:bg-muted/80 p-3 h-auto"
              size="sm"
              >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Dashboard</span>
              </Button>
            </div>

            {/* Agent Header */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                  <Image src="/outreachAI.png" alt="Bot" width={50} height={50} className="rounded-2xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Outreach Agent</h1>
                <p className="text-sm text-muted-foreground">AI-powered automation</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-background px-4 py-6 space-y-4">
          {/* Quick Actions */}
          <SidebarGroup>
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={startNewSession}
                disabled={waitingForInput}
                className="w-full justify-start h-10 mb-3"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Restart Session
              </Button>
              <Button
                onClick={endSession}
                disabled={!isConnected}
                variant="destructive"
                className="w-full justify-start h-10"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </SidebarGroup>

          {/* Campaign Info */}
          {campaign && (
            <SidebarGroup>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Campaign Details 
              </h3>
              <div className="rounded-xl border-2 border-border bg-muted/30 p-4 space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Title</div>
                    <div className="text-sm font-semibold text-foreground leading-tight">{campaign.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Status</div>
                      <Badge 
                        variant={campaign.status === 'completed' ? 'default' : 'secondary'} 
                        className="text-xs px-2 py-1"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Budget</div>
                      <div className="text-sm font-bold text-foreground">{campaign.totalBudgetInUSDC} USDC</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Contacts Found</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-primary">{actualContacts.length}</div>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
              </div>
            </SidebarGroup>
          )}

          {/* Session Summary */}
          {summaryData && (
            <SidebarGroup>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Session Analytics
              </h3>
              <div className="rounded-xl border-2 border-border bg-muted/30 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3  rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Candidates</div>
                      <div className="text-xl font-bold text-primary">{summaryData.candidates_found || 0}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Top Picks</div>
                      <div className="text-xl font-bold text-primary">{summaryData.top_candidates || 0}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Messages</div>
                      <div className="text-xl font-bold text-primary">{summaryData.outreach_messages || 0}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Meetings</div>
                      <div className="text-xl font-bold text-primary">{summaryData.meetings_scheduled || 0}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Functions: {summaryData.function_calls || 0}
                      </span>
                      <span className="text-destructive flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Errors: {summaryData.errors || 0}
                      </span>
                    </div>
                  </div>
              </div>
            </SidebarGroup>
          )}

          {/* Additional Session Info */}
          <SidebarGroup>
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-primary" />
              Session Info
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-border bg-muted/30 mb-3 overflow-hidden p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Hash className="w-3 h-3 mr-2" />
                      Session ID
                    </span>
                    <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded border">
                      {sessionId ? sessionId.substring(0, 8) + '...' : 'None'}
                    </span>
                  </div>
              </div>
              <div className="rounded-xl border-2 border-border bg-muted/30 mb-3 overflow-hidden p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <MessageSquare className="w-3 h-3 mr-2" />
                      Messages
                    </span>
                    <span className="text-sm font-semibold text-foreground">{streamMessages.length}</span>
                  </div>
              </div>
              {waitingForInput && (
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary flex items-center">
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Processing
                      </span>
                      <span className="text-xs font-medium text-primary">Working...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-background border-t border-border">
          <div className="py-4 px-2">
            {/* Connection Status */}
            <div className="rounded-xl border-2 border-border bg-muted/30 mb-6 overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Agent Status
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-xs font-medium text-muted-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Outreach AI • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* <Header /> */}

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col h-screen">
          {/* Chat Header */}
          <div className="bg-background border-b border-border p-6 flex-shrink-0">
            <div className="flex items-center justify-between max-w-4xl mx-auto flex-row">
                <h2 className="text-xl font-bold text-foreground flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  {campaign?.title || 'Outreach Campaign'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {waitingForInput ? 'Agent is processing your request...' : 'Chat with your AI outreach agent'}
                </p>
              {waitingForInput && (
                <Card className="bg-muted border-border">
                  <CardContent className="px-4 py-2 flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm font-medium text-foreground">Processing</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6 pb-32">

              {/* Empty state */}
              {streamMessages.length === 0 && !waitingForInput && (
                <div className="flex items-center justify-center h-full min-h-[60vh]">
                  <div className="text-center">
                    <div className="bg-primary rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      {isConnected ? (
                        <Bot className="w-10 h-10 text-secondary" />
                      ) : (
                        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {isConnected ? "Ready to Start" : "Connecting..."}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {isConnected 
                        ? "Your AI outreach agent is ready to help you find and connect with the right people. Start a conversation or wait for automatic processing."
                        : "Establishing connection with your AI agent..."
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4">
                {streamMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === "user_message" ? "justify-end" : "justify-start"
                    } transition-all duration-300`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-2xl ${
                        message.type === "user_message" ? "ml-16" : "mr-16"
                      }`}
                    >
                      <div
                        className={`rounded-2xl border-2 ${
                          message.type === "user_message"
                            ? "bg-white border-primary shadow-xl"
                            : "bg-card text-card-foreground border-muted shadow-lg hover:shadow-xl transition-shadow duration-300"
                        } transition-all duration-300`}
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                                message.type === "user_message"
                                  ? " text-primary-foreground"
                                  : getMessageIconBg(message.type)
                              }`}
                            >
                              {message.type === "user_message" ? (
                                <Users className="h-4 w-4" />
                              ) : (
                                getMessageIcon(message.type)
                              )}
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              <span
                                className={`text-xl font-semibold ${
                                  message.type === "user_message"
                                    ? "text-primary"
                                    : "text-foreground"
                                }`}
                              >
                                {getMessageLabel(message.type)}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                          <div
                            className="text-base leading-relaxed whitespace-pre-wrap font-medium text-foreground"
                          >
                            {formatMessageContent(message.type, message.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}


                {/* Typing Indicator */}
                {waitingForInput && (
                  <div className="flex justify-start opacity-100 transform translate-y-0 transition-all duration-300">
                    <div className="max-w-2xl mr-16">
                      <Card className="bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-200 flex items-center justify-center shadow-sm">
                              <Coffee className="w-4 h-4 text-purple-600 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground mb-2">
                                Agent is thinking...
                              </div>
                              {currentInputPrompt && (
                                <div className="text-sm text-muted-foreground max-w-md mb-3 font-medium">
                                  {currentInputPrompt}
                                </div>
                              )}
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="bg-background border-t border-border pt-4 pb-4 flex-shrink-0 fixed bottom-0 right-0 left-80 z-10">
            <div className="max-w-4xl mx-auto px-6">
              <form onSubmit={(e) => { e.preventDefault(); handleInputSubmit(); }}>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleInputSubmit();
                        }
                      }}
                      placeholder={waitingForInput ? "Agent is processing..." : "Message your outreach agent..."}
                      className="w-full h-14 px-6 text-sm resize-none transition-all duration-200 rounded-lg border-border bg-background"
                      disabled={!isConnected}
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="h-14 w-14 p-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={!inputValue.trim() || !isConnected}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
              <div className="mt-3 text-xs text-muted-foreground text-center flex items-center justify-center space-x-4">
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-1">⏎</span>
                  Send message
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center ">
                  <span className="w-4 h-4 mr-4">⇧⏎</span>
                  <span>New line</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}