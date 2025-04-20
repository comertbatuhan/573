import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import './Graph.css';
import { useParams } from 'react-router-dom';

const Graph = () => {
  const [nodes, setNodes] = useState([]);
  const { topicId } = useParams(); 
  const [links, setLinks] = useState([]);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [wikidataResults, setWikidataResults] = useState([]);
  const [selectedWikidataItem, setSelectedWikidataItem] = useState(null);
  const [manualAttributes, setManualAttributes] = useState({
    description: '',
    
  });
  const graphRef = useRef();

  useEffect(() => {
    fetchNodes();
    fetchConnections();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/nodes/');
      setNodes(response.data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/connections/');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const searchWikidata = async (query) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/wikis/search/?q=${query}`);
      setWikidataResults(response.data);
    } catch (error) {
      console.error('Error searching Wikidata:', error);
    }
  };

  const handleAddNode = async () => {
    try {
      const nodeData = {
        manual_name: nodeName,
        qid: selectedWikidataItem?.qID || null,
        topic_ids: [parseInt(topicId)], 
        description: manualAttributes.description
      };

      await axios.post('http://localhost:8000/api/nodes/create/', nodeData);
      setShowAddNodeForm(false);
      setNodeName('');
      setWikidataResults([]);
      setSelectedWikidataItem(null);
      setManualAttributes({ description: '' });
      fetchNodes();
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };

  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
  };

  const handleLinkClick = (link) => {
    console.log('Link clicked:', link);
  };

  return (
    <div className="graph-container">
      <div className="graph-controls">
        <button 
          className="add-node-button"
          onClick={() => setShowAddNodeForm(true)}
        >
          Add Node
        </button>
      </div>

      {showAddNodeForm && (
        <div className="add-node-form">
          <h3>Add New Node</h3>
          <input
            type="text"
            value={nodeName}
            onChange={(e) => {
              setNodeName(e.target.value);
              searchWikidata(e.target.value);
            }}
            placeholder="Enter node name"
          />
          
          {wikidataResults.length > 0 && (
            <div className="wikidata-results">
              <h4>Wikidata Results</h4>
              {wikidataResults.map((item) => (
                <div 
                  key={item.qID}
                  className={`wikidata-item ${selectedWikidataItem?.qID === item.qID ? 'selected' : ''}`}
                  onClick={() => setSelectedWikidataItem(item)}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    padding: '8px',
                    margin: '6px 0',
                    cursor: 'pointer',
                    backgroundColor: selectedWikidataItem?.qID === item.qID ? '#eef' : '#fff'
                  }}
                >
                  <strong>{item.label}</strong>
                  <p style={{ margin: '4px 0', fontStyle: 'italic' }}>{item.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          )}


          <div className="manual-attributes">
            <h4>Manual Attributes</h4>
            <textarea
              value={manualAttributes.description}
              onChange={(e) => setManualAttributes({
                ...manualAttributes,
                description: e.target.value
              })}
              placeholder="Enter description"
            />
          </div>

          <div className="form-actions">
            <button onClick={handleAddNode}>Create Node</button>
            <button onClick={() => setShowAddNodeForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links }}
        nodeLabel="manual_name"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
      />
    </div>
  );
};

export default Graph;
