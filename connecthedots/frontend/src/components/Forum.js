import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Forum.css';

const Forum = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchTopic();
    fetchPosts();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/topics/${topicId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch topic');
      }

      const data = await response.json();
      setTopic(data);
    } catch (error) {
      setError('Failed to load topic');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/posts/?topic=${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newPost,
          topic: topicId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPostData = await response.json();
      setPosts([newPostData, ...posts]);
      setNewPost('');
      setShowAddPost(false);
    } catch (error) {
      setError('Failed to create post');
    }
  };

  if (loading) return <div className="forum-container">Loading...</div>;
  if (error) return <div className="forum-container error-message">{error}</div>;

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>{topic?.topicName}</h1>
        <button
          className="add-post-button"
          onClick={() => setShowAddPost(true)}
        >
          Add Post
        </button>
      </div>

      {showAddPost && (
        <div className="add-post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write your post here..."
            className="post-textarea"
          />
          <div className="form-actions">
            <button onClick={handleSubmitPost} className="submit-button">
              Submit
            </button>
            <button
              onClick={() => {
                setShowAddPost(false);
                setNewPost('');
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-content">
              <p>{post.content}</p>
              <div className="post-footer">
                <div className="post-info">
                  <span className="post-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="post-author">{post.author.username}</span>
                </div>
                <div className="post-author-image">
                  {post.author.profile_image ? (
                    <img
                      src={post.author.profile_image}
                      alt={post.author.username}
                      className="author-image"
                    />
                  ) : (
                    <div className="author-image-placeholder">
                      {post.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum; 