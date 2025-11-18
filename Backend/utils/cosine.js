// utils/cosine.js
function cosineSimilarityMap(mapA, mapB) {
  const keys = new Set([...mapA.keys(), ...mapB.keys()]);
  let dot = 0, magA = 0, magB = 0;
  for (let k of keys) {
    const a = mapA.get(k) || 0;
    const b = mapB.get(k) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

module.exports = { cosineSimilarityMap };
