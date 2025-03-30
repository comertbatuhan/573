import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [topics, setTopics] = useState([
    { id: 1, name: 'Machine Learning', interactions: 150 },
    { id: 2, name: 'Web Development', interactions: 120 },
    { id: 3, name: 'Data Science', interactions: 100 },
  ]);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/topics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTopicName }),
      });

      if (response.ok) {
        const newTopic = await response.json();
        setTopics([...topics, { id: newTopic.id, name: newTopic.name, interactions: 0 }]);
        setNewTopicName('');
        setShowCreateTopic(false);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <input
            type="text"
            placeholder="Search topics..."
            className="search-input"
          />
          <Link to="/profile" className="profile-button">
            Profile
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="topics-section">
          <div className="topics-header">
            <h2>Most Interacted Topics</h2>
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
            {topics.map((topic) => (
              <div key={topic.id} className="topic-card">
                <h3>{topic.name}</h3>
                <p>Interactions: {topic.interactions}</p>
                <Link to={`/topic/${topic.id}`} className="view-topic-button">
                  View Topic
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 