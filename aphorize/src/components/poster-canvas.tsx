'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export interface PosterSettings {
  quoteText: string;
  author?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  padding: number;
  textColor: string;
  textShadow: boolean;
  textStroke: boolean;
  watermark: boolean;
  showQuotes?: boolean;
  showPunctuation?: boolean;
  imageUrl?: string;
  backgroundColor: string;
}

interface PosterCanvasProps {
  settings: PosterSettings;
  width?: number;
  height?: number;
  attribution?: {
    photographer: string;
    url: string;
  };
}

export default function PosterCanvas({
  settings,
  width = 1080,
  height = 1080,
  attribution,
}: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Draw lines
    lines.forEach((lineText) => {
      ctx.fillText(lineText, x, currentY);
      if (settings.textStroke) {
        ctx.strokeText(lineText, x, currentY);
      }
      currentY += lineHeight;
    });

    return currentY;
  };

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (settings.imageUrl) {
      const img = new window.Image();
      // Only set crossOrigin for external URLs, not data URLs
      if (!settings.imageUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = settings.imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image to cover canvas
          const aspectRatio = img.width / img.height;
          const canvasAspectRatio = width / height;

          let drawWidth = width;
          let drawHeight = height;
          let offsetX = 0;
          let offsetY = 0;

          if (aspectRatio > canvasAspectRatio) {
            // Image is wider
            drawWidth = height * aspectRatio;
            offsetX = -(drawWidth - width) / 2;
          } else {
            // Image is taller
            drawHeight = width / aspectRatio;
            offsetY = -(drawHeight - height) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          resolve(null);
        };
        img.onerror = (error) => {
          console.error('Image load error:', error);
          reject(error);
        };
      }).catch((error) => {
        console.error('Failed to load background image:', error);
        // Continue rendering with fallback color
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, width, height);
      });
    } else {
      // Use solid background color or gradient
      if (settings.backgroundColor.includes('linear-gradient')) {
        // Parse gradient string to extract colors
        const gradientMatch = settings.backgroundColor.match(/linear-gradient\([^,]+,\s*([^)]+)\)/);
        if (gradientMatch) {
          const colorStops = gradientMatch[1].split(/,\s*(?![^(]*\))/);
          
          // Create linear gradient (diagonal from top-left to bottom-right)
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          
          colorStops.forEach((stop) => {
            const parts = stop.trim().match(/^(.+?)\s+(\d+)%$/);
            if (parts) {
              const color = parts[1].trim();
              const position = parseInt(parts[2]) / 100;
              gradient.addColorStop(position, color);
            }
          });
          
          ctx.fillStyle = gradient;
        } else {
          // Fallback to solid color
          ctx.fillStyle = '#1A1A1A';
        }
      } else {
        // Solid color
        ctx.fillStyle = settings.backgroundColor;
      }
      ctx.fillRect(0, 0, width, height);
    }

    // Add overlay for better text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Set text properties with font fallbacks to ensure quotation marks render properly
    const fontStack = settings.fontFamily.includes(',') 
      ? settings.fontFamily 
      : `${settings.fontFamily}, serif`;
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px ${fontStack}`;
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = settings.textAlign;
    ctx.textBaseline = 'top';

    // Text shadow
    if (settings.textShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    // Text stroke
    if (settings.textStroke) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
    }

    // Calculate text position
    let textX = settings.padding;
    if (settings.textAlign === 'center') {
      textX = width / 2;
    } else if (settings.textAlign === 'right') {
      textX = width - settings.padding;
    }

    const maxWidth = width - settings.padding * 2;
    const lineHeight = settings.fontSize * settings.lineHeight;

    // Draw quote text with optional quotation marks
    const quoteText = settings.showQuotes !== false 
      ? `"${settings.quoteText}"`
      : settings.quoteText;
    
    const quoteEndY = wrapText(
      ctx,
      quoteText,
      textX,
      settings.padding + height * 0.2,
      maxWidth,
      lineHeight
    );

    // Draw author with optional em dash
    if (settings.author) {
      const authorFontStack = settings.fontFamily.includes(',') 
        ? settings.fontFamily 
        : `${settings.fontFamily}, serif`;
      ctx.font = `${settings.fontWeight} ${settings.fontSize * 0.7}px ${authorFontStack}`;
      const authorText = settings.showPunctuation !== false 
        ? `— ${settings.author}`
        : settings.author;
      ctx.fillText(authorText, textX, quoteEndY + lineHeight * 0.5);
    }

    // Draw watermark
    if (settings.watermark) {
      ctx.shadowColor = 'transparent';
      ctx.font = '400 16px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'right';
      ctx.fillText('Created with Aphorize', width - 20, height - 20);
    }

    // Draw attribution if photo is used
    if (attribution) {
      ctx.shadowColor = 'transparent';
      ctx.font = '400 14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      ctx.fillText(`Photo by ${attribution.photographer}`, 20, height - 20);
    }

    setIsRendering(false);
  };

  useEffect(() => {
    renderCanvas();
  }, [settings, width, height, attribution]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aphorize-quote-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="mx-auto w-full max-w-full md:max-h-[600px] md:w-auto"
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">Rendering...</div>
          </div>
        )}
      </div>

      <Button onClick={handleDownload} className="w-full" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Download PNG
      </Button>

      {attribution && (
        <p className="text-center text-muted-foreground text-xs">
          Photo by{' '}
          <a
            href={attribution.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            {attribution.photographer}
          </a>
        </p>
      )}
    </div>
  );
}
