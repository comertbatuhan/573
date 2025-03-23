import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Are you ready to connecthedots?</h1>
        <div className="home-buttons">
          <Link to="/login" className="home-button login-button">
            Login
          </Link>
          <Link to="/signup" className="home-button signup-button">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 