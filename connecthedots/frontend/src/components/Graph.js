import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  SmoothStepEdge,
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
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { v4 as uuidv4 } from 'uuid';

const CustomNode = ({ data, selected }) => (
  <div className={`custom-node ${selected ? 'selected-node' : ''}`}>
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: '#555', width: 10, height: 10 }}
    />
    <div className="node-label">{data.label}</div>
    {data.attributes?.description && (
      <div className="node-attribute">
        <strong>Description:</strong> {data.attributes.description}
      </div>
    )}
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ background: '#555', width: 10, height: 10 }}
    />
  </div>
);

const nodeTypes = { custom: CustomNode };

const initialNodes = [];
const initialEdges = [];

const Graph = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeAttributes, setNodeAttributes] = useState({});
  const [edgeLabel, setEdgeLabel] = useState('');
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
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
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const [topicName, setTopicName] = useState('');

  useEffect(() => {
    if (!topicId) {
      alert('No topic selected. Please select a topic first.');
      return;
    }
  }, [topicId]);

  useEffect(() => {
    const fetchTopicName = async () => {
      try {
        const response = await fetch(`${API_URL}/api/topics/${topicId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        if (!response.ok) throw new Error('Failed to fetch topic');
        const data = await response.json();
        setTopicName(data.topicName);
      } catch (error) {
        console.error('Error fetching topic:', error);
      }
    };

    fetchTopicName();
  }, [topicId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const nodesResp = await axios.get(
          `${API_URL}/api/nodes/?topic_id=${topicId}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );

        const nodesData = nodesResp.data.map((node) => {
          
          const position = {
            x: node.position_x || 0,
            y: node.position_y || 0
          };

          
          if (!node.position_x && !node.position_y) {
            const gridSize = Math.ceil(Math.sqrt(nodesResp.data.length));
            const nodeSpacing = 250;
            const index = nodesResp.data.indexOf(node);
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            position.x = col * nodeSpacing + 100;
            position.y = row * nodeSpacing + 100;
          }

          return {
            id: node.id.toString(),
            type: 'custom',
            position,
            data: {
              label: node.manual_name || 'Untitled',
              attributes: { description: node.description || '', qid: node.qid || null }
            }
          };
        });
        setNodes(nodesData);

        
        const connsResp = await axios.get(
          `${API_URL}/api/connections/?topic_id=${topicId}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
        const edgesData = connsResp.data.map(conn => ({
          id: conn.id.toString(),
          source: conn.firstNodeID.toString(),
          target: conn.secondNodeID.toString(),
          label: conn.relationName,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
          labelStyle: { fill: '#000', fontWeight: 700 },
          labelBgStyle: { fill: '#fff' },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 2,
        }));
        setEdges(edgesData);

      } catch (err) {
        console.error('Error fetching graph data:', err);
      }
    };

    fetchData();
  }, [topicId]);

  
  useEffect(() => {
    if (nodes.length > 0) {
      
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
    if (isSelectingNodes) {
      setSelectedNodesForEdge(prev => {
        const newSelection = [...prev, node];
        if (newSelection.length === 2) {
          setIsSelectingNodes(false);
          setSourceNode(newSelection[0]);
          setTargetNode(newSelection[1]);
          setEdgeDialogOpen(true);
          return [];
        }
        return newSelection;
      });
    } else {
      setSelectedNode(node);
      setNodeName(node.data.label);
      setNodeAttributes(node.data.attributes || {});
    }
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
    setSelectedWikidataItem(entity);
    setNodeName(entity.label);
    setNodeAttributes({
      ...nodeAttributes,
      description: entity.description || ''
    });
  };

  const handleNodeSave = async () => {
    try {
      if (!topicId) {
        alert('Topic ID is missing. Please make sure you are in a valid topic context.');
        return;
      }

      const nodeData = {
        manual_name: nodeName,
        description: nodeAttributes.description || '',
        qid: nodeAttributes.qid || null,
        topic: parseInt(topicId)
      };
      
      if (selectedWikidataItem?.id) {
        nodeData.qid = selectedWikidataItem.id;
      }

      let response;
      if (selectedNode) {
        
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
        
        response = await axios.post(
          `${API_URL}/api/nodes/`,
          nodeData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      setNodeDialogOpen(false);
      setWikidataResults([]);
      setSelectedWikidataItem(null);
      setNodeName('');
      setNodeAttributes({});
      setSelectedNode(null);
      setNeedsRefresh(true);

    } catch (error) {
      console.error('Error saving node:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Error response data:', error.response.data);
        alert(`Failed to save node: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('Failed to get a response. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        alert('Failed to save node. Please try again.');
      }
    }
  };

  const handleNodeDelete = async () => {
    if (selectedNode) {
      try {
        await axios.delete(
          `${API_URL}/api/nodes/${selectedNode.id}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setSelectedNode(null);
        setNeedsRefresh(true);
      } catch (error) {
        console.error('Error deleting node:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          alert(`Failed to delete node: ${JSON.stringify(error.response.data)}`);
        } else {
          alert('Failed to delete node. Please try again.');
        }
      }
    }
  };

  const handleEdgeAdd = () => {
    setShowNodeSearch(true);
    setEdgeDialogOpen(true);
    setEdgeLabel('');
    setSourceNode(null);
    setTargetNode(null);
  };

  const handleEdgeSave = async () => {
    if (sourceNode && targetNode && edgeLabel.trim()) {
      try {
        if (!topicId) {
          alert('Topic ID is missing. Please make sure you are in a valid topic context.');
          return;
        }

        
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

        
        try {
          console.log('Verifying nodes:', {
            sourceNodeId: sourceNode.id,
            targetNodeId: targetNode.id
          });

          
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
          
          response = await axios.put(`${API_URL}/api/connections/${selectedEdge.id}/`, edgeData, { headers });
        } else {
          
          response = await axios.post(`${API_URL}/api/connections/create/`, edgeData, { headers });
        }

        console.log('Server response:', response);

        if (response.status === 201 || response.status === 200) {
          
          setEdgeDialogOpen(false);
          setSourceNode(null);
          setTargetNode(null);
          setEdgeLabel('');
          setSearchQuery('');
          setFilteredNodes([]);
          setSelectedEdge(null);
         
          setNeedsRefresh(true);
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
        
        
        setSelectedEdge(null);
        setNeedsRefresh(true);
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

  
  useEffect(() => {
    if (needsRefresh) {
      const fetchRefreshData = async () => {
        try {
          console.log('Refreshing graph data after operation');
          const nodesResponse = await axios.get(`${API_URL}/api/nodes/?topic_id=${topicId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          
          const nodePositions = {};
          nodes.forEach(node => {
            nodePositions[node.id] = node.position;
          });
          
          const nodesData = nodesResponse.data.map(node => {
            const nodeId = node.id.toString();
            return {
              id: nodeId,
              type: 'custom',
              position: nodePositions[nodeId] || { x: Math.random() * 500, y: Math.random() * 500 },
              data: {
                label: node.manual_name || 'Untitled',
                attributes: {
                  description: node.description || '',
                  qid: node.qid || null
                }
              }
            };
          });
          
          console.log('Refresh complete, setting nodes:', nodesData);
          setNodes(nodesData);
          
         
          const connectionsResponse = await axios.get(`${API_URL}/api/connections/?topic_id=${topicId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const edgesData = connectionsResponse.data.map(connection => ({
            id: connection.id.toString(),
            source: connection.firstNodeID.toString(),
            target: connection.secondNodeID.toString(),
            label: connection.relationName,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#555' },
            labelStyle: { fill: '#000', fontWeight: 700 },
            labelBgStyle: { fill: '#fff' },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 2,
          }));
          
          console.log('Setting refreshed edges:', edgesData);
          setEdges(edgesData);
          
          setNeedsRefresh(false);
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      };
      
      fetchRefreshData();
    }
  }, [needsRefresh, topicId]);

  const saveNodePositions = async (nodes) => {
    try {
      const positionUpdates = nodes.map(node => ({
        id: node.id,
        position_x: node.position.x,
        position_y: node.position.y
      }));

      await axios.post(
        `${API_URL}/api/nodes/update_positions/`,
        { positions: positionUpdates },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      console.error('Error saving node positions:', err);
    }
  };

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    
    
    const positionChanges = changes.filter(change => change.type === 'position');
    if (positionChanges.length > 0) {
      
      const updatedNodes = nodes.map(node => {
        const change = positionChanges.find(c => c.id === node.id);
        if (change) {
          return {
            ...node,
            position: change.position
          };
        }
        return node;
      });

      
      saveNodePositions(updatedNodes);
    }
  }, [nodes, onNodesChange]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Knowledge Graph - {topicName}</Typography>
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
        <Button 
          variant="contained" 
          onClick={() => navigate(`/topic/${topicId}`)} 
          sx={{ mr: 1 }}
        >
          Back to Forum
        </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')} 
          sx={{ mr: 1 }}
        >
          Back to Dashboard
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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={{ smoothstep: SmoothStepEdge }}
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
