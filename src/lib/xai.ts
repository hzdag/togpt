import OpenAI from 'openai';
import axios from 'axios';
import { usePreferences } from '../store/preferences';
import { generateSystemPrompt } from './config/prompts';
import type { GeminiMessage } from './types/gemini';

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export class XAIChat {
    private client: OpenAI;
    private history: GeminiMessage[] = [];
    private controller: AbortController | null = null;
    private lastResponse: string = '';
    public isAborted: boolean = false;

    constructor() {
        this.client = new OpenAI({
            apiKey: 'xai-wUW0j3FicxrUVZcRrT11O1nQvgByJXsTBIgK9FNN3HXik6UzlzjQa1q9BrvTrCvXsdA8gyz0B039xhH1',
            dangerouslyAllowBrowser: true,
            baseURL: 'https://api.x.ai/v1'
        });
    }

    private formatResponse(response: string): string {
        // Format links properly
        let formattedResponse = response.replace(
            /\[([^\]]+)\]\((object Object|undefined|null)\)/g,
            (_, title) => {
                const searchQuery = encodeURIComponent(title);
                if (title.toLowerCase().includes('wikipedia')) {
                    return `[${title}](https://wikipedia.org/wiki/${searchQuery})`;
                } else if (title.toLowerCase().includes('kaynak')) {
                    return `[${title}](https://scholar.google.com/scholar?q=${searchQuery})`;
                } else {
                    return `[${title}](https://www.google.com/search?q=${searchQuery})`;
                }
            }
        );

        // Add proper spacing for sections
        formattedResponse = formattedResponse
            .replace(/\n\*\*([^*]+)\*\*/g, '\n\n**$1**\n') // Add spacing around headers
            .replace(/^[-*]\s/gm, '• ') // Convert bullets to dots
            .replace(/^\s{2,}[-*]\s/gm, '◦ ') // Convert sub-bullets
            .replace(/\n{3,}/g, '\n\n') // Normalize spacing
            .trim();

        // Format resource section
        if (formattedResponse.includes('Kaynaklar:')) {
            formattedResponse = formattedResponse.replace(
                /Kaynaklar:\n((?:[-•]\s*.*\n?)*)/g,
                (match, sources) => {
                    const formattedSources = sources
                        .split('\n')
                        .filter(Boolean)
                        .map(source => source.replace(/^[-•]\s*/, ''))
                        .map(source => `• ${source}`)
                        .join('\n');
                    return `\n**Kaynaklar:**\n${formattedSources}`;
                }
            );
        }

        return formattedResponse;
    }

    async sendMessage(message: string): Promise<string> {
        try {
            this.isAborted = false;
            this.controller = new AbortController();

            this.history.push({ role: 'user', parts: message });

            const { preferences } = usePreferences.getState();
            const systemPrompt = generateSystemPrompt(preferences);

            const completion = await this.client.chat.completions.create({
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt + "\n\nÖnemli: Kısa ve öz yanıtlar ver."
                    },
                    ...this.history.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : 'user',
                        content: msg.parts
                    })),
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                stream: false
            }, {
                signal: this.controller.signal
            });

            if (this.isAborted) {
                this.history.pop();
                return '';
            }

            const response = completion.choices[0]?.message?.content?.trim() || '';
            const cleanResponse = this.formatResponse(response);
            this.lastResponse = cleanResponse;
            this.history.push({ role: 'model', parts: cleanResponse });
            
            return cleanResponse;
        } catch (error) {
            if (this.isAborted) {
                this.history.pop();
                return '';
            }
            
            console.error('X.AI Error:', error);
            throw new Error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            this.controller = null;
        }
    }

    async continueGeneration(): Promise<string> {
        try {
            const completion = await this.client.chat.completions.create({
                model: 'grok-beta',
                messages: [
                    ...this.history.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : 'user',
                        content: msg.parts
                    })),
                    {
                        role: 'user',
                        content: 'Lütfen kaldığın yerden devam et.'
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                stream: false
            }, {
                signal: this.controller?.signal
            });

            const response = completion.choices[0]?.message?.content?.trim() || '';
            const cleanResponse = this.formatResponse(response);
            this.lastResponse = cleanResponse;
            
            return cleanResponse;
        } catch (error) {
            console.error('Continue generation error:', error);
            throw new Error('Yanıtı devam ettirirken bir hata oluştu.');
        }
    }

    abortGeneration() {
        if (this.controller) {
            this.isAborted = true;
            this.controller.abort();
            this.controller = null;
        }
    }

    resetChat() {
        this.history = [];
        this.lastResponse = '';
    }

    setHistory(messages: { role: 'user' | 'assistant'; content: string }[]) {
        this.history = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: msg.content
        }));
        this.lastResponse = '';
    }
}