'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DraftingCompass } from "lucide-react";
import Image from "next/image";

export function SchematicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      setDescription(null);

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
        throw new Error('No image URL received from the server');
      }

      setGeneratedImage(data.imageUrl);
      setDescription(data.description);
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
          <label htmlFor="prompt" className="text-sm font-medium leading-none">
            Describe the architectural design for schematic
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A modern minimalist house with large windows, surrounded by nature, with a flat roof and clean lines..."
            className="min-h-32"
          />
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
        >
          <DraftingCompass className="h-4 w-4" />
          {isGenerating ? 'Generating Schematic...' : 'Generate Schematic'}
        </Button>
      </div>

      <div className="md:col-span-3 space-y-6">
        <div className="aspect-[4/3] rounded-lg border bg-card overflow-hidden relative">
          {generatedImage ? (
            <Image
              src={generatedImage}
              alt="Generated schematic"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <DraftingCompass className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Schematic Will Appear Here</h3>
                <p className="text-sm text-muted-foreground">
                  Describe the architectural design and click generate
                </p>
              </div>
            </div>
          )}
        </div>

        {description && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Schematic Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 