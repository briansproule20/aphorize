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
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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

export default function FindQuotePage() {
  const router = useRouter();
  const { user, isLoading } = useEcho();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [provider, setProvider] = useState<string>(models[0].provider);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const { messages, sendMessage, status } = useChat();

  if (!isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl tracking-tight">
              Find Quotes
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Sign in to search through thousands of memorable quotes
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

    if (messageText || searchQuery.trim()) {
      const body: any = {
        model: model,
        provider: provider,
        mode: 'search',
        query: searchQuery,
        author: searchAuthor,
        tags: searchTags.split(',').map((t) => t.trim()).filter(Boolean),
        allowAiQuote: true,
      };

      sendMessage({ text: messageText || generatePromptFromSettings() }, { body });
      setInput('');
    }
  };

  const generatePromptFromSettings = () => {
    return `Find quotes about: ${searchQuery}${searchAuthor ? ` by ${searchAuthor}` : ''}`;
  };

  const handlePosterize = (quoteText: string) => {
    localStorage.setItem('pendingQuote', quoteText);
    router.push('/poster');
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">Find Real Quotes</h1>
        <p className="text-muted-foreground text-sm">
          Search our database of authentic quotes from historical figures and authors
        </p>
      </div>

      <div className="flex h-full min-h-0 flex-col">
        {/* Search Form */}
        <Card className="mb-4 p-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Keywords or Topic *</Label>
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
                  placeholder="e.g., Einstein, Shakespeare"
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
        </Card>

        {/* Chat conversation */}
        <Conversation className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No quotes yet"
                description="Enter keywords above to find real quotes"
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
                              <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
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
            placeholder="Optional: Describe your search in more detail..."
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
            <PromptInputSubmit disabled={!searchQuery.trim()} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
