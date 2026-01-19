import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const translationCache = new Map<string, string>();

/**
 * A hook that translates text dynamically when the language changes.
 * Especially useful for market titles from external APIs.
 *
 * Optimized with:
 * - Proper cleanup to prevent memory leaks
 * - Request deduplication via pending requests map
 * - Cache for already translated content
 */
const pendingRequests = new Map<string, Promise<string>>();

export function useTranslate(text: string) {
    const { i18n } = useTranslation();
    const [translated, setTranslated] = useState(text);
    const isChinese = i18n.language.startsWith('zh');
    const targetLang = isChinese ? 'zh' : 'en';
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

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

        // Deduplicate concurrent requests for same text
        let requestPromise = pendingRequests.get(cacheKey);
        if (!requestPromise) {
            requestPromise = (async () => {
                try {
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data && data[0] && data[0][0] && data[0][0][0]) {
                        const result = data[0][0][0];
                        translationCache.set(cacheKey, result);
                        return result;
                    }
                    return text;
                } catch (error) {
                    console.error('Dynamic translation failed:', error);
                    return text;
                } finally {
                    pendingRequests.delete(cacheKey);
                }
            })();
            pendingRequests.set(cacheKey, requestPromise);
        }

        // Apply translation with debounce
        const timer = setTimeout(() => {
            requestPromise!.then((result) => {
                if (isMountedRef.current) {
                    setTranslated(result);
                }
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            isMountedRef.current = false;
        };
    }, [text, isChinese, targetLang]);

    return translated;
}
