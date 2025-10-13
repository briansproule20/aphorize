'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  alt_description?: string;
}

interface PexelsPhoto {
  id: number;
  src: {
    large: string;
    medium: string;
  };
  photographer: string;
  photographer_url: string;
  url: string;
  alt?: string;
}

interface PhotoSearchProps {
  onSelectPhoto: (url: string, attribution: { photographer: string; url: string }) => void;
}

export default function PhotoSearch({ onSelectPhoto }: PhotoSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [pexelsResults, setPexelsResults] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('unsplash');

  const searchUnsplash = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Unsplash');
      }

      const data = await response.json();
      setUnsplashResults(data.results || []);
    } catch (err) {
      setError('Failed to search Unsplash. Check your API key in .env.local');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchPexels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=landscape`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Pexels');
      }

      const data = await response.json();
      setPexelsResults(data.photos || []);
    } catch (err) {
      setError('Failed to search Pexels. Check your API key in .env.local');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (activeTab === 'unsplash') {
      await searchUnsplash();
    } else {
      await searchPexels();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo-search">Search Photos</Label>
          <div className="flex gap-2">
            <Input
              id="photo-search"
              placeholder="e.g., nature, sunset, mountains"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" disabled={loading || !searchQuery.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
          <TabsTrigger value="pexels">Pexels</TabsTrigger>
        </TabsList>

        <TabsContent value="unsplash" className="space-y-4">
          {unsplashResults.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {unsplashResults.map((photo) => (
                <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={photo.urls.small}
                    alt={photo.alt_description || 'Unsplash photo'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-white text-xs">
                      Photo by{' '}
                      <a
                        href={photo.user.links.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {photo.user.name}
                      </a>
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        onSelectPhoto(photo.urls.regular, {
                          photographer: photo.user.name,
                          url: photo.user.links.html,
                        })
                      }
                    >
                      Use Photo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {unsplashResults.length === 0 && !loading && searchQuery && (
            <p className="text-center text-muted-foreground text-sm">
              No results found. Try a different search term.
            </p>
          )}
        </TabsContent>

        <TabsContent value="pexels" className="space-y-4">
          {pexelsResults.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {pexelsResults.map((photo) => (
                <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={photo.src.medium}
                    alt={photo.alt || 'Pexels photo'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-white text-xs">
                      Photo by{' '}
                      <a
                        href={photo.photographer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {photo.photographer}
                      </a>
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        onSelectPhoto(photo.src.large, {
                          photographer: photo.photographer,
                          url: photo.photographer_url,
                        })
                      }
                    >
                      Use Photo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pexelsResults.length === 0 && !loading && searchQuery && (
            <p className="text-center text-muted-foreground text-sm">
              No results found. Try a different search term.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
