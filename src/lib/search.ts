import axios from 'axios';

const API_KEY = 'AIzaSyDS9Z5FtSMagZG4YxBhPmffx0yL9pw1Y30';
const SEARCH_ENGINE_ID = 'a4391b8fa2c814156';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        num: 5
      }
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
  } catch (error) {
    console.error('Google Search Error:', error);
    throw new Error('Arama yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}