import React, { useEffect, useState, useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Forum = () => {
  const {topicId } = useParams(); 
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  const fetchTopicName = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/topics/${topicId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      setTopicName(data.topicName);
      setTopicDescription(data.description);
    } catch (error) {
      console.error('Error fetching topic:', error);
    }
  }, [topicId]);

  useEffect(() => {
    fetchTopicName();
  }, [fetchTopicName]);

  const fetchPosts = useCallback(async () => {   
    const response = await fetch(`${API_URL}/api/forums/posts/?topic=${topicId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,  
      }
    });
    const data = await response.json();
    const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setPosts(sortedData);
  }, [topicId]);  
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/topics/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setAvailableTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreatePost = async () => {
    if (newPost.length > 500) {
      alert('Character limit exceeded!');
      return;
    }

    await fetch(`${API_URL}/api/forums/posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content: newPost, topic: topicId })
    });

    setNewPost('');
    setShowForm(false);
    fetchPosts();
  };

  const handleEditPost = async (postId, newContent) => {
    try {
      const response = await fetch(`${API_URL}/api/forums/posts/${postId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          content: newContent,
          topic: topicId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to edit post');
      }

      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error editing post:', error);
      alert(error.message || 'Failed to edit post. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/forums/posts/${postId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleAtClick = (relatedTopicId) => {
    navigate(`topic/${relatedTopicId}`);
  };

  const parseContent = (content) => {
    const parts = content.split(/(@[^@\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const topicName = part.substring(1);
        const topic = availableTopics.find(t => t.topicName === topicName);
        if (topic) {
          return (
            <span
              key={index}
              onClick={() => navigate(`/topic/${topic.id}`)}
              style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  const handlePostChange = (e, isEditing = false) => {
    const value = e.target.value;
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    
    if (isEditing) {
      setEditingPost({...editingPost, content: value});
    } else {
      setNewPost(value);
    }

    // Check for @ symbol and show suggestions
    const textBeforeCursor = value.substring(0, cursorPosition);
    const match = textBeforeCursor.match(/@([^@\s]*)$/);
    
    if (match) {
      const searchTerm = match[1].toLowerCase();
      const filteredTopics = availableTopics.filter(topic => 
        topic.topicName.toLowerCase().includes(searchTerm)
      );
      
      if (filteredTopics.length > 0) {
        const rect = textarea.getBoundingClientRect();
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
        const lines = textBeforeCursor.split('\n').length;
        
        setSuggestionPosition({
          top: rect.top + (lines * lineHeight),
          left: rect.left + (match[0].length * 8) // Approximate character width
        });
        setTopicSuggestions(filteredTopics);
      } else {
        setTopicSuggestions([]);
      }
    } else {
      setTopicSuggestions([]);
    }
  };

  const handleTopicSelect = (topic, isEditing = false) => {
    const textarea = document.querySelector(isEditing ? '.edit-textarea' : '.post-textarea');
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = (isEditing ? editingPost.content : newPost).substring(0, cursorPosition);
    const textAfterCursor = (isEditing ? editingPost.content : newPost).substring(cursorPosition);
    
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.substring(0, lastAtIndex) + 
                   `@${topic.topicName} ` + 
                   textAfterCursor;
    
    if (isEditing) {
      setEditingPost({...editingPost, content: newText});
    } else {
      setNewPost(newText);
    }
    setTopicSuggestions([]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Forum - {topicName}</h1>
        <div style={styles.topicDescription}>
          <h3>Topic Description:</h3>
          <p>{topicDescription || 'No description available'}</p>
        </div>
      </div>

      <div style={styles.buttonsContainer}>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Post'}
        </button>
        <button style={styles.button} onClick={() => navigate(`/topic/${topicId}/graph`)}>
          Go to Knowledge Graph
        </button>
        <button style={styles.button} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <textarea
            className="post-textarea"
            style={styles.textarea}
            value={newPost}
            onChange={(e) => handlePostChange(e)}
            maxLength={500}
            placeholder="Write your post... (max 500 characters)"
          />
          {topicSuggestions.length > 0 && (
            <div style={{
              ...styles.suggestionsBox,
              top: suggestionPosition.top,
              left: suggestionPosition.left
            }}>
              {topicSuggestions.map(topic => (
                <div
                  key={topic.id}
                  style={styles.suggestionItem}
                  onClick={() => handleTopicSelect(topic)}
                >
                  {topic.topicName}
                </div>
              ))}
            </div>
          )}
          <button style={styles.submitButton} onClick={handleCreatePost}>Submit</button>
        </div>
      )}

      <div style={styles.postsContainer}>
        {posts.map((post) => (
          <div key={post.id} style={styles.postCard}>
            <div style={styles.threeDots}>
              <button
                style={styles.dotButton} 
                onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
              >
                ⋮
              </button>
              {showDropdown === post.id && (
                <div style={styles.dropdown}>
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => {
                      setEditingPost(post);
                      setShowDropdown(null);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => {
                      handleDeletePost(post.id);
                      setShowDropdown(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {editingPost && editingPost.id === post.id ? (
              <div style={styles.editForm}>
                <textarea
                  className="edit-textarea"
                  style={styles.editTextarea}
                  value={editingPost.content}
                  onChange={(e) => handlePostChange(e, true)}
                  maxLength={500}
                />
                {topicSuggestions.length > 0 && (
                  <div style={{
                    ...styles.suggestionsBox,
                    top: suggestionPosition.top,
                    left: suggestionPosition.left
                  }}>
                    {topicSuggestions.map(topic => (
                      <div
                        key={topic.id}
                        style={styles.suggestionItem}
                        onClick={() => handleTopicSelect(topic, true)}
                      >
                        {topic.topicName}
                      </div>
                    ))}
                  </div>
                )}
                <div style={styles.editButtons}>
                  <button 
                    style={styles.editButton}
                    onClick={() => handleEditPost(post.id, editingPost.content)}
                  >
                    Save
                  </button>
                  <button 
                    style={styles.cancelButton}
                    onClick={() => setEditingPost(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.postContent}>
                {parseContent(post.content)}
              </div>
            )}
            <div style={styles.postFooter}>
              {post.username} | {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '20px',
  },
  header: {
    margin: 0,
    flex: 1,
  },
  topicDescription: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  formContainer: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    fontSize: '16px',
    marginBottom: '10px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  postsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  postCard: {
    position: 'relative',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    minHeight: '120px',
  },
  postContent: {
    fontSize: '16px',
    marginBottom: '30px',
  },
  postFooter: {
    position: 'absolute',
    bottom: '10px',
    right: '15px',
    fontSize: '12px',
    color: 'gray',
  },
  threeDots: {
    position: 'absolute',
    top: '10px',
    right: '15px',
  },
  dotButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'white',
    textAlign: 'left',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  editForm: {
    marginBottom: '20px',
  },
  editTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  editButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  suggestionsBox: {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
};

export default Forum;
