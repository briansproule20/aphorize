'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import SignInButton from '@/app/_components/echo/sign-in-button';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import PosterCanvas, { type PosterSettings } from '@/components/poster-canvas';
import { Upload, Wand2, Loader2, Palette, ChevronDown } from 'lucide-react';

const fontFamilies = [
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: '"Palatino Linotype", Palatino, serif', label: 'Palatino' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial (Sans)' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: '"Brush Script MT", cursive, serif', label: 'Brush Script' },
  { value: '"Lucida Handwriting", "Bradley Hand", cursive, serif', label: 'Handwriting' },
  { value: '"Comic Sans MS", "Bradley Hand", cursive, sans-serif', label: 'Comic Sans' },
  { value: 'serif', label: 'Classic Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'monospace', label: 'Monospace' },
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
  const { user, isLoading } = useEcho();
  const [settings, setSettings] = useState<PosterSettings>({
    quoteText: '',
    author: '',
    fontFamily: 'Georgia, serif',
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    verticalPosition: 0,
    horizontalPosition: 0,
    lineHeight: 1.4,
    padding: 80,
    maxWidth: 900,
    textColor: '#FFFFFF',
    textShadow: true,
    textStroke: false,
    watermark: true,
    showQuotes: true,
    showPunctuation: true,
    backgroundColor: '#1A1A1A',
  });

  const [backgroundSource, setBackgroundSource] = useState<'upload' | 'color' | 'ai'>('ai');
  const [attribution, setAttribution] = useState<{ photographer: string; url: string }>();
  const [uploadedImage, setUploadedImage] = useState<string>();
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [tempColor1, setTempColor1] = useState('#1A1A1A');
  const [tempColor2, setTempColor2] = useState('#4A4A4A');
  
  // Collapsible state
  const [quoteOpen, setQuoteOpen] = useState(true);
  const [typographyOpen, setTypographyOpen] = useState(true);
  const [fontSettingsOpen, setFontSettingsOpen] = useState(true);
  const [positionOpen, setPositionOpen] = useState(true);
  const [stylingOpen, setStylingOpen] = useState(true);
  const [backgroundOpen, setBackgroundOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);

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

  const handleApplyColors = () => {
    if (gradientEnabled) {
      const gradient = `linear-gradient(135deg, ${tempColor1} 0%, ${tempColor2} 100%)`;
      setSettings((prev) => ({ ...prev, imageUrl: undefined, backgroundColor: gradient }));
    } else {
      setSettings((prev) => ({ ...prev, imageUrl: undefined, backgroundColor: tempColor1 }));
    }
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

  if (!isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl tracking-tight">
              Poster Builder
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Sign in to create beautiful quote posters with AI backgrounds
            </p>
          </div>
          <div className="space-y-4">
            <SignInButton />
            <p className="text-muted-foreground text-xs">
              Secure authentication with built-in AI billing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="font-bold text-2xl md:text-3xl">Poster Builder</h1>
        <p className="text-muted-foreground text-sm md:text-base">Create beautiful quote posters with custom styling</p>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
        {/* Left Panel - Settings */}
        <div className="space-y-4 md:space-y-6">
          {/* Quote Text */}
          <Collapsible open={quoteOpen} onOpenChange={setQuoteOpen}>
            <div className="rounded-lg border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors md:p-4">
                <h2 className="font-semibold text-base md:text-lg">Quote Content</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${quoteOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-t p-3 md:p-4">
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
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Typography */}
          <Collapsible open={typographyOpen} onOpenChange={setTypographyOpen}>
            <div className="rounded-lg border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors md:p-4">
                <h2 className="font-semibold text-base md:text-lg">Typography</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${typographyOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 border-t p-3 md:p-4">
                  
                  {/* Font Settings */}
                  <Collapsible open={fontSettingsOpen} onOpenChange={setFontSettingsOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-sm">Font Settings</h3>
                      <ChevronDown className={`h-4 w-4 transition-transform ${fontSettingsOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="font-family">Font Family</Label>
                            <Select
                              value={settings.fontFamily}
                              onValueChange={(value) => setSettings((prev) => ({ ...prev, fontFamily: value }))}
                            >
                              <SelectTrigger id="font-family">
                                <SelectValue placeholder="Select a font" />
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Position */}
                  <Collapsible open={positionOpen} onOpenChange={setPositionOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-sm">Position</h3>
                      <ChevronDown className={`h-4 w-4 transition-transform ${positionOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-4 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Adjust text placement</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                verticalPosition: 0,
                                horizontalPosition: 0,
                              }))
                            }
                          >
                            Reset
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="vertical-position">Vertical: {settings.verticalPosition}px</Label>
                            <Input
                              id="vertical-position"
                              type="range"
                              min="-400"
                              max="400"
                              value={settings.verticalPosition}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, verticalPosition: Number(e.target.value) }))
                              }
                            />
                            <p className="text-muted-foreground text-xs">Negative = up, Positive = down</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="horizontal-position">Horizontal: {settings.horizontalPosition}px</Label>
                            <Input
                              id="horizontal-position"
                              type="range"
                              min="-400"
                              max="400"
                              value={settings.horizontalPosition}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, horizontalPosition: Number(e.target.value) }))
                              }
                            />
                            <p className="text-muted-foreground text-xs">Negative = left, Positive = right</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Styling & Display */}
                  <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-sm">Styling & Display</h3>
                      <ChevronDown className={`h-4 w-4 transition-transform ${stylingOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <Label htmlFor="max-width">Max Text Width: {settings.maxWidth}px</Label>
                          <Input
                            id="max-width"
                            type="range"
                            min="300"
                            max="1080"
                            value={settings.maxWidth}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, maxWidth: Number(e.target.value) }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="show-quotes">Quotation Marks</Label>
                            <Switch
                              id="show-quotes"
                              checked={settings.showQuotes}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({ ...prev, showQuotes: checked }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="show-punctuation">Author Dash</Label>
                            <Switch
                              id="show-punctuation"
                              checked={settings.showPunctuation}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({ ...prev, showPunctuation: checked }))
                              }
                            />
                          </div>
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
                    </CollapsibleContent>
                  </Collapsible>

                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Background */}
          <Collapsible open={backgroundOpen} onOpenChange={setBackgroundOpen}>
            <div className="rounded-lg border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors md:p-4">
                <h2 className="font-semibold text-base md:text-lg">Background</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${backgroundOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t p-3 md:p-4">
                  <Tabs value={backgroundSource} onValueChange={(v) => setBackgroundSource(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ai" className="gap-2">
                        <Wand2 className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Generate</span>
                        <span className="sm:hidden">AI</span>
                      </TabsTrigger>
                      <TabsTrigger value="color" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Color</span>
                        <span className="sm:hidden">Color</span>
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">Upload</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="ai-prompt">Describe your background</Label>
                        <Textarea
                          id="ai-prompt"
                          placeholder="A serene mountain landscape at sunset..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <Button
                        onClick={handleGenerateAiBackground}
                        disabled={!aiPrompt.trim() || generatingAi}
                        className="w-full"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Background
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="color" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        <Label htmlFor="bg-color">Primary Color</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="bg-color"
                            type="color"
                            value={tempColor1}
                            onChange={(e) => setTempColor1(e.target.value)}
                            className="h-10 w-16 cursor-pointer"
                          />
                          <span className="text-muted-foreground text-sm">
                            {gradientEnabled ? 'Gradient Start' : 'Solid Color'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gradient-toggle">Enable Gradient</Label>
                        <Switch
                          id="gradient-toggle"
                          checked={gradientEnabled}
                          onCheckedChange={setGradientEnabled}
                        />
                      </div>
                      {gradientEnabled && (
                        <div className="space-y-3">
                          <Label htmlFor="gradient-color-2">Secondary Color</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="gradient-color-2"
                              type="color"
                              value={tempColor2}
                              onChange={(e) => setTempColor2(e.target.value)}
                              className="h-10 w-16 cursor-pointer"
                            />
                            <span className="text-muted-foreground text-sm">Gradient End</span>
                          </div>
                        </div>
                      )}
                      <Button onClick={handleApplyColors} className="w-full">
                        <Palette className="mr-2 h-4 w-4" />
                        Apply Background
                      </Button>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Upload Image</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                      {uploadedImage && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Preview</p>
                          <img
                            src={uploadedImage}
                            alt="Uploaded background"
                            className="h-24 w-full rounded-md object-cover"
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

        </div>

        {/* Right Panel - Preview */}
        <div className="order-first space-y-4 lg:order-last">
          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <div className="rounded-lg border">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors md:p-4">
                <h2 className="font-semibold text-base md:text-lg">Preview</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${previewOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t p-3 md:p-4">
                  <PosterCanvas settings={settings} attribution={attribution} />
                  {!settings.quoteText && (
                    <p className="mt-4 text-center text-muted-foreground text-sm">
                      Enter a quote to see the full preview
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

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
