import en from '$lang/__en.js';
import tr from '$lang/__tr.js';
import { writable, derived, get } from 'svelte/store';

const stored_lang = localStorage.getItem('lang') || 'en';
export const LANG = writable(stored_lang);

const LANGUAGES = { en, tr };

export const TINTERNAL = (key, fallback) =>
    derived(LANG, ($lang) => {
        const keys = key.includes(':') ? key.split(':') : key.split('.');

        let value = LANGUAGES[$lang];

        for (let k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`[TRANSLATION NOT FOUND] '${$lang}' -> '${key}'`);
                return fallback || key;
            }
        }

        return value;
    });


export function T(key, fallback) {
    const lang = get(LANG);
    const LANGUAGES = { en, tr };
    const value = LANGUAGES[lang];

    let result = value;
    const keys = key.includes(':') ? key.split(':') : key.split('.');

    for (let k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            console.warn(`[TRANSLATION NOT FOUND] '${lang}' -> '${key}'`);
            return fallback || key;
        }
    }
    return result;
}
export function TRANSLATE(key, fallback) {
    const lang = get(LANG);
    const LANGUAGES = { en, tr };
    const value = LANGUAGES[lang];

    let result = value;
    const keys = key.includes(':') ? key.split(':') : key.split('.');

    for (let k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            console.warn(`[TRANSLATION NOT FOUND] '${lang}' -> '${key}'`);
            return fallback || key;
        }
    }
    return result;
}