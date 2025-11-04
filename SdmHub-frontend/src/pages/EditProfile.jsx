import React, { useState, useEffect } from 'react';
import '../assets/css/ProfilePage.css';
import { apiService, uploadService } from '../services/api.service';
import usePageTitle from '../hooks/usePageTitle';

const EditProfilePage = () => {
  usePageTitle('Edit Profile');
  const [profile, setProfile] = useState({
    first_name: '',
    name: '',
    university: '',
    course: '',
    description: '',
    email: '',
    USN: '',
    user_profile: 'Student',
    department: '',
    graduation_year: '',
    enrollment_year: '',
    bio: '',
    cgpa: '',
    courses: '',
    certifications: '',
    skills: '',
    languages: '',
    careerInterests: '',
    projects: '',
    clubs: '',
    events: '',
    profile_pic: '',
    profile_pic_public_id: '',
    links: {
      linkedin: '',
      github: '',
      portfolio: '',
      instagram: ''
    }
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.get('/auth/profile');
        if (response.data.success) {
          const userData = response.data.user;
          setProfile({
            first_name: userData.first_name || '',
            name: userData.name || '',
            university: userData.university || '',
            course: userData.course || '',
            description: userData.description || '',
            email: userData.email || '',
            USN: userData.USN || '',
            user_profile: userData.user_profile || 'Student',
            department: userData.department || '',
            graduation_year: userData.graduation_year || '',
            enrollment_year: userData.enrollment_year || '',
            bio: userData.bio || '',
            cgpa: userData.cgpa || '',
            courses: userData.courses || '',
            certifications: userData.certifications || '',
            skills: userData.skills || '',
            languages: userData.languages || '',
            careerInterests: userData.careerInterests || '',
            projects: userData.projects || '',
            clubs: userData.clubs || '',
            events: userData.events || '',
            profile_pic: userData.profile_pic || '',
            profile_pic_public_id: userData.profile_pic_public_id || '',
            links: {
              linkedin: userData.links?.linkedin || '',
              github: userData.links?.github || '',
              portfolio: userData.links?.portfolio || '',
              instagram: userData.links?.instagram || ''
            }
          });
          setCompletionPercentage(userData.profile_completion || 0);
        } else {
          console.error('Failed to fetch profile:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file");
        return;
      }

      try {
        const response = await uploadService.uploadProfilePic(file);
        if (response.data.success) {
          setProfile(prev => ({
            ...prev,
            profile_pic: response.data.url,
            profile_pic_public_id: response.data.public_id
          }));
          // Immediately update profile picture in the database
          const dbResponse = await apiService.updateProfilePic(response.data.url, response.data.public_id);
          if (dbResponse.data.success) {
            alert("Profile picture uploaded and updated successfully!");
          } else {
            alert("Image uploaded but failed to update profile: " + dbResponse.data.message);
          }
        } else {
          alert("Image upload failed: " + response.data.message);
        }
      } catch (error) {
        console.error("Error uploading image or updating profile:", error);
        alert("Error uploading image or updating profile. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/auth/editprofile', profile);
      if (response.data.success) {
        setCompletionPercentage(Math.floor(response.data.profile_completion));
        alert('Profile updated successfully!');
        if (response.data.profile_completion >= 60) {
          window.location.href = '/feed';
        }
      } else {
        alert('Failed to update profile: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <label className="avatar-edit-label">
          <div
            className="avatar editable"
            style={{ 
              backgroundImage: profile.profile_pic 
                ? `url(${profile.profile_pic})` 
                : 'url(https://res.cloudinary.com/drvcis27v/image/upload/v1750180422/default_rxs4pw.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
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
          <div className="completion-status">
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="completion-text">
              Profile Completion: {Math.floor(completionPercentage)}%
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <label>First Name:<input name="first_name" value={profile.first_name} onChange={handleChange} /></label>
        <label>Email:<input name="email" value={profile.email} onChange={handleChange} /></label>
        <label>USN:<input name="USN" value={profile.USN} onChange={handleChange} /></label>
        <label>User Profile:
          <select name="user_profile" aria-placeholder='Student/Alumni/Faculty' value={profile.user_profile} onChange={handleChange}>
            <option value="Student">Student</option>
            <option value="Alumni">Alumni</option>
            <option value="Faculty">Faculty</option>
          </select>
        </label>
        <label>Department:<input name="department" value={profile.department} onChange={handleChange} /></label>
        <label>Graduation Year:<input name="graduation_year" value={profile.graduation_year} onChange={handleChange} /></label>
        <label>Enrollment Year:<input name="enrollment_year" value={profile.enrollment_year} onChange={handleChange} /></label>
        <label>Bio:<textarea name="bio" value={profile.bio} onChange={handleChange} /></label>
        <label>Course:<input name="course" value={profile.course} onChange={handleChange} /></label>
        <label>Description:<textarea name="description" value={profile.description} onChange={handleChange} /></label>
        <h3>Academic & Skills</h3>
        <label>CGPA:<input name="cgpa" value={profile.cgpa} onChange={handleChange} /></label>
        <label>Courses:<input name="courses" value={profile.courses} onChange={handleChange} /></label>
        <label>Certifications:<input name="certifications" value={profile.certifications} onChange={handleChange} /></label>
        <label>Skills:<input name="skills" value={profile.skills} onChange={handleChange} /></label>
        <label>Languages:<input name="languages" value={profile.languages} onChange={handleChange} /></label>
        <h3>Professional & Career</h3>
        <label>Career Interests:<input name="careerInterests" value={profile.careerInterests} onChange={handleChange} /></label>
        <label>Projects:<input name="projects" value={profile.projects} onChange={handleChange} /></label>
        <label>LinkedIn:<input name="linkedin" value={profile.links.linkedin} onChange={handleLinkChange} /></label>
        <label>GitHub:<input name="github" value={profile.links.github} onChange={handleLinkChange} /></label>
        <label>Portfolio:<input name="portfolio" value={profile.links.portfolio} onChange={handleLinkChange} /></label>
        <label>Instagram:<input name="instagram" value={profile.links.instagram} onChange={handleLinkChange} /></label>
        <h3>Community & Social</h3>
        <label>Clubs:<input name="clubs" value={profile.clubs} onChange={handleChange} /></label>
        <label>Events:<input name="events" value={profile.events} onChange={handleChange} /></label>
        <div className="button-group">
          <button type="submit" style={{ fontFamily: 'Playfair Display' }}>Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
