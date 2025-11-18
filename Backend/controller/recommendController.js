// controllers/recommendController.js
const User = require('../models/userSchema');
const natural = require('natural');
const TfIdf = natural.TfIdf;
const { cosineSimilarityMap } = require('../utils/cosine');

// helper: join all relevant fields into one normalized string
function userToText(u) {
  const combine = (str) => (str ? str.toLowerCase().replace(/[^\w\s]/g, ' ') : '');
  return [
    combine(u.careerInterests),
    combine(u.skills),
    combine(u.courses),
    combine(u.projects),
    combine(u.clubs)
  ].join(' ');
}

// controller
exports.getInterestRecommendations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const topN = parseInt(req.query.n || '10', 10);

    const current = await User.findById(userId).lean();
    if (!current) return res.status(404).json({ msg: 'User not found' });

    // fetch all users excluding current + existing friends
    const friendIds = new Set((current.friendsList || []).map(f => String(f.friendId)));
    const candidates = await User.find({ _id: { $ne: current._id } }).lean();

    // prepare TF-IDF corpus
    const tfidf = new TfIdf();
    const docs = candidates.map(userToText);
    docs.forEach(d => tfidf.addDocument(d));

    const currentText = userToText(current);
    tfidf.addDocument(currentText);
    const currentIndex = docs.length;

    // convert doc terms to vector map
    const docVec = (idx) => {
      const terms = tfidf.listTerms(idx);
      return new Map(terms.map(t => [t.term, t.tfidf]));
    };

    const currentVec = docVec(currentIndex);
    const scores = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (friendIds.has(String(candidate._id))) continue; // skip already friends
      const vec = docVec(i);
      const score = cosineSimilarityMap(currentVec, vec);
      scores.push({
        user: {
          _id: candidate._id,
          first_name: candidate.first_name,
          department: candidate.department,
          profile_pic: candidate.profile_pic
        },
        score: parseFloat(score.toFixed(3))
      });
    }

    scores.sort((a, b) => b.score - a.score);
    return res.json(scores.slice(0, topN));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
