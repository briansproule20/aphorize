'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import PhotoSearch from '@/components/photo-search';
import PosterCanvas, { type PosterSettings } from '@/components/poster-canvas';
import { Upload, Wand2, Loader2 } from 'lucide-react';

const fontFamilies = [
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

const fontWeights = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

const textAligns = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export default function PosterBuilderPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PosterSettings>({
    quoteText: '',
    author: '',
    fontFamily: 'serif',
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 1.4,
    padding: 80,
    textColor: '#FFFFFF',
    textShadow: true,
    textStroke: false,
    watermark: true,
    backgroundColor: '#1A1A1A',
  });

  const [backgroundSource, setBackgroundSource] = useState<'upload' | 'photo' | 'ai'>('ai');
  const [attribution, setAttribution] = useState<{ photographer: string; url: string }>();
  const [uploadedImage, setUploadedImage] = useState<string>();
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Load pending quote from localStorage
  useEffect(() => {
    const pendingQuote = localStorage.getItem('pendingQuote');
    if (pendingQuote) {
      setSettings((prev) => ({ ...prev, quoteText: pendingQuote }));
      localStorage.removeItem('pendingQuote');
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('posterSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('Failed to parse saved settings', err);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const {imageUrl, ...settingsToSave} = settings;
    localStorage.setItem('posterSettings', JSON.stringify(settingsToSave));
  }, [settings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setSettings((prev) => ({ ...prev, imageUrl: dataUrl }));
      setAttribution(undefined);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSelect = (url: string, photoAttribution: { photographer: string; url: string }) => {
    setSettings((prev) => ({ ...prev, imageUrl: url }));
    setAttribution(photoAttribution);
  };

  const handleGenerateAiBackground = async () => {
    if (!aiPrompt.trim()) return;

    setGeneratingAi(true);
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate image');
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error('No image URL in response');
      }

      // Set the base64 data URL directly
      setSettings((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      setAttribution(undefined);
    } catch (err) {
      console.error('AI image generation failed', err);
      alert(`Failed to generate AI background: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Poster Builder</h1>
        <p className="text-muted-foreground">Create beautiful quote posters with custom styling</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Settings */}
        <div className="space-y-6">
          {/* Quote Text */}
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="font-semibold text-lg">Quote Content</h2>
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                placeholder="Enter your quote..."
                value={settings.quoteText}
                onChange={(e) => setSettings((prev) => ({ ...prev, quoteText: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author (optional)</Label>
              <Input
                id="author"
                placeholder="e.g., Albert Einstein"
                value={settings.author}
                onChange={(e) => setSettings((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="font-semibold text-lg">Typography</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-weight">Font Weight</Label>
                <Select
                  value={settings.fontWeight}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, fontWeight: value }))}
                >
                  <SelectTrigger id="font-weight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeights.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                <Input
                  id="font-size"
                  type="range"
                  min="24"
                  max="120"
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line-height">Line Height: {settings.lineHeight.toFixed(1)}</Label>
                <Input
                  id="line-height"
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text-align">Text Align</Label>
                <Select
                  value={settings.textAlign}
                  onValueChange={(value: 'left' | 'center' | 'right') =>
                    setSettings((prev) => ({ ...prev, textAlign: value }))
                  }
                >
                  <SelectTrigger id="text-align">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {textAligns.map((align) => (
                      <SelectItem key={align.value} value={align.value}>
                        {align.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings((prev) => ({ ...prev, textColor: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding: {settings.padding}px</Label>
              <Input
                id="padding"
                type="range"
                min="20"
                max="200"
                value={settings.padding}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, padding: Number(e.target.value) }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-shadow">Text Shadow</Label>
                <Switch
                  id="text-shadow"
                  checked={settings.textShadow}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, textShadow: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="text-stroke">Text Stroke</Label>
                <Switch
                  id="text-stroke"
                  checked={settings.textStroke}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, textStroke: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="watermark">Watermark</Label>
                <Switch
                  id="watermark"
                  checked={settings.watermark}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, watermark: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-4 rounded-lg border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Background</h2>
              <div className="flex items-center gap-2 text-primary text-sm">
                <Wand2 className="h-4 w-4" />
                <span>AI Powered</span>
              </div>
            </div>

            <Tabs value={backgroundSource} onValueChange={(v) => setBackgroundSource(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  AI Generate
                </TabsTrigger>
                <TabsTrigger value="photo">Photo Search</TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-4">
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Wand2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">AI-Powered Background Generation</p>
                      <p className="text-muted-foreground text-xs">
                        Describe your ideal background and let AI create it for you using Nano Banana (Gemini 2.5 Flash Image)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Describe your background</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="Examples:&#10;• Sunset over mountains with orange and purple sky&#10;• Abstract watercolor blend of blues and greens&#10;• Minimalist geometric patterns in warm tones&#10;• Soft gradient from pink to lavender"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateAiBackground}
                    disabled={!aiPrompt.trim() || generatingAi}
                    className="w-full"
                    size="lg"
                  >
                    {generatingAi ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your background...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="photo" className="space-y-4">
                <PhotoSearch onSelectPhoto={handlePhotoSelect} />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Image</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Or use solid color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, backgroundColor: e.target.value, imageUrl: undefined }))
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 font-semibold text-lg">Preview</h2>
            {settings.quoteText ? (
              <PosterCanvas settings={settings} attribution={attribution} />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">Enter a quote to see preview</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Back to Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
