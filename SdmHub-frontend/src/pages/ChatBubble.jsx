import React, { useState, useRef, useEffect } from 'react';
import '../assets/css/style.css';

const ChatBubble = ({id, sender, message, timestamp, onDelete}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message);
  const bubbleRef = useRef(null);

  // Hide menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
        setShowMenu(false);
        if (editing) cancelEdit();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [editing]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const saveEdit = () => {
    onEdit(id, editText.trim());
    setEditing(false);
    setShowMenu(false);
  };

  const cancelEdit = () => {
    setEditText(message);
    setEditing(false);
    setShowMenu(false);
  };

  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      ref={bubbleRef}
      className={`chat-bubble-container ${sender === 'you' ? 'align-right' : 'align-left'}`}
      onContextMenu={handleContextMenu}
    >
      <div className={`chat-bubble ${sender}`}>
        {editing ? (
          <>
            <textarea
              className="edit-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
            />
            <div className="edit-buttons">
              <button className="save-btn" onClick={saveEdit} disabled={editText.trim() === ''}>Save</button>
              <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          </>
        ) : (
          <>{message}</>
        )}
        <div className="message-meta">
          <span className="timestamp">{formattedTime}</span>
          {sender === 'you' 
          // && (
          //   <span className={`status ${status.toLowerCase()}`}>
          //     {/* {status === 'seen' ? '✓✓' : status === 'delivered' ? '✓' : ''} */}
          //   </span>
          // )
          }
        </div>
      </div>

      {/* Context menu */}
       {showMenu && !editing && (
        <ul className="context-menu">
          <li onClick={() => { onDelete(id); setShowMenu(false); }}>Delete</li>
          <li onClick={() => { onForward(id); setShowMenu(false); }}>Forward</li>
          <li onClick={() => { onCopy(message); setShowMenu(false); }}>Copy</li>
          <li onClick={() => { setEditing(true); }}>Edit</li>
        </ul>
      )}
    </div>
  );
};

export default ChatBubble;
