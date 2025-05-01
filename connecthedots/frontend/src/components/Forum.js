import React, { useEffect, useState, useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Forum = () => {
  const {topicId } = useParams(); 
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  const handleDeletePost = async (postId) => {
    await fetch(`${API_URL}/api/forums/posts/${postId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,  
      },
    });
    fetchPosts();
  };

  const handleAtClick = (relatedTopicId) => {
    navigate(`topic/${relatedTopicId}`);
  };

  const parseContent = (content) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const topicName = part.substring(1);
        return (
          <span
            key={index}
            onClick={() => handleAtClick(topicName)}
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Forum - Topic {topicId}</h1>

      <div style={styles.buttonsContainer}>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Post'}
        </button>
        <button style={styles.button} onClick={() => navigate('/graph')}>
          Go to Knowledge Graph
        </button>
        <button style={styles.button} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <textarea
            style={styles.textarea}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            maxLength={500}
            placeholder="Write your post... (max 500 characters)"
          />
          <button style={styles.submitButton} onClick={handleCreatePost}>Submit</button>
        </div>
      )}

      <div style={styles.postsContainer}>
        {posts.map((post) => (
          <div key={post.id} style={styles.postCard}>
            <div style={styles.threeDots}>
              <button style={styles.dotButton} onClick={() => handleDeletePost(post.id)}>⋮</button>
            </div>
            <div style={styles.postContent}>
              {parseContent(post.content)}
            </div>
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
  header: {
    textAlign: 'center',
    marginBottom: '20px',
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
  }
};

export default Forum;
