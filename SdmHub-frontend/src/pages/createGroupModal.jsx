// createGroupModal.jsx
import React from "react";
import ReactDOM from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import axios from "axios";
import {chatService} from "../services/chat.service"
import { uploadService } from "../services/api.service";

const API_BASE = "http://localhost:3000/api";
const CreateGroupModal = ({
  onClose,
  groupName,
  setGroupName,
  memberSearch,
  setMemberSearch,
  users,
  selectedMembers,
  setSelectedMembers
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState(null);
  const [groupPhotoFile, setGroupPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);


  const generateInitialAvatar = (name) => {
    if (!name) return "";
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join("");

    return `https://ui-avatars.com/api/?name=${initials}&background=4a90e2&color=fff&size=256`;
  };

  const searchMembers = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const res = await axios.get(
      `${API_BASE}/users/search?query=${encodeURIComponent(query)}`,
      { withCredentials: true }
    );

    const results = (res.data || []).map((u) => ({
      id: u._id || u.id,
      name: u.name || u.first_name,
      profile_pic: u.profile_pic || u.profilePic,
    }));

    setSearchResults(results);
  } catch (err) {
    console.error("Member search error:", err);
  }
};

const debouncedSearch = useCallback(
  debounce(searchMembers, 300),
  []
);

useEffect(() => {
  return () => debouncedSearch.cancel();
}, [debouncedSearch]);



  const handleAddMember = (user) => {
    if (selectedMembers.some((m) => m.id === user.id)) return;
    setSelectedMembers([...selectedMembers, user]);
  };

  const handleRemoveMember = (id) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== id));
  };

  const handleGroupPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGroupPhotoFile(file);
    setGroupPhotoPreview(URL.createObjectURL(file));
  };

  const uploadGroupPhoto = async () => {
    if (!groupPhotoFile) return null;

    const formData = new FormData();
    formData.append("file", groupPhotoFile);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!groupName.trim() || selectedMembers.length === 0) return;

  try {
    setUploading(true);

    let groupPicUrl = null;

    if (groupPhotoFile) {
      const res = await uploadService.uploadProfilePic(groupPhotoFile);
      groupPicUrl = res.data.url;
    } else {
      groupPicUrl =
        "https://res.cloudinary.com/drvcis27v/image/upload/v1765713050/pexels-minan1398-1222949_yx8mfd.jpg";
    }

    const payload = {
      title: groupName,
      members: selectedMembers.map((m) => m.id),
      convo_pic: groupPicUrl,
    };

    await chatService.createGroup(payload);

    onClose();
  } catch (err) {
    console.error("Create group failed:", err);
  } finally {
    setUploading(false);
  }
};


  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Group</h3>

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <input
            type="text"
            className="modal-input"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          {/* Group Photo (Optional) */}
          <div className="group-photo-section">
            <input
              type="file"
              id="group-photo-input"
              accept="image/*"
              hidden
              onChange={handleGroupPhotoChange}
            />

            <label htmlFor="group-photo-input" className="group-photo-uploader">
              {groupPhotoPreview ? (
                <div className="group-photo-preview-wrapper">
                    <img
                      src={groupPhotoPreview}
                      alt="Group preview"
                      className="group-photo-preview"
                    />
                    <div className="group-photo-overlay">
                      Change
                    </div>
                  </div>
              ) : (
                <div className="group-photo-placeholder">
                  <span className="photo-icon">📷</span>
                  <span className="photo-text">Add group photo</span>
                  <span className="photo-subtext">Optional</span>
                </div>
              )}
            </label>
          </div>



          {/* Member Search */}
          <input
            type="text"
            className="modal-input"
            placeholder="Search members"
            value={memberSearch}
            onChange={(e) => {
              const value = e.target.value;
              setMemberSearch(value);
              debouncedSearch(value); // 🔥 API call happens here
            }}
          />


          {/* Search Results */}
          <div className="member-list">
              {searchResults
                .filter((u) => !selectedMembers.some((m) => m.id === u.id))
                .map((u) => (
                  <div
                    key={u.id}
                    className="member-item"
                    onClick={() => handleAddMember(u)}
                  >
                    <img src={u.profile_pic} alt={u.name} />
                    <span>{u.name}</span>
                  </div>
                ))}
            </div>


          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="selected-members">
              {selectedMembers.map((m) => (
                <div key={m.id} className="member-chip">
                  {m.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={uploading || !groupName || selectedMembers.length === 0}
            >
              {uploading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default CreateGroupModal;
