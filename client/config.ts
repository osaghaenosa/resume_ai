// Safely access environment variables with defaults
const getEnvVar = (key: string, defaultValue: string): string => {
    try {
        // In a Vite/Create-React-App environment, these are accessed via `import.meta.env` or `process.env`
        // We will use process.env as a standard.
        const value = process.env[key];
        return value !== undefined ? value : defaultValue;
    } catch (e) {
        // process.env might not be defined in all contexts (e.g., plain browser).
        return defaultValue;
    }
};

// Parse values, providing fallbacks if the env vars are not set.
export const FREE_TOKENS = parseInt(getEnvVar('REACT_APP_FREE_TOKENS', '10'), 10);
export const PRO_TOKENS = parseInt(getEnvVar('REACT_APP_PRO_TOKENS', '100'), 10);
export const PRO_PRICE = parseInt(getEnvVar('REACT_APP_PRO_PRICE', '20'), 10);
