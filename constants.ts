
/**
 * Transaction descriptions containing these phrases (case-insensitive) 
 * will be filtered out and moved to the excluded table.
 */
export const EXCLUDED_PHRASES = [
  "payment thank you - web",
  "payment thank you-mobile",
  "bp fuel",
  "kroger fuel",
  "total wine"
];

/**
 * Transaction descriptions starting with this string (case-insensitive)
 * will be filtered out.
 */
export const EXCLUDED_PREFIXES = [
  "bp#"
];
