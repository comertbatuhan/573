import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
    fetchUserTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/topics/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load topics');
      setLoading(false);
    }
  };

  const fetchUserTopics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/usertopics/user-topics/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user topics');
      const data = await response.json();
      setUserTopics(data);
    } catch (error) {
      console.error('Failed to load user topics');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/topics/?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError('Failed to search topics');
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/topics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ topicName: newTopicName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create topic');
      }

      const newTopic = await response.json();
      setTopics([...topics, { id: newTopic.id, name: newTopic.topicName, interactions: 0 }]);
      setNewTopicName('');
      setShowCreateTopic(false);
    } catch (error) {
      console.error('Error creating topic:', error);
      alert(error.message);
    }
  };

  const displayTopics = searchQuery ? searchResults : topics;

  const getActionType = (topic) => {
    const actions = [];
    if (topic.created) actions.push('Created');
    if (topic.addedNode) actions.push('Added Node');
    if (topic.posted) actions.push('Posted');
    return actions.join(', ');
  };

  const handleTopicClick = (topicId) => {
    navigate(`/topic/${topicId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          <Link to="/profile" className="profile-button">
            Profile
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="topics-section">
          <div className="topics-header">
            <h2>{searchQuery ? 'Search Results' : 'Most Interacted Topics'}</h2>
            <button
              className="create-topic-button"
              onClick={() => setShowCreateTopic(true)}
            >
              Create Topic
            </button>
          </div>

          {showCreateTopic && (
            <div className="create-topic-form">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Enter topic name"
                className="topic-input"
              />
              <button onClick={handleCreateTopic} className="submit-button">
                Create
              </button>
              <button onClick={() => setShowCreateTopic(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          )}

          <div className="topics-list">
            {loading ? (
              <div className="loading">Loading topics...</div>
            ) : displayTopics.length === 0 ? (
              <div className="no-results">
                {searchQuery ? 'No topics found matching your search.' : 'No topics available.'}
              </div>
            ) : (
              displayTopics.map((topic) => (
                <div key={topic.id} className="topic-card">
                  <h3>{topic.topicName || topic.name}</h3>
                  <p>Interactions: {topic.interactionCount || 0}</p>
                  <Link to={`/topic/${topic.id}`} className="view-topic-button">
                    View Topic
                  </Link>
                </div>
              ))
            )}
          </div>

          <div style={{ margin: '40px 0' }}></div> 
          
          <div className="interacted-topics-section">
            <h2>My Interactions</h2>
            {userTopics.length === 0 ? (
              <p>No interactions yet</p>
            ) : (
              <div className="topics-list">
                {userTopics.map((topic) => (
                  <div 
                    key={topic.topic_id} 
                    className="topic-card"
                    onClick={() => handleTopicClick(topic.topic_id)}
                  >
                    <h3>{topic.topic_name}</h3>
                    <div className="topic-actions">
                      <span className="action-type">{getActionType(topic)}</span>
                      <span className="action-date">
                        {new Date(topic.actionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
