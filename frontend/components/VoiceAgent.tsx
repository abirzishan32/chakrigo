'use client';

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import VoiceVisualization from "./VoiceVisualization";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
    timestamp?: string;
}

interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
    saveResult?: boolean;
    interviewTitle?: string;
}

const VoiceAgent = ({ 
    userName, 
    userId, 
    type, 
    interviewId, 
    questions, 
    saveResult = true,
    interviewTitle = "AI Interview Session"
}: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [isListening, setIsListening] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Typewriter effect for messages
    const [displayedMessage, setDisplayedMessage] = useState("");
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1]?.content || "";
        if (latestMessage !== currentMessage) {
            setCurrentMessage(latestMessage);
            setTypewriterIndex(0);
            setDisplayedMessage("");
        }
    }, [messages]);

    // Typewriter effect
    useEffect(() => {
        if (typewriterIndex < currentMessage.length) {
            const timer = setTimeout(() => {
                setDisplayedMessage(prev => prev + currentMessage[typewriterIndex]);
                setTypewriterIndex(prev => prev + 1);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [typewriterIndex, currentMessage]);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
            setIsListening(true);
        };
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            setIsListening(false);
        };

        const onMessage = (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { 
                    role: message.role, 
                    content: message.transcript,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages((prev) => [...prev, newMessage]);
                
                if (message.role === 'assistant') {
                    setIsSpeaking(true);
                    setTimeout(() => setIsSpeaking(false), 2000);
                }
            }
        };

        const onSpeechStart = () => {
            setIsSpeaking(true);
            setIsListening(false);
        };
        const onSpeechEnd = () => {
            setIsSpeaking(false);
            setIsListening(true);
        };

        const onError = (error: Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    useEffect(() => {
        if (callStatus === CallStatus.ACTIVE) {
            const intervalId = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
            setTimerId(intervalId);
        } else if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
            if (timerId) {
                clearInterval(timerId);
                setTimerId(null);
            }
            if (callStatus === CallStatus.INACTIVE) {
                setElapsedTime(0);
            }
        }

        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [callStatus]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        if (saveResult && interviewId && userId) {
            const { success, feedbackId: id } = await createFeedback({
                interviewId: interviewId,
                userId: userId,
                transcript: messages
            });

            if (success && id) {
                router.push(`/interview-main/${interviewId}/feedback`);
            } else {
                console.log("Error saving feedback");
                router.push('/interview-home');
            }
        } else {
            console.log("Mock interview completed - not saving feedback");
            router.push('/interview-home?mock=completed');
        }
    };

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === 'generate') {
                router.push('/interview-home');
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, interviewId, router, saveResult]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        setElapsedTime(0);

        if (type === 'generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            });
        } else {
            let formattedQues = '';
            if (questions) {
                formattedQues = questions.map((question) => ` - ${question}`).join('\n');
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQues
                }
            });
        }
    };

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const getStatusText = () => {
        if (callStatus === 'CONNECTING') return 'Connecting...';
        if (isSpeaking) return 'AI is speaking...';
        if (isListening) return 'Listening...';
        if (callStatus === 'ACTIVE') return 'Connected';
        return 'Ready to start';
    };

    const getStatusColor = () => {
        if (callStatus === 'CONNECTING') return isDarkMode ? 'text-amber-400' : 'text-amber-600';
        if (isSpeaking) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
        if (isListening) return isDarkMode ? 'text-green-400' : 'text-green-600';
        if (callStatus === 'ACTIVE') return isDarkMode ? 'text-green-400' : 'text-green-600';
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    };

    // Theme classes
    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const panelClass = isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50';
    const messageBgClass = isDarkMode ? 'bg-gray-700/50' : 'bg-white';
    const userMessageBgClass = isDarkMode ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-50 border-blue-200';

    return (
        <div className={cn("min-h-screen transition-colors duration-300", bgClass)}>
            {/* Header */}
            <div className={cn("border-b", borderClass)}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className={cn("w-3 h-3 rounded-full", 
                                    callStatus === 'ACTIVE' ? 'bg-green-500' : 
                                    callStatus === 'CONNECTING' ? 'bg-amber-500' : 'bg-gray-400'
                                )} />
                                <h1 className={cn("text-xl font-semibold", textClass)}>
                                    {interviewTitle}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                            {/* Timer */}
                            <div className="flex items-center space-x-2">
                                <svg className={cn("w-4 h-4", mutedTextClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className={cn("font-mono text-lg", textClass)}>{formatTime(elapsedTime)}</span>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                )}
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interface */}
            <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-80px)]">
                <div className="flex gap-6 h-full">
                    {/* Left Panel - AI Control Center */}
                    <div className="w-80 flex-shrink-0">
                        <div className={cn("h-full rounded-xl border p-6 flex flex-col", panelClass, borderClass)}>
                            {/* Voice Visualization */}
                            <div className="flex-1 flex items-center justify-center mb-8">
                                <VoiceVisualization 
                                    isSpeaking={isSpeaking}
                                    isListening={isListening}
                                    isActive={callStatus === 'ACTIVE'}
                                    isDarkMode={isDarkMode}
                                />
                            </div>

                            {/* Status */}
                            <div className="text-center mb-8">
                                <div className={cn("text-sm font-medium mb-2", getStatusColor())}>
                                    {getStatusText()}
                                </div>
                                <div className={cn("text-xs", mutedTextClass)}>
                                    {callStatus === 'ACTIVE' ? 'Session in progress' : 'Waiting to connect'}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-4">
                                {callStatus !== 'ACTIVE' ? (
                                    <button
                                        onClick={handleCall}
                                        disabled={callStatus === 'CONNECTING'}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {callStatus === 'CONNECTING' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Connecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span>Start Interview</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleDisconnect}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                        </svg>
                                        <span>End Interview</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Conversation Transcript */}
                    <div className="flex-1">
                        <div className={cn("h-full rounded-xl border flex flex-col", panelClass, borderClass)}>
                            {/* Chat Header */}
                            <div className={cn("px-6 py-4 border-b", borderClass)}>
                                <div className="flex items-center justify-between">
                                    <h2 className={cn("text-lg font-semibold", textClass)}>Interview Transcript</h2>
                                    <div className="flex items-center space-x-2">
                                        <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                                            isSpeaking ? 'bg-blue-500' : 
                                            isListening ? 'bg-green-500' : 'bg-gray-400'
                                        )} />
                                        <span className={cn("text-sm", getStatusColor())}>
                                            {getStatusText()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <svg className={cn("w-12 h-12 mx-auto mb-4", mutedTextClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <h3 className={cn("text-lg font-medium mb-2", textClass)}>Ready to begin</h3>
                                            <p className={cn("text-sm", mutedTextClass)}>
                                                Your conversation will appear here once the interview starts
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, index) => (
                                            <div key={index} className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                                <div className={cn("max-w-[80%] rounded-lg p-4 shadow-sm", 
                                                    message.role === 'user' 
                                                        ? cn("border", userMessageBgClass)
                                                        : cn("border", messageBgClass, borderClass)
                                                )}>
                                                    <div className="flex items-start space-x-3">
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                            message.role === 'user' 
                                                                ? 'bg-blue-600 text-white' 
                                                                : isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                                                        )}>
                                                            {message.role === 'user' ? (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className={cn("text-sm font-medium", textClass)}>
                                                                    {message.role === 'user' ? 'You' : 'AI Interviewer'}
                                                                </span>
                                                                {message.timestamp && (
                                                                    <span className={cn("text-xs", mutedTextClass)}>{message.timestamp}</span>
                                                                )}
                                                            </div>
                                                            <p className={cn("text-sm leading-relaxed", textClass)}>
                                                                {index === messages.length - 1 && message.role === 'assistant' ? (
                                                                    <>
                                                                        {displayedMessage}
                                                                        {typewriterIndex < currentMessage.length && (
                                                                            <span className="animate-pulse">|</span>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    message.content
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgent;