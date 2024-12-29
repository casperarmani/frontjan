
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { VideoHistory } from '@/types';
import ReactMarkdown from 'react-markdown';

type VideoAnalysisHistoryProps = {
  historyData: VideoHistory[];
};

const VideoAnalysisHistory: React.FC<VideoAnalysisHistoryProps> = ({ historyData }) => {
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([]);

  useEffect(() => {
    const fetchVideoHistory = async () => {
      try {
        const response = await fetch('/video_analysis_history');
        if (!response.ok) {
          throw new Error('Failed to fetch video history');
        }
        const data = await response.json();
        setVideoHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching video history:', error);
      }
    };

    // Initial fetch
    fetchVideoHistory();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchVideoHistory, 5000);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const fetchVideoAnalysisHistory = async () => {
        try {
            let retries = 20;
            while (retries > 0) {
                const result = await fetch('/video_analysis_history');
                if (!result.ok) {
                    throw new Error('Failed to fetch video history');
                }
                const data = await result.json();
                if (JSON.stringify(data.history) !== JSON.stringify(videoHistory)) {
                    setVideoHistory(data.history || []);
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
                retries--;
            }
            throw new Error("Video analysis not found after retries.");
        } catch (error) {
            console.error('Error fetching video analysis history:', error);
        }
    };
    if(historyData.length){
      fetchVideoAnalysisHistory();
    }
}, [historyData]);
  

  return (
    <Card className="h-[96vh] w-[400px] max-w-full rounded-3xl bg-black/10 backdrop-blur-xl border border-white/10 relative z-10 overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Video Analysis History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          className="h-[calc(96vh-80px)] w-full rounded-md will-change-scroll overscroll-none px-4" 
          style={{ scrollBehavior: 'auto' }}
        >
          {videoHistory.length > 0 ? (
            <div className="space-y-4 pr-4 transform-gpu">
              {videoHistory.map((analysis, index) => (
                <div 
                  key={analysis.TIMESTAMP || index} 
                  className="rounded-2xl bg-black/20 backdrop-blur-lg p-4 animate-fade-in transform-gpu content-visibility-auto break-words"
                  style={{ contain: 'content', maxWidth: '100%' }}
                >
                  <div className="text-xs text-white/60">
                    {new Date(analysis.TIMESTAMP).toLocaleString()}
                  </div>
                  <div className="mt-2 font-medium text-white/80">
                    File: {analysis.upload_file_name}
                  </div>
                  <div className="mt-1 text-sm text-white/70 prose prose-invert prose-headings:text-base max-w-full overflow-hidden">
                    <ReactMarkdown className="break-words">{analysis.analysis}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/60 text-center pt-4">
              No video analysis history available
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default VideoAnalysisHistory;
