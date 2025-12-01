import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DotBackground } from '@/components/ui/dot-background';
import { MessageSquare, Sparkles, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <DotBackground className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-6 text-center sm:space-y-8">
          {/* Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              <span className="block bg-gradient-to-r from-[rgb(26,26,26)] to-[rgb(203,182,130)] dark:from-[rgb(245,243,239)] dark:to-[rgb(203,182,130)] bg-clip-text text-transparent">Aphorize Quotes</span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg md:text-xl">
              Find inspiration, generate original quotes with AI, or design stunning posters
              to share your favorite words of wisdom.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="mx-auto grid max-w-5xl gap-4 pt-6 sm:gap-6 sm:grid-cols-2 sm:pt-8 lg:grid-cols-3">
            {/* Find Quotes */}
            <Link href="/find" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 text-left">
                    <CardTitle className="text-xl">Find Quotes</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Search through thousands of memorable quotes from history&apos;s greatest minds
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary group-hover:text-primary"
                  >
                    Start searching →
                  </Button>
                </CardHeader>
              </Card>
            </Link>

            {/* Generate Quotes */}
            <Link href="/generate" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 text-left">
                    <CardTitle className="text-xl">Generate Quotes</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create original quotes with AI - funny, inspirational, or absurdly profound
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary group-hover:text-primary"
                  >
                    Create with AI →
                  </Button>
                </CardHeader>
              </Card>
            </Link>

            {/* Create Posters */}
            <Link href="/poster" className="group sm:col-span-2 lg:col-span-1">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 text-left">
                    <CardTitle className="text-xl">Create Posters</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Design beautiful quote posters with custom backgrounds, fonts, and styles
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary group-hover:text-primary"
                  >
                    Design poster →
                  </Button>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="pt-6 sm:pt-8">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Powered by <a href="https://echo.merit.systems/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Merit System&apos;s Echo</a>
            </p>
          </div>
        </div>
      </section>
    </DotBackground>
  );
}
