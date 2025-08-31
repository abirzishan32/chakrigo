import { DijkstraStep } from '@/components/algo-visualizer/dijkstra/types';
import Graph from 'graphology';

// Helper to find the minimum distance node not yet visited
function findMinDistanceNode(
    distances: Record<string, number>,
    visited: Set<string>
): string | null {
    let minDistance = Infinity;
    let minNode: string | null = null;

    for (const node in distances) {
        if (!visited.has(node) && distances[node] < minDistance) {
            minDistance = distances[node];
            minNode = node;
        }
    }

    return minNode;
}

// Helper to reconstruct the shortest path
function getPath(
    previous: Record<string, string | null>,
    endNode: string
): string[] {
    const path: string[] = [];
    let current: string | null = endNode;

    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    return path;
}

export function generateDijkstraSteps(
    graph: Graph,
    startNodeId: string,
    endNodeId?: string
): DijkstraStep[] {
    const steps: DijkstraStep[] = [];
    const visited: Set<string> = new Set();

    // Initialize distances and previous nodes
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};

    // Priority queue to simulate the algorithm
    const priorityQueue: { node: string; distance: number }[] = [];

    // Initialize all nodes with infinite distance except the start node
    graph.forEachNode((node) => {
        distances[node] = node === startNodeId ? 0 : Infinity;
        previous[node] = null;
    });

    // Add start node to priority queue
    priorityQueue.push({ node: startNodeId, distance: 0 });

    // Initial state
    steps.push({
        currentNode: startNodeId,
        priorityQueue: [...priorityQueue],
        distances: { ...distances },
        previous: { ...previous },
        visited: [],
        state: 'initial',
        targetNode: endNodeId
    });

    // Main Dijkstra loop
    while (priorityQueue.length > 0) {
        // Sort the priority queue by distance
        priorityQueue.sort((a, b) => a.distance - b.distance);

        // Remove and get the node with the minimum distance
        const { node: currentNode } = priorityQueue.shift()!;

        // Skip if already visited
        if (visited.has(currentNode)) {
            continue;
        }

        // Visit the node
        visited.add(currentNode);

        // Record the visiting step
        steps.push({
            currentNode,
            priorityQueue: [...priorityQueue],
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            state: 'visiting',
            targetNode: endNodeId,
            shortestPath: endNodeId ? getPath(previous, endNodeId) : undefined
        });

        // If we found the target node, we can stop
        if (endNodeId && currentNode === endNodeId) {
            break;
        }

        // Process neighbors (relax edges)
        const neighbors = graph.neighbors(currentNode);

        // Record starting to process neighbors
        steps.push({
            currentNode,
            priorityQueue: [...priorityQueue],
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            state: 'relaxing-edges',
            targetNode: endNodeId,
            shortestPath: endNodeId ? getPath(previous, endNodeId) : undefined
        });

        // Process each neighbor
        for (const neighbor of neighbors) {
            if (visited.has(neighbor)) {
                continue;
            }

            // Get the edge weight
            let weight = 1; // Default weight
            try {
                const edgeId = graph.edge(currentNode, neighbor);
                if (edgeId) {
                    const edgeAttributes = graph.getEdgeAttributes(edgeId);
                    weight = edgeAttributes.weight || 1;
                }
            } catch (error) {
                // If edge cannot be found, use default weight
                console.warn(`No direct edge found between ${currentNode} and ${neighbor}, using default weight`);
            }

            // Calculate new distance
            const distanceToNeighbor = distances[currentNode] + weight;

            // Record the edge processing
            steps.push({
                currentNode,
                priorityQueue: [...priorityQueue],
                distances: { ...distances },
                previous: { ...previous },
                visited: Array.from(visited),
                processingEdge: {
                    source: currentNode,
                    target: neighbor,
                    weight
                },
                state: 'relaxing-edges',
                targetNode: endNodeId,
                shortestPath: endNodeId ? getPath(previous, endNodeId) : undefined
            });

            // If we found a shorter path
            if (distanceToNeighbor < distances[neighbor]) {
                // Update distance and previous
                distances[neighbor] = distanceToNeighbor;
                previous[neighbor] = currentNode;

                // Add to priority queue
                priorityQueue.push({ node: neighbor, distance: distanceToNeighbor });

                // Record the updated state
                steps.push({
                    currentNode,
                    priorityQueue: [...priorityQueue],
                    distances: { ...distances },
                    previous: { ...previous },
                    visited: Array.from(visited),
                    processingEdge: {
                        source: currentNode,
                        target: neighbor,
                        weight
                    },
                    state: 'relaxing-edges',
                    targetNode: endNodeId,
                    shortestPath: endNodeId ? getPath(previous, endNodeId) : undefined
                });
            }
        }
    }

    // Final state
    steps.push({
        currentNode: '',
        priorityQueue: [],
        distances: { ...distances },
        previous: { ...previous },
        visited: Array.from(visited),
        state: 'complete',
        targetNode: endNodeId,
        shortestPath: endNodeId ? getPath(previous, endNodeId) : undefined
    });

    return steps;
}