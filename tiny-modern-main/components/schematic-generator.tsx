'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DraftingCompass, Sparkles } from "lucide-react";
import Image from "next/image";

export function SchematicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchematic, setGeneratedSchematic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedSchematic(null);

      const response = await fetch('/api/generate-schematic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate schematic');
      }

      if (!data.imageUrl) {
        throw new Error('No schematic URL received from the server');
      }

      setGeneratedSchematic(data.imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-2">
          <label htmlFor="schematic-prompt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Describe the layout details
          </label>
          <Textarea
            id="schematic-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Include room dimensions, furniture placement, window locations, and any specific layout requirements..."
            className="min-h-32"
          />
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
        >
          <DraftingCompass className="h-4 w-4" />
          {isGenerating ? 'Generating Schematic...' : 'Generate Layout'}
        </Button>
      </div>

      <div className="md:col-span-3 space-y-6">
        <div className="aspect-[4/3] rounded-lg border bg-card overflow-hidden relative">
          {generatedSchematic ? (
            <Image
              src={generatedSchematic}
              alt="Generated schematic layout"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <DraftingCompass className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Your Schematic Will Appear Here</h3>
                <p className="text-sm text-muted-foreground">
                  Describe the layout details and click generate
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 