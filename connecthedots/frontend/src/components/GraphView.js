import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function GraphView({ topicId, graphId }) {
  const [data, setData] = useState({ nodes: [], links: [] });

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      const nodeRes = await fetch(`/api/nodes/?graph=${graphId}`);
      const connectionRes = await fetch(`/api/connections/`);
      const nodes = await nodeRes.json();
      const connections = await connectionRes.json();

      const filteredConnections = connections.filter(c => 
        nodes.some(n => n.id === c.firstNodeID) &&
        nodes.some(n => n.id === c.secondNodeID)
      );

      setData({
        nodes: nodes.map(n => ({
          id: n.id,
          name: n.manual_name || `Node ${n.id}`
        })),
        links: filteredConnections.map(c => ({
          source: c.firstNodeID,
          target: c.secondNodeID,
          label: c.relationName,
          direction: c.relationDirection
        }))
      });
    };

    fetchData();
  }, [graphId]);

  // Draw edge labels
  const paintLinkLabel = (link, ctx) => {
    const midX = (link.source.x + link.target.x) / 2;
    const midY = (link.source.y + link.target.y) / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '12px Sans-Serif';
    ctx.fillText(link.label, midX, midY);
  };

  return (
    <div style={{ height: '600px' }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkCanvasObject={paintLinkLabel}
        onNodeClick={node => alert(`Clicked node: ${node.name}`)}
      />
    </div>
  );
}

export default GraphView;
