'use client';

import { useEffect, useRef } from 'react';

interface VoiceVisualizationProps {
    isSpeaking: boolean;
    isListening: boolean;
    isActive: boolean;
    isDarkMode: boolean;
}

export default function VoiceVisualization({ 
    isSpeaking, 
    isListening, 
    isActive, 
    isDarkMode 
}: VoiceVisualizationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Base colors based on state and theme
            let primaryColor, secondaryColor, accentColor;
            
            if (isDarkMode) {
                if (isSpeaking) {
                    primaryColor = '#3B82F6'; // Blue
                    secondaryColor = '#60A5FA';
                    accentColor = '#93C5FD';
                } else if (isListening) {
                    primaryColor = '#10B981'; // Green
                    secondaryColor = '#34D399';
                    accentColor = '#6EE7B7';
                } else if (isActive) {
                    primaryColor = '#6B7280'; // Gray
                    secondaryColor = '#9CA3AF';
                    accentColor = '#D1D5DB';
                } else {
                    primaryColor = '#374151'; // Dark gray
                    secondaryColor = '#4B5563';
                    accentColor = '#6B7280';
                }
            } else {
                if (isSpeaking) {
                    primaryColor = '#2563EB'; // Blue
                    secondaryColor = '#3B82F6';
                    accentColor = '#60A5FA';
                } else if (isListening) {
                    primaryColor = '#059669'; // Green
                    secondaryColor = '#10B981';
                    accentColor = '#34D399';
                } else if (isActive) {
                    primaryColor = '#4B5563'; // Gray
                    secondaryColor = '#6B7280';
                    accentColor = '#9CA3AF';
                } else {
                    primaryColor = '#9CA3AF'; // Light gray
                    secondaryColor = '#D1D5DB';
                    accentColor = '#E5E7EB';
                }
            }

            // Main orb
            const baseRadius = 60;
            let radius = baseRadius;
            let opacity = 0.8;

            if (isSpeaking) {
                // Pulsing effect when speaking
                radius = baseRadius + Math.sin(time * 0.15) * 15;
                opacity = 0.7 + Math.sin(time * 0.1) * 0.3;
            } else if (isListening) {
                // Subtle breathing effect when listening
                radius = baseRadius + Math.sin(time * 0.08) * 8;
                opacity = 0.6 + Math.sin(time * 0.05) * 0.2;
            } else if (isActive) {
                // Gentle idle animation
                radius = baseRadius + Math.sin(time * 0.03) * 3;
                opacity = 0.5 + Math.sin(time * 0.02) * 0.1;
            }

            // Create gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `${primaryColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.7, `${secondaryColor}${Math.round(opacity * 0.6 * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${accentColor}00`);

            // Draw main orb
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Add sound waves when speaking
            if (isSpeaking) {
                for (let i = 1; i <= 3; i++) {
                    const waveRadius = radius + (i * 25) + Math.sin(time * 0.1 + i) * 10;
                    const waveOpacity = (0.3 - i * 0.08) * (0.5 + Math.sin(time * 0.08) * 0.5);
                    
                    ctx.strokeStyle = `${primaryColor}${Math.round(waveOpacity * 255).toString(16).padStart(2, '0')}`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Add listening indicator
            if (isListening && !isSpeaking) {
                const dots = 8;
                for (let i = 0; i < dots; i++) {
                    const angle = (i / dots) * Math.PI * 2 + time * 0.05;
                    const dotRadius = radius + 30 + Math.sin(time * 0.08 + i) * 5;
                    const x = centerX + Math.cos(angle) * dotRadius;
                    const y = centerY + Math.sin(angle) * dotRadius;
                    const dotSize = 3 + Math.sin(time * 0.1 + i) * 1;
                    const dotOpacity = 0.4 + Math.sin(time * 0.07 + i) * 0.3;
                    
                    ctx.fillStyle = `${primaryColor}${Math.round(dotOpacity * 255).toString(16).padStart(2, '0')}`;
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            time += 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isSpeaking, isListening, isActive, isDarkMode]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="w-60 h-60"
            />
            
            {/* Subtle background circle */}
            <div className={`absolute inset-0 rounded-full border-2 ${
                isDarkMode ? 'border-gray-700/30' : 'border-gray-200/50'
            }`} />
        </div>
    );
}