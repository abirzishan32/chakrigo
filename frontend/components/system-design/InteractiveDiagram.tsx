"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Download, RefreshCw, Edit, ZoomIn, ZoomOut, Move, 
  History, Palette, GitBranch, Eye, EyeOff, Plus
} from 'lucide-react';
import { 
  DiagramNode, 
  DiagramLink, 
  DiagramVersionManager, 
  diagramThemes, 
  exportDiagramAsSVG 
} from '../../lib/d3-utils';

// Updated props interface to match the usage
interface InteractiveDiagramProps {
    plantUML: string;
    d3Components?: any;
    onSave?: (updatedComponents: any) => void;
    onEdit?: (nodeId: string, newLabel: string) => void;
}

export function InteractiveDiagram({ plantUML, d3Components, onSave, onEdit }: InteractiveDiagramProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<DiagramNode[]>([]);
    const [links, setLinks] = useState<DiagramLink[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [theme, setTheme] = useState<'default' | 'dark' | 'colorful'>('default');
    const [showVersions, setShowVersions] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showLabels, setShowLabels] = useState(true);
    const [versionManager] = useState(new DiagramVersionManager());

    // Enhanced PlantUML parsing with comprehensive node extraction
    const parsePlantUML = (plantUMLCode: string) => {
        const parsedNodes: DiagramNode[] = [];
        const parsedLinks: DiagramLink[] = [];
        const nodeIdMap = new Map<string, DiagramNode>();

        console.log('Parsing PlantUML code:', plantUMLCode);

        const lines = plantUMLCode.split('\n');

        // First pass: Extract all explicit node definitions
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line || line.startsWith('@') || line.startsWith('!') || line.startsWith('title')) return;

            console.log(`Line ${index}: ${line}`);

            // Enhanced actor parsing
            const actorPatterns = [
                { pattern: /actor\s+"([^"]+)"\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /actor\s+(\w+)\s+as\s+"([^"]+)"/i, labelIndex: 2, idIndex: 1 },
                { pattern: /actor\s+"([^"]+)"/i, labelIndex: 1, idIndex: null },
                { pattern: /actor\s+(\w+)/i, labelIndex: 1, idIndex: 1 }
            ];

            for (const { pattern, labelIndex, idIndex } of actorPatterns) {
                const match = line.match(pattern);
                if (match && line.toLowerCase().includes('actor')) {
                    const label = match[labelIndex].replace(/"/g, '');
                    const id = idIndex ? match[idIndex] : label.replace(/\s+/g, '_').toLowerCase();
                    
                    if (!nodeIdMap.has(id)) {
                        const node: DiagramNode = {
                            id,
                            type: 'actor',
                            label,
                            x: 100 + Math.random() * 200,
                            y: 100 + Math.random() * 200
                        };
                        parsedNodes.push(node);
                        nodeIdMap.set(id, node);
                        console.log(`Created actor node: ${id} (${label})`);
                    }
                    break;
                }
            }

            // Enhanced component parsing
            const componentPatterns = [
                { pattern: /\[([^\]]+)\]\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /\[([^\]]+)\]/i, labelIndex: 1, idIndex: null },
                { pattern: /component\s+"([^"]+)"\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /component\s+(\w+)\s+as\s+"([^"]+)"/i, labelIndex: 2, idIndex: 1 },
                { pattern: /component\s+"([^"]+)"/i, labelIndex: 1, idIndex: null },
                { pattern: /component\s+(\w+)/i, labelIndex: 1, idIndex: 1 }
            ];

            for (const { pattern, labelIndex, idIndex } of componentPatterns) {
                const match = line.match(pattern);
                if (match && (line.includes('[') || line.toLowerCase().includes('component'))) {
                    const label = match[labelIndex].replace(/"/g, '');
                    const id = idIndex ? match[idIndex] : label.replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
                    
                    if (!nodeIdMap.has(id)) {
                        const node: DiagramNode = {
                            id,
                            type: 'component',
                            label,
                            x: 300 + Math.random() * 300,
                            y: 150 + Math.random() * 300
                        };
                        parsedNodes.push(node);
                        nodeIdMap.set(id, node);
                        console.log(`Created component node: ${id} (${label})`);
                    }
                    break;
                }
            }

            // Enhanced database parsing
            const databasePatterns = [
                { pattern: /database\s+"([^"]+)"\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /database\s+(\w+)\s+as\s+"([^"]+)"/i, labelIndex: 2, idIndex: 1 },
                { pattern: /database\s+"([^"]+)"/i, labelIndex: 1, idIndex: null },
                { pattern: /database\s+(\w+)/i, labelIndex: 1, idIndex: 1 }
            ];

            for (const { pattern, labelIndex, idIndex } of databasePatterns) {
                const match = line.match(pattern);
                if (match && line.toLowerCase().includes('database')) {
                    const label = match[labelIndex].replace(/"/g, '');
                    const id = idIndex ? match[idIndex] : label.replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
                    
                    if (!nodeIdMap.has(id)) {
                        const node: DiagramNode = {
                            id,
                            type: 'database',
                            label,
                            x: 500 + Math.random() * 200,
                            y: 100 + Math.random() * 200
                        };
                        parsedNodes.push(node);
                        nodeIdMap.set(id, node);
                        console.log(`Created database node: ${id} (${label})`);
                    }
                    break;
                }
            }

            // Enhanced cloud parsing
            const cloudPatterns = [
                { pattern: /cloud\s+"([^"]+)"\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /cloud\s+(\w+)\s+as\s+"([^"]+)"/i, labelIndex: 2, idIndex: 1 },
                { pattern: /cloud\s+"([^"]+)"/i, labelIndex: 1, idIndex: null },
                { pattern: /cloud\s+(\w+)/i, labelIndex: 1, idIndex: 1 }
            ];

            for (const { pattern, labelIndex, idIndex } of cloudPatterns) {
                const match = line.match(pattern);
                if (match && line.toLowerCase().includes('cloud')) {
                    const label = match[labelIndex].replace(/"/g, '');
                    const id = idIndex ? match[idIndex] : label.replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
                    
                    if (!nodeIdMap.has(id)) {
                        const node: DiagramNode = {
                            id,
                            type: 'cloud',
                            label,
                            x: 200 + Math.random() * 400,
                            y: 350 + Math.random() * 100
                        };
                        parsedNodes.push(node);
                        nodeIdMap.set(id, node);
                        console.log(`Created cloud node: ${id} (${label})`);
                    }
                    break;
                }
            }

            // Enhanced interface parsing
            const interfacePatterns = [
                { pattern: /interface\s+"([^"]+)"\s+as\s+(\w+)/i, labelIndex: 1, idIndex: 2 },
                { pattern: /interface\s+(\w+)\s+as\s+"([^"]+)"/i, labelIndex: 2, idIndex: 1 },
                { pattern: /interface\s+"([^"]+)"/i, labelIndex: 1, idIndex: null },
                { pattern: /interface\s+(\w+)/i, labelIndex: 1, idIndex: 1 }
            ];

            for (const { pattern, labelIndex, idIndex } of interfacePatterns) {
                const match = line.match(pattern);
                if (match && line.toLowerCase().includes('interface')) {
                    const label = match[labelIndex].replace(/"/g, '');
                    const id = idIndex ? match[idIndex] : label.replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
                    
                    if (!nodeIdMap.has(id)) {
                        const node: DiagramNode = {
                            id,
                            type: 'interface',
                            label,
                            x: 400 + Math.random() * 200,
                            y: 250 + Math.random() * 100
                        };
                        parsedNodes.push(node);
                        nodeIdMap.set(id, node);
                        console.log(`Created interface node: ${id} (${label})`);
                    }
                    break;
                }
            }
        });

        // Second pass: Parse relationships and create missing nodes
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            const relationshipPatterns = [
                /(\w+)\s+-->\s+(\w+)(?:\s*:\s*(.+))?/,
                /(\w+)\s+->\s+(\w+)(?:\s*:\s*(.+))?/,
                /(\w+)\s+\.\.\>\s+(\w+)(?:\s*:\s*(.+))?/,
                /(\w+)\s+--\s+(\w+)(?:\s*:\s*(.+))?/,
                /(\w+)\s+\.\.\s+(\w+)(?:\s*:\s*(.+))?/
            ];

            for (const pattern of relationshipPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const sourceId = match[1];
                    const targetId = match[2];
                    const label = match[3]?.trim() || '';

                    console.log(`Found relationship: ${sourceId} -> ${targetId} (${label})`);

                    // Create missing source node
                    if (!nodeIdMap.has(sourceId)) {
                        const newNode: DiagramNode = {
                            id: sourceId,
                            type: 'component',
                            label: sourceId.charAt(0).toUpperCase() + sourceId.slice(1).replace(/_/g, ' '),
                            x: 200 + parsedNodes.length * 120,
                            y: 250
                        };
                        parsedNodes.push(newNode);
                        nodeIdMap.set(sourceId, newNode);
                        console.log(`Auto-created missing source node: ${sourceId}`);
                    }

                    // Create missing target node
                    if (!nodeIdMap.has(targetId)) {
                        const newNode: DiagramNode = {
                            id: targetId,
                            type: 'component',
                            label: targetId.charAt(0).toUpperCase() + targetId.slice(1).replace(/_/g, ' '),
                            x: 200 + parsedNodes.length * 120,
                            y: 250
                        };
                        parsedNodes.push(newNode);
                        nodeIdMap.set(targetId, newNode);
                        console.log(`Auto-created missing target node: ${targetId}`);
                    }

                    // Add the link
                    parsedLinks.push({
                        source: sourceId,
                        target: targetId,
                        label: label
                    });
                    break;
                }
            }
        });

        // Fallback: Use d3Components if PlantUML parsing yielded no results
        if (parsedNodes.length === 0 && d3Components?.nodes) {
            console.log('Using d3Components as fallback:', d3Components);
            return {
                nodes: d3Components.nodes.map((node: any) => ({
                    ...node,
                    x: node.x || 100 + Math.random() * 600,
                    y: node.y || 100 + Math.random() * 400
                })),
                links: d3Components.links || []
            };
        }

        // Final fallback: Create default nodes
        if (parsedNodes.length === 0) {
            console.log('Creating default nodes');
            const defaultNodes: DiagramNode[] = [
                { id: 'user', type: 'actor', label: 'User', x: 150, y: 200 },
                { id: 'frontend', type: 'component', label: 'Frontend', x: 350, y: 200 },
                { id: 'backend', type: 'component', label: 'Backend', x: 550, y: 200 },
                { id: 'database', type: 'database', label: 'Database', x: 750, y: 200 }
            ];

            const defaultLinks: DiagramLink[] = [
                { source: 'user', target: 'frontend', label: 'requests' },
                { source: 'frontend', target: 'backend', label: 'API calls' },
                { source: 'backend', target: 'database', label: 'queries' }
            ];

            return { nodes: defaultNodes, links: defaultLinks };
        }

        console.log(`Final result: ${parsedNodes.length} nodes, ${parsedLinks.length} links`);
        console.log('Node IDs:', parsedNodes.map(n => n.id));
        console.log('Links:', parsedLinks.map(l => `${l.source} -> ${l.target}`));

        return { nodes: parsedNodes, links: parsedLinks };
    };

    // Initialize nodes and links
    useEffect(() => {
        const { nodes: parsedNodes, links: parsedLinks } = parsePlantUML(plantUML);
        setNodes(parsedNodes);
        setLinks(parsedLinks);
    }, [plantUML, d3Components]);

    // Enhanced D3 rendering with validation
    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 600;

        // Validate links - only keep links where both nodes exist
        const nodeIds = new Set(nodes.map(n => n.id));
        const validLinks = links.filter(link => {
            const sourceExists = nodeIds.has(link.source);
            const targetExists = nodeIds.has(link.target);
            
            if (!sourceExists) {
                console.warn(`Link source node not found: ${link.source}`);
            }
            if (!targetExists) {
                console.warn(`Link target node not found: ${link.target}`);
            }
            
            return sourceExists && targetExists;
        });

        console.log(`Rendering ${nodes.length} nodes and ${validLinks.length} valid links (filtered from ${links.length} total links)`);

        // Create zoom behavior
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                const { transform } = event;
                setZoom(transform.k);
                g.attr('transform', transform);
            });

        svg.call(zoomBehavior);

        const g = svg.append('g');

        // Create force simulation with validated data
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(validLinks).id((d: any) => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(60));

        // Add arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 13)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 13)
            .attr('markerHeight', 13)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', diagramThemes[theme].link.stroke)
            .style('stroke', 'none');

        // Add glow filter
        const defs = svg.select('defs');
        const filter = defs.append('filter').attr('id', 'glow');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Create links
        const link = g.append('g')
            .selectAll('line')
            .data(validLinks)
            .join('line')
            .attr('stroke', diagramThemes[theme].link.stroke)
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');

        // Create link labels
        const linkLabel = g.append('g')
            .selectAll('text')
            .data(validLinks.filter(d => showLabels && d.label))
            .join('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#9CA3AF')
            .attr('dy', -5)
            .text((d: any) => d.label || '');

        // Create nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag<SVGGElement, DiagramNode>()
                .on('start', (event, d) => {
                    setIsDragging(true);
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    setIsDragging(false);
                    if (!event.active) simulation.alphaTarget(0);
                    if (!isEditMode) {
                        d.fx = undefined;
                        d.fy = undefined;
                    }
                }));

        // Add node shapes based on type with theme colors
        node.each(function (d) {
            const nodeGroup = d3.select(this);
            const themeColors = diagramThemes[theme][d.type];

            switch (d.type) {
                case 'actor':
                    nodeGroup.append('circle')
                        .attr('r', 25)
                        .attr('fill', themeColors.fill)
                        .attr('stroke', themeColors.stroke)
                        .attr('stroke-width', 2);
                    break;
                case 'component':
                    nodeGroup.append('rect')
                        .attr('width', 100)
                        .attr('height', 50)
                        .attr('x', -50)
                        .attr('y', -25)
                        .attr('rx', 8)
                        .attr('fill', themeColors.fill)
                        .attr('stroke', themeColors.stroke)
                        .attr('stroke-width', 2);
                    break;
                case 'database':
                    nodeGroup.append('ellipse')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('rx', 40)
                        .attr('ry', 25)
                        .attr('fill', themeColors.fill)
                        .attr('stroke', themeColors.stroke)
                        .attr('stroke-width', 2);
                    break;
                case 'cloud':
                    nodeGroup.append('circle')
                        .attr('r', 30)
                        .attr('fill', themeColors.fill)
                        .attr('stroke', themeColors.stroke)
                        .attr('stroke-width', 2);
                    break;
                case 'interface':
                    nodeGroup.append('rect')
                        .attr('width', 80)
                        .attr('height', 40)
                        .attr('x', -40)
                        .attr('y', -20)
                        .attr('rx', 5)
                        .attr('fill', themeColors.fill)
                        .attr('stroke', themeColors.stroke)
                        .attr('stroke-width', 2);
                    break;
                default:
                    nodeGroup.append('rect')
                        .attr('width', 80)
                        .attr('height', 40)
                        .attr('x', -40)
                        .attr('y', -20)
                        .attr('rx', 5)
                        .attr('fill', '#6B7280')
                        .attr('stroke', '#374151')
                        .attr('stroke-width', 2);
            }

            // Add node labels
            if (showLabels) {
                nodeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 5)
                    .attr('font-size', '12px')
                    .attr('font-weight', 'bold')
                    .attr('fill', diagramThemes[theme].text.fill)
                    .text(d.label);
            }
        });

        // Add selection highlight
        node.on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode(selectedNode === d.id ? null : d.id);

            // Highlight selected node
            node.selectAll('rect, circle, ellipse')
                .attr('stroke-width', (nodeData: any) =>
                    nodeData.id === d.id ? 4 : 2
                )
                .attr('filter', (nodeData: any) =>
                    nodeData.id === d.id ? 'url(#glow)' : null
                );

            if (onEdit && selectedNode === d.id) {
                const newLabel = prompt('Enter new label:', d.label);
                if (newLabel && newLabel !== d.label) {
                    onEdit(d.id, newLabel);
                    // Update the node label
                    setNodes(prevNodes => 
                        prevNodes.map(node => 
                            node.id === d.id ? { ...node, label: newLabel } : node
                        )
                    );
                }
            }
        });

        // Click outside to deselect
        svg.on('click', () => {
            setSelectedNode(null);
            node.selectAll('rect, circle, ellipse')
                .attr('stroke-width', 2)
                .attr('filter', null);
        });

        // Update positions on tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            linkLabel
                .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
                .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

            node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [nodes, links, isEditMode, selectedNode, theme, showLabels, onEdit]);

    // Rest of the component methods remain the same...
    const handleSave = () => {
        if (onSave) {
            onSave({ nodes, links });
        }
    };

    const handleSaveVersion = () => {
        const versionName = `Version ${new Date().toLocaleTimeString()}`;
        versionManager.saveVersion(versionName, nodes, links);
        handleSave();
    };

    const handleLoadVersion = (versionId: string) => {
        const version = versionManager.loadVersion(versionId);
        if (version) {
            setNodes(version.nodes);
            setLinks(version.links);
        }
    };

    const handleThemeChange = (newTheme: 'default' | 'dark' | 'colorful') => {
        setTheme(newTheme);
    };

    const handleAddNode = () => {
        const newNode: DiagramNode = {
            id: `node_${Date.now()}`,
            type: 'component',
            label: 'New Component',
            x: 400 + Math.random() * 200,
            y: 300 + Math.random() * 200
        };
        setNodes([...nodes, newNode]);
    };

    const handleReset = () => {
        const { nodes: parsedNodes, links: parsedLinks } = parsePlantUML(plantUML);
        setNodes(parsedNodes);
        setLinks(parsedLinks);
        setSelectedNode(null);
    };

    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
            1.2
        );
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
            1 / 1.2
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
        >
            {/* Enhanced Controls */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Interactive Mode ({nodes.length} nodes, {links.length} links)
                    </span>
                    {selectedNode && (
                        <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded backdrop-blur-sm">
                            Selected: {nodes.find(n => n.id === selectedNode)?.label}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Theme Selector */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1">
                        <select
                            title="Select Theme"
                            value={theme}
                            onChange={(e) => handleThemeChange(e.target.value as 'default' | 'dark' | 'colorful')}
                            className="bg-transparent text-white text-xs border-none outline-none"
                        >
                            <option value="default">Default</option>
                            <option value="dark">Dark</option>
                            <option value="colorful">Colorful</option>
                        </select>
                    </div>

                    {/* View Options */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
                        <button
                            onClick={() => setShowLabels(!showLabels)}
                            className={`p-1.5 rounded transition-colors ${
                                showLabels ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                            title={showLabels ? 'Hide Labels' : 'Show Labels'}
                        >
                            {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        
                        <button
                            onClick={() => setShowVersions(!showVersions)}
                            className={`p-1.5 rounded transition-colors ${
                                showVersions ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                            title="Version History"
                        >
                            <History className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-xs text-white px-2 min-w-[3rem] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-3 h-3 text-white" />
                        </button>
                    </div>

                    {/* Action Controls */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
                        <button
                            onClick={handleAddNode}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-green-400"
                            title="Add Component"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                        
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-1.5 rounded transition-colors ${
                                isEditMode ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                            }`}
                            title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                        >
                            {isEditMode ? <Move className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                        </button>
                        
                        <button
                            onClick={handleReset}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
                            title="Reset Layout"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                        
                        <button
                            onClick={handleSaveVersion}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
                            title="Save Version"
                        >
                            <Save className="w-3 h-3" />
                        </button>
                        
                        <button
                            onClick={() => svgRef.current && exportDiagramAsSVG(svgRef.current, 'system-design-interactive.svg')}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
                            title="Download SVG"
                        >
                            <Download className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Version History Sidebar */}
            <AnimatePresence>
                {showVersions && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-16 right-4 w-64 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 z-20 max-h-96 overflow-y-auto"
                    >
                        <h4 className="text-white font-semibold mb-3">Version History</h4>
                        <div className="space-y-2">
                            {versionManager.getVersions().map((version) => (
                                <button
                                    key={version.id}
                                    onClick={() => handleLoadVersion(version.id)}
                                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                        versionManager.getCurrentVersionId() === version.id
                                            ? 'bg-blue-600/30 text-blue-300'
                                            : 'hover:bg-gray-700/50 text-gray-300'
                                    }`}
                                >
                                    <div className="font-medium">{version.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {version.timestamp.toLocaleString()}
                                    </div>
                                </button>
                            ))}
                            {versionManager.getVersions().length === 0 && (
                                <div className="text-gray-500 text-sm text-center py-4">
                                    No saved versions
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SVG Canvas */}
            <div className="p-4 pt-16 bg-gray-950/30 min-h-[600px]">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="600"
                    className="border border-gray-700 rounded-lg bg-gray-900/50"
                />
            </div>

            {/* Enhanced Instructions */}
            <div className="border-t border-gray-700 p-4 bg-gray-800/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>
                        <h5 className="text-gray-300 font-medium mb-2">Controls</h5>
                        <div className="space-y-1">
                            <div>💡 Click nodes to select/edit</div>
                            <div>🖱️ Drag to reposition</div>
                            <div>🔧 Edit mode: Lock positions</div>
                            <div>➕ Add new components</div>
                        </div>
                    </div>
                    <div>
                        <h5 className="text-gray-300 font-medium mb-2">Features</h5>
                        <div className="space-y-1">
                            <div>🎨 Multiple themes</div>
                            <div>📁 Version control</div>
                            <div>💾 Export as SVG</div>
                            <div>👁️ Toggle labels</div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center gap-4 text-xs">
                        <span>{nodes.length} components</span>
                        <span>{links.length} connections</span>
                        <span>Theme: {theme}</span>
                        {isDragging && <span className="text-blue-400">Dragging...</span>}
                    </div>
                    <div className="text-xs">
                        Last saved: {versionManager.getCurrentVersionId() ? 'Recently' : 'Never'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}