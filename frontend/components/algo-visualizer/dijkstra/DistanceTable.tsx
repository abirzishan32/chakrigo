"use client";

interface DistanceTableProps {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  currentNode: string;
  targetNode?: string;
  shortestPath?: string[];
}

export default function DistanceTable({
  distances,
  previous,
  visited,
  currentNode,
  targetNode,
  shortestPath
}: DistanceTableProps) {
  // Sort nodes for consistent display
  const nodes = Object.keys(distances).sort();
  
  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-2">Distances & Paths</h2>
      
      <div className="overflow-x-auto max-h-48 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-1 text-left">Node</th>
              <th className="px-2 py-1 text-left">Dist</th>
              <th className="px-2 py-1 text-left">Prev</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => {
              const isInPath = shortestPath?.includes(node) || false;
              const isVisited = visited.includes(node);
              
              return (
                <tr 
                  key={node} 
                  className={`
                    ${node === currentNode ? 'bg-red-50 dark:bg-red-900/10' : ''}
                    ${node === targetNode ? 'bg-green-50 dark:bg-green-900/10' : ''}
                    ${isInPath && !isVisited ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                    ${isVisited && !isInPath ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                    ${isVisited && isInPath ? 'bg-purple-50 dark:bg-purple-900/10' : ''}
                    border-b dark:border-gray-700
                  `}
                >
                  <td className="px-2 py-1 font-medium">{node}</td>
                  <td className="px-2 py-1 font-mono">
                    {distances[node] === Infinity ? '∞' : distances[node]}
                  </td>
                  <td className="px-2 py-1 font-mono">{previous[node] || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {shortestPath && (
        <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
          <div className="text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">
            Shortest Path:
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400 font-mono">
            {shortestPath.join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}