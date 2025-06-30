'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { suggestSendTime, type SuggestSendTimeOutput } from '@/ai/flows/suggest-send-time';
import { useToast } from '@/hooks/use-toast';

type SuggestSendTimeClientProps = {
  emailContent: string;
};

export function SuggestSendTimeClient({ emailContent }: SuggestSendTimeClientProps) {
  const [suggestion, setSuggestion] = React.useState<SuggestSendTimeOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSuggestTime = async () => {
    if (!emailContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please write some email content before suggesting a send time.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const result = await suggestSendTime({ emailContent });
      setSuggestion(result);
    } catch (error) {
      console.error('Error suggesting send time:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch a suggestion at this time. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFormattedTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleSuggestTime} disabled={isLoading} variant="outline" className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
        )}
        AI Suggest Best Send Time
      </Button>
      {suggestion && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle className="font-bold">
            Optimal Send Time: {getFormattedTime(suggestion.suggestedSendTime)}
          </AlertTitle>
          <AlertDescription>{suggestion.reasoning}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
