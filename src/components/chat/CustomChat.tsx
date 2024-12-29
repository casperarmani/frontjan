
import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LoadingMessage } from './LoadingMessage';

const PERPLEXITY_API_KEY = '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';

type TimeRange = '7d' | '30d' | '6m';

interface CustomChatProps {
  chatId?: string | null;
  messages: any[];
  setMessages: (messages: any[]) => void;
}

export function CustomChat({ chatId, messages, setMessages }: CustomChatProps) {
  const [isLoading, setIsLoading] = useState(false);

  const generateTrendPrompt = (timeRange: TimeRange) => {
    const ranges = {
      '7d': 'last 7 days',
      '30d': 'last 30 days',
      '6m': 'last 6 months'
    };
    return `What are the most significant and viral TikTok trends from the ${ranges[timeRange]}? Focus on emerging patterns, viral sounds, dance challenges, and content formats. Please provide specific examples and explain why they went viral. Make sure they are trends that could be used and repurposed for e-commerce ads.`;
  };

  const fetchTrends = async (timeRange: TimeRange) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Be precise and concise.'
            },
            {
              role: 'user',
              content: generateTrendPrompt(timeRange)
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          search_domain_filter: ['perplexity.ai'],
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          top_k: 0,
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 1
        })
      });

      const data = await response.json();
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }
      setMessages([...messages, 
        { type: 'user', content: `Analyze TikTok trends for the ${timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 6 months'}` },
        { type: 'bot', content: data.choices[0].message.content }
      ]);
    } catch (error) {
      setMessages([...messages, { type: 'error', content: 'Failed to fetch trends. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <div className={`p-6 transition-all duration-500 ${messages.length === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 p-0'}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-2 bg-white/20 rounded-full" />
          <span className="text-white/80 text-xl font-light">TikTok Trends Analysis</span>
        </div>
        <h1 className="text-white text-4xl font-extralight leading-tight">
          Discover viral TikTok trends across different time periods
        </h1>
      </div>
      <div className="flex space-x-4 p-6 border-b border-white/10 shrink-0 justify-center">
        <button
          onClick={() => fetchTrends('7d')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => fetchTrends('30d')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
        >
          Last 30 Days
        </button>
        <button
          onClick={() => fetchTrends('6m')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
        >
          Last 6 Months
        </button>
      </div>
      <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full px-6" ref={scrollAreaRef}>
          <div className="space-y-6 py-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && <LoadingMessage />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
