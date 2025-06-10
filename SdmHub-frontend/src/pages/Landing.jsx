import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import {
  FaSun,
  FaMoon,
  FaUsers,
  FaBook,
  FaCalendarAlt,
  FaUserFriends,
  FaShieldAlt,
  FaComments,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa'; // Import all the Fa icons you're using
import '../assets/css/Landing.css';
import { useNavigate } from 'react-router-dom';


const Landing = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 8px rgba(255,255,255,0.7)",
      transition: {
        duration: 0.3,
        yoyo: Infinity
      }
    },
    tap: { scale: 0.95 }
  };

  const testimonialVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="App">
      <motion.header
        className={`header ${isHeaderScrolled ? 'scrolled-background' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <div className="container">
          <motion.div
            className="logo"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            SDMHUB
          </motion.div>
          <nav className="nav-links">
            <motion.a href="#features" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000', scale: 1.05 }}>Features</motion.a>
            <motion.a href="#how-it-works" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000', scale: 1.05 }}>How It Works</motion.a>
            <motion.a href="#testimonials" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000', scale: 1.05 }}>Testimonials</motion.a>
            <motion.a href="#faq" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000', scale: 1.05 }}>FAQ</motion.a>
            <motion.a href="#contact" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000', scale: 1.05 }}>Contact</motion.a>
          </nav>
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <motion.span
                  key="moon"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaSun />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaMoon />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      <section className="hero-section">
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          >
            Connect, Collaborate, and Thrive within Your College Community
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
          >
            The exclusive social hub for SDM students and alumni. Your private network to connect with classmates, discover opportunities, and build lasting relationships.
          </motion.p>
          <motion.button
            className="hero-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.5, type: "spring", stiffness: 200 }}
            onClick={() => navigate('/sign')} 
          >
            Join SDMHUB Now
          </motion.button>
          <motion.button
  className="hero-button"
  variants={buttonVariants}
  whileHover="hover"
  whileTap="tap"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 1.6, duration: 0.5, type: "spring", stiffness: 200 }}
  onClick={() => navigate('/login')} // 👈 This is the routing part
>
  Login Now
</motion.button>

        </div>
        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3" alt="Students collaborating" />
        </motion.div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            Why Choose SDMHUB?
          </motion.h2>
          <div className="features-grid">
            <motion.div
              className="feature-item left-block"
              initial={{ x: -200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            >
              <div className="feature-icon"><FaUsers /></div>
              <h3>Connect with Peers</h3>
              <p>Easily find and connect with classmates, faculty, and alumni from SDM.</p>
            </motion.div>
            <motion.div
              className="feature-item center-block"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.2 }}
            >
              <div className="feature-icon"><FaBook /></div>
              <h3>Academic Collaboration</h3>
              <p>Form study groups, share resources, and collaborate on projects securely.</p>
            </motion.div>
            <motion.div
              className="feature-item right-block"
              initial={{ x: 200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.4 }}
            >
              <div className="feature-icon"><FaCalendarAlt /></div>
              <h3>Event Updates</h3>
              <p>Stay informed about college events, workshops, and social gatherings.</p>
            </motion.div>
            <motion.div
              className="feature-item"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.6 }}
            >
              <div className="feature-icon"><FaUserFriends /></div>
              <h3>Networking</h3>
              <p>Connect with alumni for mentorship, career advice, and job opportunities.</p>
            </motion.div>
            <motion.div
              className="feature-item"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.8 }}
            >
              <div className="feature-icon"><FaShieldAlt /></div>
              <h3>Secure & Private</h3>
              <p>A trusted space just for your college community.</p>
            </motion.div>
            <motion.div
              className="feature-item"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 1.0 }}
            >
              <div className="feature-icon"><FaComments /></div>
              <h3>Direct Messaging</h3>
              <p>Communicate privately with your connections.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.h2>
          <div className="steps-container">
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your profile using your college email</p>
            </motion.div>
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="step-number">2</div>
              <h3>Connect</h3>
              <p>Find friends, join groups, and explore your community</p>
            </motion.div>
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="step-number">3</div>
              <h3>Engage</h3>
              <p>Share updates, participate in discussions, and attend events</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            What Our Users Say
          </motion.h2>
          <div className="testimonials-grid">
            <motion.div
              className="testimonial-card"
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3" alt="Student" />
              <p>"This platform has been a game-changer for finding study partners and staying updated on campus events!"</p>
              <h4>Sarah Johnson</h4>
              <span>Computer Science</span>
            </motion.div>
            <motion.div
              className="testimonial-card"
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3" alt="Student" />
              <p>"The networking opportunities through SDMHUB helped me land my dream internship!"</p>
              <h4>Michael Chen</h4>
              <span>Business Administration</span>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="faq-grid">
            <motion.div
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3>Is this platform secure?</h3>
              <p>Yes, we use industry-standard encryption and security measures to protect your data.</p>
            </motion.div>
            <motion.div
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3>Who can join?</h3>
              <p>Current students, faculty, and alumni of SDM can join using their college email.</p>
            </motion.div>
            <motion.div
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <h3>Is it free to use?</h3>
              <p>Yes, SDMHUB is completely free for all SDM community members.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Experience Your College Like Never Before?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Join SDMHUB today and become part of your college's digital community.
          </motion.p>
          <motion.button
            className="hero-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            Get Started Now
          </motion.button>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-links">
            <motion.a href="#" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000' }}>Privacy Policy</motion.a>
            <motion.a href="#" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000' }}>Terms of Service</motion.a>
            <motion.a href="#" whileHover={{ color: isDarkMode ? '#B22222' : '#8B0000' }}>Support</motion.a>
          </div>
          <div className="social-icons">
            <motion.a href="https://facebook.com/sdmhub" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, color: '#3b5998' }}><FaFacebook /></motion.a>
            <motion.a href="https://twitter.com/sdmhub" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, color: '#00acee' }}><FaTwitter /></motion.a>
            <motion.a href="https://instagram.com/sdmhub" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, color: '#C13584' }}><FaInstagram /></motion.a>
            <motion.a href="https://linkedin.com/company/sdmhub" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, color: '#0077b5' }}><FaLinkedin /></motion.a>
          </div>
          <p>&copy; {new Date().getFullYear()} SDMHUB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;