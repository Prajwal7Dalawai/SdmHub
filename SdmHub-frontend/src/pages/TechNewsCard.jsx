import React, { useEffect, useState } from "react";
import { userService } from "../services/user.service";
import "../assets/css/style.css";

const TechNewsCard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await userService.getTechNews();
        setNews(res.news.articles || []);
      } catch (err) {
        console.error("Failed to fetch tech news", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="tech-news-card">Loading tech news...</div>;
  }

  return (
    <div className="tech-news-card">
      <h3 className="tech-news-title">Tech News</h3>

      <ul className="tech-news-list">
        {news.map((item, index) => (
          <li
            key={index}
            className="tech-news-item"
            onClick={() => window.open(item.url, "_blank")}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TechNewsCard;
