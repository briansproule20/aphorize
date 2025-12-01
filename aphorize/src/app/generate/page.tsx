'use client';

import { useChat } from '@ai-sdk/react';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { CopyIcon, MessageSquare, ImageIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInButton from '@/app/_components/echo/sign-in-button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
    value: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
  },
  {
    name: 'Claude Sonnet 3.5',
    value: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
  },
  {
    name: 'Claude Haiku 3.5',
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

export default function GenerateQuotePage() {
  const router = useRouter();
  const { user, isLoading } = useEcho();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [provider, setProvider] = useState<string>(models[0].provider);

  // Generate parameters
  const [occasion, setOccasion] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('short');
  const [audience, setAudience] = useState('');

  const { messages, sendMessage, status } = useChat();

  if (!isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl tracking-tight">
              Generate Quotes
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Sign in to create original quotes with AI
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const messageText = input.trim() || generatePromptFromSettings();

    if (messageText || occasion || tone || audience) {
      const body: any = {
        model: model,
        provider: provider,
        mode: 'generate',
        occasion: occasion,
        tone: tone,
        length: length,
        audience: audience,
      };

      sendMessage({ text: messageText || generatePromptFromSettings() }, { body });
      setInput('');
    }
  };

  const generatePromptFromSettings = () => {
    let prompt = 'Generate a quote';
    if (occasion) prompt += ` for ${occasions.find((o) => o.value === occasion)?.label || occasion}`;
    if (tone) prompt += ` with a ${tone} tone`;
    if (audience) prompt += ` for ${audience}`;
    if (length) prompt += ` (${lengths.find((l) => l.value === length)?.label || length})`;
    return prompt;
  };

  const handlePosterize = (quoteText: string) => {
    localStorage.setItem('pendingQuote', quoteText);
    router.push('/poster');
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">Generate AI Quotes</h1>
        <p className="text-muted-foreground text-sm">
          Create original, memorable quotes tailored to your specific needs
        </p>
      </div>

      <div className="flex h-full min-h-0 flex-col">
        {/* Generate Form */}
        <Card className="mb-4 p-4">
          <div className="grid gap-4">
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
        </Card>

        {/* Chat conversation */}
        <Conversation className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No quotes yet"
                description="Fill out the form above to generate AI quotes"
              />
            ) : (
              messages.map((message) => (
                <div key={message.id}>
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
            placeholder="Optional: Add specific details or requirements..."
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                  const selectedModel = models.find((m) => m.value === value);
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
            <PromptInputSubmit status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
