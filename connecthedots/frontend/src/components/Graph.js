import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import './Graph.css';
import { useParams } from 'react-router-dom';
import API_URL from '../config';
import { v4 as uuidv4 } from 'uuid';

// Custom node component
const CustomNode = ({ data, selected }) => {
  return (
    <div className={`custom-node ${selected ? 'selected-node' : ''}`}>
      <div className="node-label">{data.label}</div>
      <div className="node-content">
        {data.attributes?.description && (
    <div className="node-attribute">
      <strong>Description:</strong> {data.attributes.description}
    </div>
  )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const Graph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeAttributes, setNodeAttributes] = useState({});
  const [edgeLabel, setEdgeLabel] = useState('');
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const { topicId } = useParams();
  const [wikidataResults, setWikidataResults] = useState([]);
  const [selectedWikidataItem, setSelectedWikidataItem] = useState(null);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [manualAttributes, setManualAttributes] = useState({
    description: '',
  });
  const [isSelectingNodes, setIsSelectingNodes] = useState(false);
  const [selectedNodesForEdge, setSelectedNodesForEdge] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [showNodeSearch, setShowNodeSearch] = useState(false);

  useEffect(() => {
    if (!topicId) {
      alert('No topic selected. Please select a topic first.');
      return;
    }
  }, [topicId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) {
        console.error('No topic ID provided');
        return;
      }

      try {
        console.log('Fetching nodes for topic:', topicId);
        const nodesResponse = await axios.get(`${API_URL}/api/nodes/?topic_id=${topicId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("Raw nodes data from backend:", nodesResponse.data);
        
        if (!nodesResponse.data || nodesResponse.data.length === 0) {
          console.warn('No nodes returned from backend');
          return;
        }

        // Calculate initial positions in a grid layout
        const gridSize = Math.ceil(Math.sqrt(nodesResponse.data.length));
        const nodeSpacing = 250; // Space between nodes

        const nodesData = nodesResponse.data.map((node, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const x = col * nodeSpacing + 100; // Start at x=100
          const y = row * nodeSpacing + 100; // Start at y=100

          const transformedNode = {
            id: node.id.toString(), // Ensure ID is a string
            type: 'custom',
            position: { x, y },
            data: {
              label: node.manual_name || 'Untitled',
              attributes: {
                description: node.description || '',
                qid: node.qid || null
              }
            }
          };
          console.log('Transformed node:', transformedNode);
          return transformedNode;
        });
        
        console.log('Setting nodes in state:', nodesData);
        setNodes(nodesData);

        const connectionsResponse = await axios.get(`${API_URL}/api/connections/?topic_id=${topicId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("Raw connections data:", connectionsResponse.data);
        
        const edgesData = connectionsResponse.data.map(connection => ({
          id: connection.id.toString(), // Ensure ID is a string
          source: connection.firstNodeID.toString(), // Ensure source is a string
          target: connection.secondNodeID.toString(), // Ensure target is a string
          label: connection.relationName,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555' },
          labelStyle: { fill: '#000', fontWeight: 700 },
          labelBgStyle: { fill: '#fff' },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 2,
        }));
        console.log('Setting edges in state:', edgesData);
        setEdges(edgesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
      }
    };

    fetchData();
  }, [topicId]);

  // Add a new useEffect to handle initial fit view
  useEffect(() => {
    if (nodes.length > 0) {
      // Force a re-render of the graph after nodes are loaded
      const timer = setTimeout(() => {
        const reactFlowInstance = document.querySelector('.react-flow');
        if (reactFlowInstance) {
          reactFlowInstance.style.opacity = '0';
          setTimeout(() => {
            reactFlowInstance.style.opacity = '1';
          }, 50);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes]);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label);
    setNodeAttributes(node.data.attributes || {});
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setEdgeLabel(edge.label);
  };

  const handleNodeAdd = () => {
    setNodeDialogOpen(true);
    setSelectedNode(null);
    setNodeName('');
    setNodeAttributes({});
    setWikidataResults([]);
  };

  const handleNodeNameChange = async (e) => {
    const name = e.target.value;
    setNodeName(name);
    if (name.length > 2) {
      try {
        const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
          params: {
            action: 'wbsearchentities',
            search: name,
            language: 'en',
            format: 'json',
            origin: '*'
          }
        });
        setWikidataResults(response.data.search || []);
    } catch (error) {
        console.error('Error fetching Wikidata data:', error);
        setWikidataResults([]);
      }
    } else {
      setWikidataResults([]);
    }
  };

  const handleWikidataSelect = (entity) => {
    const newNode = {
      id: selectedNode ? selectedNode.id : uuidv4(),
      type: 'custom',
      position: selectedNode ? selectedNode.position : { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: entity.label,
        attributes: {
          description: entity.description || ''
        }
      }
    };

    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => (node.id === selectedNode.id ? newNode : node))
      );
    } else {
      setNodes((nds) => [...nds, newNode]);
    }

    setNodeDialogOpen(false);
    setWikidataResults([]);
    setSelectedWikidataItem(null);
    setNodeName('');
    setNodeAttributes({});
  };

  const handleNodeSave = async () => {
    try {
      if (!topicId) {
        alert('Topic ID is missing. Please make sure you are in a valid topic context.');
        return;
      }

      const nodeData = {
        manual_name: nodeName,
        qid: selectedWikidataItem?.id ?? null,
        topic_id: parseInt(topicId), 
        description: nodeAttributes.description || ''
      };
      

      let response;
      if (selectedNode) {
        // Update existing node
        response = await axios.put(
          `${API_URL}/api/nodes/${selectedNode.id}/`,
          nodeData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new node
        response = await axios.post(
          `${API_URL}/api/nodes/create/`,
          nodeData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Refresh nodes from the server
      const nodesResponse = await axios.get(`${API_URL}/api/nodes/?topic_id=${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const nodesData = nodesResponse.data.map(node => ({
        id: node.id,
        type: 'custom',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          label: node.manual_name,
          attributes: {
            description: node.description,
            qid: node.qid
          }
        }
      }));

      setNodes(nodesData);
      setNodeDialogOpen(false);
      setWikidataResults([]);
      setSelectedWikidataItem(null);
      setNodeName('');
      setNodeAttributes({});

    } catch (error) {
      console.error('Error saving node:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to save node: ${error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to save node. Please try again.');
      }
    }
  };

  const handleNodeDelete = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  };

  const handleEdgeAdd = () => {
    setShowNodeSearch(true);
    setEdgeDialogOpen(true);
    setEdgeLabel('');
    setSourceNode(null);
    setTargetNode(null);
  };

  const handleNodeSelectForEdge = (event, node) => {
    if (isSelectingNodes) {
      setSelectedNodesForEdge(prev => {
        if (prev.length === 1 && prev[0].id === node.id) {
          return prev;
        }
        
        const newSelection = [...prev, node];
        if (newSelection.length === 2) {
          setIsSelectingNodes(false);
          setSourceNode(newSelection[0]);
          setTargetNode(newSelection[1]);
          setEdgeDialogOpen(true);
        }
        return newSelection;
      });
    }
  };

  const handleEdgeSave = async () => {
    if (sourceNode && targetNode && edgeLabel.trim()) {
      try {
        if (!topicId) {
          alert('Topic ID is missing. Please make sure you are in a valid topic context.');
          return;
        }

        // Get the current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          alert('User information is missing. Please log in again.');
          return;
        }

        const edgeData = {
          firstNodeID: parseInt(sourceNode.id),
          secondNodeID: parseInt(targetNode.id),
          relationName: edgeLabel.trim(),
          relationDirection: 'UNDIRECTED',
          topic: parseInt(topicId),
          createdBy: user.id
        };

        console.log('Saving edge with data:', edgeData);

        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        };

        // First verify that both nodes exist
        try {
          console.log('Verifying nodes:', {
            sourceNodeId: sourceNode.id,
            targetNodeId: targetNode.id
          });

          // Get all nodes for the current topic
          const allNodesResponse = await axios.get(`${API_URL}/api/nodes/?topic_id=${topicId}`, { headers });
          console.log('All nodes in topic:', allNodesResponse.data);
          console.log('Source node ID:', sourceNode.id, 'Type:', typeof sourceNode.id);
          console.log('Target node ID:', targetNode.id, 'Type:', typeof targetNode.id);

          const sourceNodeExists = allNodesResponse.data.some(node => {
            console.log('Comparing source node:', node.id, 'Type:', typeof node.id);
            return node.id === parseInt(sourceNode.id);
          });
          const targetNodeExists = allNodesResponse.data.some(node => {
            console.log('Comparing target node:', node.id, 'Type:', typeof node.id);
            return node.id === parseInt(targetNode.id);
          });

          console.log('Node verification results:', {
            sourceNodeExists,
            targetNodeExists,
            sourceNodeId: sourceNode.id,
            targetNodeId: targetNode.id,
            allNodeIds: allNodesResponse.data.map(node => node.id)
          });

          if (!sourceNodeExists || !targetNodeExists) {
            alert('One or both nodes do not exist in this topic. Please select valid nodes.');
            return;
          }
        } catch (error) {
          console.error('Error verifying nodes:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
          }
          alert('Failed to verify nodes. Please try again.');
          return;
        }

        let response;
        if (selectedEdge) {
          // Update existing edge
          response = await axios.put(`${API_URL}/api/connections/${selectedEdge.id}/`, edgeData, { headers });
        } else {
          // Create new edge
          response = await axios.post(`${API_URL}/api/connections/create/`, edgeData, { headers });
        }

        console.log('Server response:', response);

        if (response.status === 201 || response.status === 200) {
          // Refresh edges from the server
          const connectionsResponse = await axios.get(`${API_URL}/api/connections/?topic_id=${topicId}`, { headers });
          const edgesData = connectionsResponse.data.map(connection => ({
            id: connection.id,
            source: connection.firstNodeID,
            target: connection.secondNodeID,
            label: connection.relationName,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#555' },
            labelStyle: { fill: '#000', fontWeight: 700 },
            labelBgStyle: { fill: '#fff' },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 2,
          }));
          setEdges(edgesData);

          setEdgeDialogOpen(false);
          setSourceNode(null);
          setTargetNode(null);
          setEdgeLabel('');
          setSearchQuery('');
          setFilteredNodes([]);
        }
      } catch (error) {
        console.error('Error saving edge:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          alert(`Failed to save edge: ${error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          alert('Failed to save edge: No response received from server');
        } else {
          console.error('Error message:', error.message);
          alert(`Failed to save edge: ${error.message}`);
        }
      }
    } else {
      alert('Please select both source and target nodes and enter a relationship.');
    }
  };

  const handleEdgeDelete = async () => {
    if (selectedEdge) {
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        await axios.delete(`${API_URL}/api/connections/${selectedEdge.id}/`, { headers });
        
        // Refresh edges from the server
        const response = await axios.get(`${API_URL}/api/connections/?topic_id=${topicId}`, { headers });
        const edgesData = response.data.map(connection => ({
          id: connection.id,
          source: connection.firstNodeID,
          target: connection.secondNodeID,
          label: connection.relationName,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555' },
          labelStyle: { fill: '#000', fontWeight: 700 },
          labelBgStyle: { fill: '#fff' },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 2,
        }));
        setEdges(edgesData);
        setSelectedEdge(null);
      } catch (error) {
        console.error('Error deleting edge:', error);
        alert('Failed to delete edge. Please try again.');
      }
    }
  };

  const onConnect = useCallback(
    (params) => {
      setSourceNode(nodes.find((node) => node.id === params.source));
      setTargetNode(nodes.find((node) => node.id === params.target));
      setEdgeDialogOpen(true);
    },
    [nodes]
  );

  const searchWikidata = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/api/wikis/search/?q=${query}`);
      setWikidataResults(response.data);
    } catch (error) {
      console.error('Error searching Wikidata:', error);
    }
  };

  const handleAddNode = async () => {
    try {
      const nodeData = {
        manual_name: nodeName,
        qid: selectedWikidataItem?.id || null,
        topic_id: parseInt(topicId), 
        description: nodeAttributes.description || ''
      };
      

      await axios.post(`${API_URL}/api/nodes/create/`, nodeData);
      setShowAddNodeForm(false);
      setNodeName('');
      setWikidataResults([]);
      setSelectedWikidataItem(null);
      setManualAttributes({ description: '' });
      // Refresh nodes from the server
      const response = await axios.get(`${API_URL}/api/nodes/`);
      setNodes(response.data.map(node => ({
        id: node.id,
        type: 'custom',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          label: node.manual_name,
          attributes: {
            description: node.description,
            qid: node.qid
          }
        }
      })));
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };

  const handleNodeSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = nodes.filter(node => 
        node.data.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNodes(filtered);
    } else {
      setFilteredNodes([]);
    }
  };

  const handleNodeSelectFromSearch = (node, isSource) => {
    if (isSource) {
      setSourceNode(node);
    } else {
      setTargetNode(node);
    }
    setSearchQuery('');
    setFilteredNodes([]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <Button variant="contained" onClick={handleNodeAdd} sx={{ mr: 1 }}>
          Add Node
        </Button>
        <Button 
          variant="contained" 
          onClick={handleEdgeAdd} 
          sx={{ mr: 1 }}
          color={isSelectingNodes ? 'secondary' : 'primary'}
        >
          {isSelectingNodes ? 'Select Two Nodes' : 'Add Edge'}
        </Button>
        {selectedNode && (
          <>
            <IconButton onClick={handleNodeDelete} color="error">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => setNodeDialogOpen(true)} color="primary">
              <EditIcon />
            </IconButton>
          </>
        )}
        {selectedEdge && (
          <>
            <IconButton onClick={handleEdgeDelete} color="error">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => setEdgeDialogOpen(true)} color="primary">
              <EditIcon />
            </IconButton>
          </>
        )}
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={isSelectingNodes ? handleNodeSelectForEdge : handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ background: '#f8f8f8' }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555' },
          labelStyle: { fill: '#000', fontWeight: 700 },
          labelBgStyle: { fill: '#fff' },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 2,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      <Dialog open={nodeDialogOpen} onClose={() => setNodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedNode ? 'Edit Node' : 'Create New Node'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Node Name"
            fullWidth
            value={nodeName}
            onChange={handleNodeNameChange}
          />
          
          {wikidataResults.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Wikidata Results</Typography>
              {wikidataResults.map((result) => (
                <Box
                  key={result.id}
                  sx={{
                    p: 1,
                    my: 1,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedWikidataItem?.id === result.id ? '#e3f2fd' : 'white',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => handleWikidataSelect(result)}
                >
                  <Typography variant="subtitle2">{result.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Description
          </Typography>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={nodeAttributes.description || ''}
            onChange={(e) =>
              setNodeAttributes({ ...nodeAttributes, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNodeSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={edgeDialogOpen} onClose={() => {
        setEdgeDialogOpen(false);
        setSourceNode(null);
        setTargetNode(null);
        setEdgeLabel('');
        setSearchQuery('');
        setFilteredNodes([]);
      }}>
        <DialogTitle>
          {selectedEdge ? 'Edit Edge' : 'Create New Edge'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Source Node
            </Typography>
            <TextField
              fullWidth
              value={sourceNode ? sourceNode.data.label : searchQuery}
              onChange={(e) => handleNodeSearch(e.target.value)}
              placeholder="Search for source node..."
              sx={{ mb: 1 }}
            />
            {!sourceNode && filteredNodes.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                {filteredNodes.map((node) => (
                  <Box
                    key={node.id}
                    onClick={() => handleNodeSelectFromSearch(node, true)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <Typography>{node.data.label}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Target Node
            </Typography>
            <TextField
              fullWidth
              value={targetNode ? targetNode.data.label : searchQuery}
              onChange={(e) => handleNodeSearch(e.target.value)}
              placeholder="Search for target node..."
              sx={{ mb: 1 }}
            />
            {!targetNode && filteredNodes.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                {filteredNodes.map((node) => (
                  <Box
                    key={node.id}
                    onClick={() => handleNodeSelectFromSearch(node, false)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <Typography>{node.data.label}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Relationship"
            fullWidth
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
            placeholder="e.g., 'was born in' or 'is located in'"
            error={!edgeLabel.trim()}
            helperText={!edgeLabel.trim() ? "Relationship is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEdgeDialogOpen(false);
            setSourceNode(null);
            setTargetNode(null);
            setEdgeLabel('');
            setSearchQuery('');
            setFilteredNodes([]);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleEdgeSave}
            disabled={!edgeLabel.trim() || !sourceNode || !targetNode}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Graph;
