import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const translationCache = new Map<string, string>();

/**
 * A hook that translates text dynamically when the language changes.
 * Especially useful for market titles from external APIs.
 */
export function useTranslate(text: string) {
    const { i18n } = useTranslation();
    const [translated, setTranslated] = useState(text);
    const isChinese = i18n.language.startsWith('zh');
    const targetLang = isChinese ? 'zh' : 'en';

    useEffect(() => {
        // If text is empty or targeting English (source is usually English), return original
        if (!text || !isChinese) {
            setTranslated(text);
            return;
        }

        const cacheKey = `${text}_${targetLang}`;
        if (translationCache.has(cacheKey)) {
            setTranslated(translationCache.get(cacheKey)!);
            return;
        }

        const translate = async () => {
            try {
                // Using a free Google Translate endpoint for demonstration
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    const result = data[0][0][0];
                    translationCache.set(cacheKey, result);
                    setTranslated(result);
                }
            } catch (error) {
                console.error('Dynamic translation failed:', error);
                setTranslated(text);
            }
        };

        const timer = setTimeout(translate, 300); // Debounce to avoid excessive calls
        return () => clearTimeout(timer);
    }, [text, isChinese, targetLang]);

    return translated;
}
