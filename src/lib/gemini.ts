import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { usePreferences } from '../store/preferences';
import { GEMINI_CONFIGS } from './config/gemini';
import { handleGeminiError } from './utils/errorHandler';
import { generateSystemPrompt } from './config/prompts';
import type { GeminiMessage } from './types/gemini';

const API_KEY = 'AIzaSyCAtFc-EAXTS14tebvSfC-h84vqgDwTgSI';

export class GeminiChat {
    private model: GenerativeModel;
    private chat: any;
    private history: GeminiMessage[] = [];
    private controller: AbortController | null = null;
    private currentConfig: string | null = null;
    private lastResponse: string = '';
    public isAborted: boolean = false;
    private retryCount: number = 0;
    private readonly MAX_RETRIES = 2;
    private readonly RETRY_DELAY = 500;

    constructor() {
        this.initModel();
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

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getGenerationConfig() {
        const { preferences } = usePreferences.getState();
        const speed = preferences.responseSpeed;
        const config = {
            ...GEMINI_CONFIGS[speed],
            maxOutputTokens: Math.min(GEMINI_CONFIGS[speed].maxOutputTokens, 800),
            candidateCount: 1,
            stopSequences: ['\n\n\n']
        };

        const configChanged = this.currentConfig !== speed;
        this.currentConfig = speed;

        return { config, configChanged };
    }

    private initModel() {
        try {
            if (!API_KEY) {
                throw new Error('API anahtarı bulunamadı.');
            }

            const { config } = this.getGenerationConfig();
            const genAI = new GoogleGenerativeAI(API_KEY);
            this.model = genAI.getGenerativeModel({
                model: 'gemini-1.5-pro',
                generationConfig: config,
            });
            this.initChat();
        } catch (error) {
            console.error('Failed to initialize Gemini model:', error);
            throw new Error('AI modelini başlatırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    }

    private initChat() {
        try {
            const { preferences } = usePreferences.getState();
            const systemPrompt = generateSystemPrompt(preferences) + "\n\nÖnemli: Kısa ve öz yanıtlar ver.";

            const initialHistory: GeminiMessage[] = [
                {
                    role: 'user',
                    parts: systemPrompt
                },
                {
                    role: 'model',
                    parts: 'Anlaşıldı, kısa ve öz yanıtlar vereceğim.'
                },
                ...this.history
            ];

            this.chat = this.model.startChat({
                history: initialHistory,
                generationConfig: {
                    maxOutputTokens: 800
                }
            });
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            throw new Error('Sohbeti başlatırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    }

    async sendMessage(message: string): Promise<string> {
        if (!message?.trim()) {
            throw new Error('Lütfen bir mesaj girin.');
        }

        while (this.retryCount < this.MAX_RETRIES) {
            try {
                this.isAborted = false;
                this.controller = new AbortController();

                const { configChanged } = this.getGenerationConfig();
                if (configChanged) {
                    this.initModel();
                }

                this.history.push({ role: 'user', parts: message });

                const result = await this.chat.sendMessage(
                    message,
                    { signal: this.controller.signal }
                );

                if (this.isAborted) {
                    this.history.pop();
                    return '';
                }

                if (!result?.response) {
                    throw new Error('Yanıt alınamadı. Lütfen tekrar deneyin.');
                }

                const response = await result.response.text();
                const cleanResponse = this.formatResponse(response);
                this.lastResponse = cleanResponse;

                this.history.push({ role: 'model', parts: cleanResponse });
                this.retryCount = 0;
                return cleanResponse;

            } catch (error) {
                if (this.isAborted) {
                    this.history.pop();
                    return '';
                }

                this.retryCount++;
                
                if (this.retryCount >= this.MAX_RETRIES) {
                    console.error('Max retries reached for Gemini API:', error);
                    this.retryCount = 0;
                    throw new Error('Şu anda AI servisi yanıt vermiyor. Lütfen daha sonra tekrar deneyin.');
                }

                console.warn(`Retry attempt ${this.retryCount}/${this.MAX_RETRIES}`);
                await this.delay(this.RETRY_DELAY * this.retryCount);
                this.initModel();
            }
        }

        throw new Error('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }

    async continueGeneration(): Promise<string> {
        try {
            const result = await this.chat.sendMessage(
                "Lütfen kaldığın yerden devam et.",
                { signal: this.controller?.signal }
            );

            if (!result?.response) {
                throw new Error('Devam eden yanıt alınamadı.');
            }

            const response = await result.response.text();
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