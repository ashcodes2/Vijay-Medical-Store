/**
 * fuzzyMatcher.js
 * Multi-tier text matching & confidence scoring engine for prescription medicine extraction.
 *
 * Compares raw OCR text against MongoDB product catalog using:
 * 1. Normalized exact substring matching
 * 2. Token overlap (Dice coefficient)
 * 3. Levenshtein edit distance for OCR typos / optical misreads
 */

// Common medical dosage/form noise words to filter during token matching
const STOP_WORDS = new Set([
  'tab', 'tabs', 'tablet', 'tablets',
  'cap', 'caps', 'capsule', 'capsules',
  'syp', 'syrup', 'suspension',
  'inj', 'injection',
  'cream', 'ointment', 'gel', 'drop', 'drops',
  'od', 'bd', 'tds', 'qid', 'sos', 'hs', 'stat',
  'daily', 'weekly', 'morning', 'night', 'noon',
  'after', 'before', 'food', 'meals',
  'strip', 'box', 'bottle', 'pack', 'pcs',
  'mg', 'ml', 'mcg', 'gm', 'g', 'iu',
  'dr', 'rx', 'patient', 'date', 'age', 'sex', 'name', 'sign'
]);

/**
 * Normalizes text: lowercases, removes non-alphanumeric punctuation, collapses spaces.
 */
function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts significant tokens from a string (excluding stop words and very short tokens).
 */
function getSignificantTokens(str) {
  const norm = normalize(str);
  return norm
    .split(' ')
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

/**
 * Calculates normalized similarity ratio [0, 1] based on Levenshtein distance.
 */
function levenshteinRatio(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return 1 - dist / maxLen;
}

/**
 * Computes Dice token similarity coefficient between two token arrays.
 */
function tokenDiceSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;

  let matches = 0;
  const setB = new Set(tokensB);

  for (const tokenA of tokensA) {
    if (setB.has(tokenA)) {
      matches++;
      continue;
    }
    // Check for 1-off fuzzy token match (e.g. "paracetaml" vs "paracetamol")
    for (const tokenB of tokensB) {
      if (tokenA.length >= 4 && tokenB.length >= 4) {
        if (levenshteinRatio(tokenA, tokenB) >= 0.8) {
          matches++;
          break;
        }
      }
    }
  }

  return (2 * matches) / (tokensA.length + tokensB.length);
}

/**
 * Matches raw OCR text against an array of product catalog items.
 *
 * @param {string} ocrRawText - Full text extracted from prescription image
 * @param {Array} products - MongoDB product documents
 * @returns {Array} Array of matched products with confidence scores, matched snippets, and stock status
 */
function matchPrescriptionToProducts(ocrRawText, products) {
  if (!ocrRawText || typeof ocrRawText !== 'string' || !Array.isArray(products)) {
    return [];
  }

  const rawLines = ocrRawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length >= 2);

  const matchedResults = [];

  for (const product of products) {
    const prodName = product.name || '';
    const normProdName = normalize(prodName);
    const prodTokens = getSignificantTokens(prodName);

    if (!normProdName || prodTokens.length === 0) continue;

    const brandToken = prodTokens[0]; // Primary medicine brand / active name (e.g. "paracetamol", "dolo")

    let bestScore = 0;
    let bestMatchedSnippet = '';

    // Pass 1: Line-by-line comparison
    for (const line of rawLines) {
      const normLine = normalize(line);
      const lineTokens = getSignificantTokens(line);

      if (!normLine || lineTokens.length === 0) continue;

      // 1.1 Exact substring match of full product name or brand token
      if (normLine.includes(normProdName)) {
        if (100 > bestScore) {
          bestScore = 100;
          bestMatchedSnippet = line;
        }
      } else if (brandToken && normLine.includes(brandToken)) {
        // Brand is fully present in line. Check if dosage or second token also matches
        const hasSecondToken = prodTokens.length > 1 && prodTokens.slice(1).some(t => normLine.includes(t));
        const score = hasSecondToken ? 95 : 90;
        if (score > bestScore) {
          bestScore = score;
          bestMatchedSnippet = line;
        }
      }

      // 1.2 Token Dice overlap
      const dice = tokenDiceSimilarity(prodTokens, lineTokens);
      if (dice > 0) {
        // Map dice [0.5, 1.0] to [75, 92]
        const diceScore = Math.min(94, Math.round(dice * 95));
        if (diceScore > bestScore) {
          bestScore = diceScore;
          bestMatchedSnippet = line;
        }
      }

      // 1.3 Fuzzy match on individual words in the line for OCR typos
      if (bestScore < 85 && brandToken && brandToken.length >= 4) {
        for (const token of lineTokens) {
          if (token.length >= 4) {
            const ratio = levenshteinRatio(brandToken, token);
            if (ratio >= 0.72) {
              // Map ratio [0.72, 1.0] to [60, 85]
              const fuzzyScore = Math.round(55 + (ratio - 0.72) * (30 / 0.28));
              if (fuzzyScore > bestScore) {
                bestScore = fuzzyScore;
                bestMatchedSnippet = line;
              }
            }
          }
        }
      }
    }

    // Pass 2: Whole-text fallback check if line-by-line missed a multi-line wrap
    if (bestScore < 60) {
      const normFull = normalize(ocrRawText);
      if (normFull.includes(normProdName)) {
        bestScore = 90;
        bestMatchedSnippet = prodName;
      } else if (brandToken && normFull.includes(brandToken)) {
        bestScore = 80;
        bestMatchedSnippet = brandToken;
      }
    }

    // Minimum threshold for clinical prescription relevance: 50%
    if (bestScore >= 50) {
      let confidenceLevel = 'LOW';
      if (bestScore >= 80) {
        confidenceLevel = 'HIGH';
      } else if (bestScore >= 65) {
        confidenceLevel = 'MEDIUM';
      }

      const availableStock = typeof product.stock === 'number' ? product.stock : 0;
      const imageUrl = product.image || (Array.isArray(product.images) && product.images[0]) || '';

      matchedResults.push({
        productId: product._id ? product._id.toString() : product.id,
        name: product.name,
        category: product.category || 'Pharmacy',
        price: product.price || 0,
        stock: availableStock,
        isOutOfStock: availableStock <= 0,
        image: imageUrl,
        matchedText: bestMatchedSnippet.slice(0, 80),
        confidenceScore: bestScore,
        confidenceLevel,
      });
    }
  }

  // Sort matched products: Highest confidence first, then in-stock before out-of-stock
  matchedResults.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
  });

  return matchedResults;
}

module.exports = {
  normalize,
  getSignificantTokens,
  levenshteinDistance,
  levenshteinRatio,
  tokenDiceSimilarity,
  matchPrescriptionToProducts,
};
