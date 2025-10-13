'use client';

import { useChat } from '@ai-sdk/react';
import { CopyIcon, MessageSquare, ImageIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Action, Actions } from '@/components/ai-elements/actions';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const models = [
  {
    name: 'Claude Sonnet 4',
    value: 'claude-sonnet-4',
    provider: 'anthropic',
  },
  {
    name: 'Claude Sonnet 3.5',
    value: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
  },
  {
    name: 'Claude Haiku',
    value: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
  },
  {
    name: 'GPT 4o',
    value: 'gpt-4o',
    provider: 'openai',
  },
];

const occasions = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'condolence', label: 'Condolence' },
  { value: 'congratulations', label: 'Congratulations' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'general', label: 'General' },
];

const tones = [
  { value: 'sincere', label: 'Sincere' },
  { value: 'witty', label: 'Witty' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
];

const lengths = [
  { value: 'short', label: 'Short (1 sentence)' },
  { value: 'medium', label: 'Medium (2-3 sentences)' },
  { value: 'long', label: 'Long (paragraph)' },
];

const ChatBotDemo = () => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value); // Default to Claude Sonnet 4
  const [provider, setProvider] = useState<string>(models[0].provider);
  const [mode, setMode] = useState<'search' | 'generate'>('generate');

  // Search mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchTags, setSearchTags] = useState('');

  // Generate mode state
  const [occasion, setOccasion] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('short');
  const [audience, setAudience] = useState('');

  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate prompt from settings if no manual input
    const messageText = input.trim() || generatePromptFromSettings();

    // Only require settings to be filled, not manual input
    const hasRequiredSettings = mode === 'search' ? searchQuery.trim() : (occasion || tone || audience);

    if (messageText || hasRequiredSettings) {
      const body: any = {
        model: model,
        provider: provider,
        mode: mode,
      };

      if (mode === 'search') {
        body.query = searchQuery;
        body.author = searchAuthor;
        body.tags = searchTags.split(',').map((t) => t.trim()).filter(Boolean);
        body.allowAiQuote = true; // Always allow AI quotes as fallback
      } else {
        body.occasion = occasion;
        body.tone = tone;
        body.length = length;
        body.audience = audience;
      }

      sendMessage({ text: messageText || generatePromptFromSettings() }, { body });
      setInput('');
    }
  };

  const generatePromptFromSettings = () => {
    if (mode === 'search') {
      return `Find quotes about: ${searchQuery}${searchAuthor ? ` by ${searchAuthor}` : ''}`;
    } else {
      let prompt = 'Generate a quote';
      if (occasion) prompt += ` for ${occasions.find(o => o.value === occasion)?.label || occasion}`;
      if (tone) prompt += ` with a ${tone} tone`;
      if (audience) prompt += ` for ${audience}`;
      if (length) prompt += ` (${lengths.find(l => l.value === length)?.label || length})`;
      return prompt;
    }
  };

  const handlePosterize = (quoteText: string) => {
    // Store the quote in localStorage and navigate to poster builder
    localStorage.setItem('pendingQuote', quoteText);
    router.push('/poster');
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        {/* Tabs for Find vs Generate */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'search' | 'generate')} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Find Quote</TabsTrigger>
            <TabsTrigger value="generate">Generate Quote</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Keywords or Topic</Label>
                <Input
                  id="search-query"
                  placeholder="e.g., courage, success, happiness"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-author">Author (optional)</Label>
                  <Input
                    id="search-author"
                    placeholder="e.g., Einstein"
                    value={searchAuthor}
                    onChange={(e) => setSearchAuthor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-tags">Tags (comma-separated)</Label>
                  <Input
                    id="search-tags"
                    placeholder="wisdom, life"
                    value={searchTags}
                    onChange={(e) => setSearchTags(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger id="occasion">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occ) => (
                        <SelectItem key={occ.value} value={occ.value}>
                          {occ.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger id="length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience (optional)</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., entrepreneurs, graduates"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat conversation */}
        <Conversation className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No quotes yet"
                description={`Use the ${mode === 'search' ? 'Find' : 'Generate'} tab above to get started`}
              />
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'assistant' &&
                    message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter((part) => part.type === 'source-url').length
                          }
                        />
                        {message.parts
                          .filter((part) => part.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response key={`${message.id}-${i}`}>{part.text}</Response>
                              </MessageContent>
                            </Message>
                            {message.role === 'assistant' && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => navigator.clipboard.writeText(part.text)}
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() => handlePosterize(part.text)}
                                  label="Posterize"
                                >
                                  <ImageIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                          </Fragment>
                        );
                      case 'reasoning':
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === 'streaming' &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))
            )}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Prompt input */}
        <PromptInput onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder={`${mode === 'search' ? 'Optional: Describe your search...' : 'Optional: Describe the quote...'} (or just use settings above and submit)`}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                  const selectedModel = models.find(m => m.value === value);
                  if (selectedModel) {
                    setProvider(selectedModel.provider);
                  }
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={mode === 'search' ? !searchQuery.trim() : false}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
