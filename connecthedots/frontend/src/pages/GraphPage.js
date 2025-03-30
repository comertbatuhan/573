import React from 'react';
import GraphView from '../components/GraphView';

function GraphPage() {
  const topicId = 1;  // Replace with actual topic ID or from route
  const graphId = 1;  // Replace with actual graph ID or from route

  return (
    <div>
      <h1>Graph View</h1>
      <GraphView topicId={topicId} graphId={graphId} />
    </div>
  );
}

export default GraphPage;
