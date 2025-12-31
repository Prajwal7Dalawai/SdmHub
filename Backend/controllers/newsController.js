const getTechNews = async (req, res) => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?q=Technology&from=2025-12-30&sortBy=popularity&apiKey=${process.env.NEWS_API}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Failed to fetch news from provider"
      });
    }

    const data = await response.json(); // 🔥 THIS WAS MISSING

    return res.status(200).json({
      success: true,
      news: data
    });

  } catch (err) {
    console.error("Tech news fetch failed:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getTechNews };
