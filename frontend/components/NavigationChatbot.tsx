'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  ChevronLeft,
  HelpCircle,
  Loader2,
  ArrowRight,
  User,
  Sparkles,
  Brain,
  Search,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Message type definition
interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  isThinking?: boolean; // Add this to differentiate between typing and thinking
}

export default function NavigationChatBot() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your ChakriGO assistant. How can I help you navigate our platform?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  
  // Typing animation state
  const [visibleContent, setVisibleContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, visibleContent]);

  // Typing animation effect
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isTyping && !lastMessage.isThinking) {
      setIsTyping(true);
      setVisibleContent('');
      setCurrentMessageIndex(0);
      
      const content = lastMessage.content;
      const typingInterval = setInterval(() => {
        setCurrentMessageIndex(prev => {
          if (prev < content.length) {
            setVisibleContent(content.substring(0, prev + 1));
            return prev + 1;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);
            // Update the message to remove the isTyping flag
            setMessages(prevMessages => 
              prevMessages.map((msg, index) => 
                index === messages.length - 1 ? { ...msg, isTyping: false } : msg
              )
            );
            return prev;
          }
        });
      }, 15); // Speed of typing
      
      return () => clearInterval(typingInterval);
    }
  }, [messages]);

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const currentPage = window.location.href;
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add a temporary "thinking" message with empty content and isThinking flag
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', // Empty content for the ThinkingAnimation
      isTyping: false, // Not in typing state yet
      isThinking: true // In thinking state
    }]);
    
    try {
      // Call the navigation agent API
      const response = await fetch('/api/navigation-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 
          `Current Page: 
          ${currentPage}
          Query:
          ${input}` }),
      });
      
      const data = await response.json();
      
      // Replace the "thinking" message with actual response
      if (data.error) {
        setMessages(prev => [
          ...prev.slice(0, -1), 
          { 
            role: 'assistant', 
            content: `Error: ${data.error}`, 
            isTyping: true,
            isThinking: false
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1), 
          { 
            role: 'assistant', 
            content: data.response, 
            isTyping: true,
            isThinking: false
          }
        ]);
        
        // Check if navigation is required
        if (data.navigate) {
          // Wait a moment before navigating so user can see the response
          setTimeout(() => {
            router.push(data.navigate);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error calling navigation agent:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.', 
          isTyping: true,
          isThinking: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation elements for the thinking state
  const ThinkingAnimation = () => {
    const icons = [Brain, Search, MapPin, Sparkles];
    const [activeIcon, setActiveIcon] = useState(0);
    
    // Cycle through icons
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveIcon((prev) => (prev + 1) % icons.length);
      }, 1000);
      return () => clearInterval(interval);
    }, []);
    
    const CurrentIcon = icons[activeIcon];
    
    const thinkingPhrases = [
      "Searching for the right place...",
      "Finding the best path...",
      "Navigating ChakriGO...",
      "Mapping your destination..."
    ];

    return (
      <div className="flex flex-col items-center space-y-2 w-full ">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary-100/20 rounded-full blur-md animate-pulse"></div>
          <div className="w-10 h-10 relative bg-gradient-to-r from-primary-100 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <CurrentIcon size={18} className="text-black" />
          </div>
        </motion.div>
        
        <motion.div 
          className="text-sm text-center font-medium text-gray-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {thinkingPhrases[activeIcon]}
        </motion.div>
        
        <div className="flex items-center justify-center space-x-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary-100 to-blue-600"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-40 pointer-events-none z-100">
      {/* Tab button on the right edge - only visible when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-auto"
          >
            <Button
              onClick={toggleChatBot}
              variant="ghost"
              className="h-32 w-8 rounded-l-xl rounded-r-none bg-black/70 backdrop-blur-sm border border-r-0 border-gray-700/50 hover:bg-black/80 transition-all duration-300 shadow-lg"
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <ChevronLeft size={16} className="text-primary-100" />
                <div className="rotate-90 whitespace-nowrap text-xs font-medium text-primary-100 flex items-center gap-1">
                  <Bot size={10} />
                  <span>AI</span>
                </div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Slide-out chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-[350px] md:w-[380px] pointer-events-auto"
          >
            <Card className="m-0 h-full flex flex-col bg-black/80 backdrop-blur-xl border-l border-y border-r-0 border-gray-700/30 rounded-l-2xl rounded-r-none shadow-2xl py-0">
              <CardHeader className="bg-gradient-to-r from-primary-100/10 to-blue-600/10 border-b border-gray-700/30 p-4 flex flex-row items-center justify-between gap-2 rounded-tl-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-primary-100 to-blue-600 p-2 rounded-xl shadow-lg">
                    <Bot size={18} className="text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white font-medium">
                      ChakriGO Assistant
                    </CardTitle>
                    <p className="text-xs text-gray-400">AI Navigation Helper</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleChatBot}
                  className="h-8 w-8 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg"
                  title="Minimize chat"
                >
                  <ArrowRight size={16} />
                </Button>
              </CardHeader>
              
                <CardContent className="p-4 flex-1">
                  <ScrollArea>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 flex-shrink-0 mr-2 bg-gradient-to-br from-primary-100 to-blue-600 flex items-center justify-center rounded-full shadow-md">
                            <Bot size={14} className="text-black" />
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`
                            max-w-[80%] p-3 rounded-2xl shadow-lg
                            ${message.role === 'user' 
                              ? 'bg-gradient-to-r from-primary-100 to-blue-600 text-black rounded-tr-none'
                              : 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-100 rounded-tl-none'
                            }
                          `}
                        >
                          {message.role === 'assistant' && message.isThinking ? (
                            <ThinkingAnimation />
                          ) : message.role === 'assistant' && message.isTyping ? (
                            <span className="text-gray-100">{visibleContent}</span>
                          ) : (
                            <span className={message.role === 'user' ? 'text-black' : 'text-gray-100'}>
                              {message.content}
                            </span>
                          )}
                        </motion.div>
                        
                        {message.role === 'user' && (
                          <div className="w-8 h-8 flex-shrink-0 ml-2 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center rounded-full shadow-md">
                            <User size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                
              </ScrollArea>
              </CardContent>
              
              <CardFooter className="border-t rounded-bl-2xl pb-6">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    placeholder="Ask me anything about ChakriGO..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus-visible:ring-primary-100/50 focus-visible:ring-offset-0 backdrop-blur-sm"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="rounded-full bg-gradient-to-r from-primary-100 to-blue-600 hover:from-primary-200 hover:to-blue-700 shadow-md text-black"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}