import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getGitLog } from '../lib/git';
import { Snapshot } from '../lib/snatch';

interface CombinedNode {
  id: string;
  hash?: string;
  message: string;
  author?: string;
  date: string;
  timestamp: number;
  isSnapshot: boolean;
}

interface GraphNode extends CombinedNode {
  x: number;
  y: number;
}

interface GitGraphProps {
  snapshots?: Snapshot[];
  showSnapshots: boolean;
}

const GitGraph: React.FC<GitGraphProps> = ({ snapshots = [], showSnapshots }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [combinedNodes, setCombinedNodes] = useState<CombinedNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const log = await getGitLog(30);
        
        const commitNodes: CombinedNode[] = log.map(c => ({
          id: c.hash,
          hash: c.hash,
          message: c.message,
          author: c.author,
          date: c.date,
          timestamp: new Date(c.date).getTime(),
          isSnapshot: false
        }));

        const snapshotNodes: CombinedNode[] = snapshots.map(s => ({
          id: s.id,
          message: s.message,
          date: s.timestamp,
          timestamp: new Date(s.timestamp).getTime(),
          isSnapshot: true
        }));

        const combined = [...commitNodes];
        if (showSnapshots) {
          combined.push(...snapshotNodes);
        }

        // Sort by timestamp descending (newest first)
        combined.sort((a, b) => b.timestamp - a.timestamp);
        setCombinedNodes(combined);
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [snapshots, showSnapshots]);

  useEffect(() => {
    if (!svgRef.current || combinedNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const nodeRadius = 5;
    const rowHeight = 40;

    const nodes: GraphNode[] = combinedNodes.map((node, i) => ({
      ...node,
      x: margin.left,
      y: margin.top + i * rowHeight,
    }));

    // Draw lines
    svg.append("g")
      .selectAll("line")
      .data(nodes.slice(0, -1))
      .enter()
      .append("line")
      .attr("x1", d => d.x)
      .attr("y1", d => d.y)
      .attr("x2", (_, i) => nodes[i + 1].x)
      .attr("y2", (_, i) => nodes[i + 1].y)
      .attr("stroke", d => d.isSnapshot ? "#00d4ff" : "#00ff88")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => d.isSnapshot ? "4,2" : "none")
      .attr("opacity", 0.4);

    // Draw nodes
    const nodeGroups = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeGroups.append("circle")
      .attr("r", d => d.isSnapshot ? nodeRadius - 1 : nodeRadius)
      .attr("fill", d => d.isSnapshot ? "#00d4ff" : "#00ff88")
      .attr("stroke", "#1a1b1e")
      .attr("stroke-width", 2);

    // Labels
    nodeGroups.append("text")
      .attr("x", 20)
      .attr("y", 4)
      .attr("fill", d => d.isSnapshot ? "#00d4ff" : "#e2e2e2")
      .style("font-size", "11px")
      .style("font-weight", d => d.isSnapshot ? "normal" : "500")
      .text(d => d.isSnapshot 
        ? `[snap] ${d.message}`
        : `${d.id.substring(0, 7)} - ${d.message}`
      );

    nodeGroups.append("text")
      .attr("x", 20)
      .attr("y", 16)
      .attr("fill", "#6b6b6b")
      .style("font-size", "9px")
      .text(d => d.isSnapshot 
        ? `${new Date(d.date).toLocaleString()}`
        : `${d.author} • ${new Date(d.date).toLocaleDateString()}`
      );

    svg.attr("height", nodes.length * rowHeight + margin.top + margin.bottom);
    svg.attr("width", "100%");

  }, [combinedNodes]);

  if (loading) return <div className="p-4 text-text-muted animate-pulse">Computing merged graph...</div>;

  return (
    <div className="w-full h-full overflow-auto bg-zed-bg">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
};

export default GitGraph;
