export const COMPILER_LANGUAGES = {
    c: 50,
    cpp: 54,
    java: 62,
    javascript: 63,
    python: 71,
} as const;

export type CompilerLanguage = keyof typeof COMPILER_LANGUAGES;