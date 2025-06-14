import React, { useState } from 'react';
import '../assets/css/ProfilePage.css';

const EditProfilePage = () => {
  const [profile, setProfile] = useState({
    name: 'Sophia Carter',
    university: 'University of InnovaTech',
    course: 'Computer Science',
    description: 'Passionate about coding and building innovative solutions.',
    cgpa: '8.6',
    courses: 'DS, AI/ML, DBMS, OS',
    certifications: 'Python (Coursera), ML (Udemy)',
    skills: 'Python, Java, Figma, AutoCAD',
    languages: 'English, Hindi, Kannada',
    careerInterests: 'AI/ML, Full-Stack, UI/UX',
    projects: 'Virtual Trial Room, Chatbot, E-commerce site',
    links: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });

  const [photo, setPhoto] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuCl05wgBwfqs7LKRTkHmvoAh2qcrz3NPuyC6Gd0Q2HNoF_kJ8reB1VmdO5O8jmMhSmKWpNQrCLQf0nYnY_3h7_lOgvivltGhMSLz4WgSCRBcL68aB07TEOUcIOGerhREUrgSFR_Fwr8DG4JWatwMPHHIA0e3NGJ-jQsLb1kqPWX71lrPQOLcPAYXrX9NTT6BAqeUF7ogrEefY-CFK8v5jgyoItbAuFWT5kIMuRJouf9qewkD7aw9m_lsY5MyAJzgJusvrL7fMieNKI");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [name]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated!');
    // Save logic here
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <label className="avatar-edit-label">
          <div
            className="avatar editable"
            style={{ backgroundImage: `url(${photo})` }}
          >
            <span className="edit-icon">📷</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </label>
        <div className="profile-info">
          <h1>Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {/* form fields as before */}
        <label>Name:<input name="name" value={profile.name} onChange={handleChange} /></label>
        <label>University:<input name="university" value={profile.university} onChange={handleChange} /></label>
        <label>Course:<input name="course" value={profile.course} onChange={handleChange} /></label>
        <label>Description:<textarea name="description" value={profile.description} onChange={handleChange} /></label>

        <h3>Academic & Skills</h3>
        <label>CGPA:<input name="cgpa" value={profile.cgpa} onChange={handleChange} /></label>
        <label>Courses:<input name="courses" value={profile.courses} onChange={handleChange} /></label>
        <label>Certifications:<input name="certifications" value={profile.certifications} onChange={handleChange} /></label>
        <label>Skills:<input name="skills" value={profile.skills} onChange={handleChange} /></label>
        <label>Languages:<input name="languages" value={profile.languages} onChange={handleChange} /></label>

        <h3>Career</h3>
        <label>Career Interests:<input name="careerInterests" value={profile.careerInterests} onChange={handleChange} /></label>
        <label>Projects:<input name="projects" value={profile.projects} onChange={handleChange} /></label>
        <label>LinkedIn:<input name="linkedin" value={profile.links.linkedin} onChange={handleLinkChange} /></label>
        <label>GitHub:<input name="github" value={profile.links.github} onChange={handleLinkChange} /></label>
        <label>Portfolio:<input name="portfolio" value={profile.links.portfolio} onChange={handleLinkChange} /></label>

        <div className="button-group">
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
