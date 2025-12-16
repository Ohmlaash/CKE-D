/**
 * Generates a Map for O(1) character lookup from the key string.
 * Optimized to ignore subsequent duplicates in the key to ensure deterministic encoding.
 */
export const generateKeyMap = (key: string): Map<string, number> => {
  const map = new Map<string, number>();
  // Use a simple for loop for max performance on strings
  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    if (!map.has(char)) {
       map.set(char, i + 1);
    }
  }
  return map;
};

/**
 * Removes duplicate characters from a key string to ensure 1:1 mapping.
 */
export const cleanKey = (key: string): string => {
  return Array.from(new Set(key.split(''))).join('');
};

/**
 * Identifies duplicate characters in a key for validation.
 */
export const getDuplicateChars = (key: string): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const char of key) {
    if (seen.has(char)) {
      duplicates.add(char);
    }
    seen.add(char);
  }
  return Array.from(duplicates);
};

/**
 * Validates if a string is strictly Base64 compliant.
 * Ignores whitespace which is common in formatted Base64.
 */
export const isValidBase64 = (str: string): boolean => {
  if (!str) return true;
  const clean = str.replace(/\s/g, '');
  if (clean.length === 0) return true;
  // Regex for standard Base64 (Alphanumeric + '+' + '/' + optional padding '=')
  return /^[A-Za-z0-9+/=]+$/.test(clean);
};

/**
 * Sanitizes input for Base64 encoding by removing whitespace.
 * This prevents "Character not found" errors for newlines/spaces.
 */
export const sanitizeBase64Input = (str: string): string => {
  return str.replace(/\s/g, '');
};

/**
 * Encodes input string using the key map.
 * Returns the result string and a boolean indicating if unmapped characters were found.
 */
export const encodeString = (
  input: string, 
  keyMap: Map<string, number>, 
  separator: string
): { result: string; hasUnmapped: boolean } => {
  if (!input) return { result: '', hasUnmapped: false };

  const result: string[] = [];
  let hasUnmapped = false;
  
  // Sanitize input if we assume Base64 encoding behavior (strip invisible chars not in map)
  // However, strict mapping means we only map what we find.
  // The caller should sanitize if needed.
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const index = keyMap.get(char);
    
    if (index !== undefined) {
      result.push(index.toString());
    } else {
      // Keep original char but flag it
      result.push(char);
      if (char.trim() !== '') hasUnmapped = true; 
    }
  }

  return { result: result.join(separator), hasUnmapped };
};

/**
 * Decodes the input string using the key string.
 */
export const decodeString = (
  encoded: string,
  key: string,
  separator: string
): { result: string; hasErrors: boolean } => {
  if (!encoded || !key) return { result: '', hasErrors: false };

  const result: string[] = [];
  let hasErrors = false;

  if (separator === '') {
    // Continuous mode (only reliable for keys <= 9 chars usually)
    for (let i = 0; i < encoded.length; i++) {
      const char = encoded[i];
      const code = char.charCodeAt(0);
      if (code >= 48 && code <= 57) { // 0-9
         const index = parseInt(char, 10);
         if (index > 0 && index <= key.length) {
           result.push(key[index - 1]);
         } else {
           result.push(char); 
           hasErrors = true;
         }
      } else {
         result.push(char);
         if (char.trim() !== '') hasErrors = true;
      }
    }
  } else {
    // Separator mode
    // We treat any sequence of whitespace as a separator split if separator is space
    // Otherwise strict split.
    // For robust decoding of space-separated values, we split by regex for whitespace if separator is ' '
    const parts = separator === ' ' ? encoded.split(/\s+/) : encoded.split(separator);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '') continue; 

      const index = parseInt(part, 10);
      if (!isNaN(index)) {
        if (index > 0 && index <= key.length) {
          result.push(key[index - 1]);
        } else {
          result.push(part); 
          hasErrors = true;
        }
      } else {
        // If the part is not a number (e.g. random text pasted in), keep it
        result.push(part); 
        hasErrors = true;
      }
    }
  }

  return { result: result.join(''), hasErrors };
};

// Preset keys
export const PRESETS = {
  // Comprehensive Base64 key including Data URI characters
  BASE64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=:;,-.",
};