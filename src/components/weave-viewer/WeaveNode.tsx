import React from 'react';
import { ProductInstance, ProductTemplate } from './types';

interface WeaveNodeProps {
    inst: ProductInstance;
    template: ProductTemplate;
}

const CONNECTOR_LABELS: Record<string, string> = {
    'terminal': 'Terminal Blok',
    'rj45': 'RJ45 Ethernet',
    'usb-a': 'USB Type-A',
    'usb-c': 'USB Type-C',
    'hdmi': 'HDMI',
    'power-ac': 'AC Güç',
    'power-dc': 'DC Güç',
    'audio-jack': '3.5mm Jack',
    'db9': 'DB9 Seri',
    'none': 'Pin / Lehim',
    'generic': 'Genel'
};

export const WeaveNode: React.FC<WeaveNodeProps> = ({ inst, template }) => {
    const w = inst.width || template.width;
    const h = inst.height || template.height;
    const r = inst.rotation || 0;
    
    // Label Logic
    const labelConfig = inst.labelConfig || { visible: true, fontSize: 14, color: '#ffffff', backgroundColor: '#000000', position: 'bottom' };
    const labelVisible = labelConfig.visible !== false;
    const labelPos = labelConfig.position || 'bottom';
    
    // Bounding Box Height for label positioning
    const rad = r * Math.PI / 180;
    const bboxH = w * Math.abs(Math.sin(rad)) + h * Math.abs(Math.cos(rad));

    return (
        <div
            style={{ 
                left: inst.x, 
                top: inst.y, 
                width: w, 
                height: h,
                position: 'absolute',
                zIndex: 10
            }}
            className="flex items-center justify-center pointer-events-none" 
        >
            <div
                className="relative w-full h-full group"
                style={{ 
                    transform: `rotate(${r}deg)`,
                }}
            >
                {/* Border/Container on Hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/50 transition-colors rounded-sm pointer-events-none" />

                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={template.imageUrl} 
                    alt={template.name} 
                    className="w-full h-full object-contain select-none p-1"
                    style={{ 
                         transform: `scaleX(${inst.mirrored ? -1 : 1})`,
                    }}
                    draggable={false}
                />
                
                {/* Ports */}
                {template.ports.map(port => {
                    let portX = port.x;
                    if (inst.mirrored) portX = 100 - portX;
                    
                    // Color Logic matching Weave
                    // Note: Simplified for Viewer, assuming no customColor prop unless passed in template (not inst)
                    // Weave ProductNode uses: startPort logic (not relevant here) & type logic
                    let bg = '#14b8a6'; // Default Teal (Bi/Generic)
                    if (port.type === 'input') bg = '#3b82f6'; // Blue
                    else if (port.type === 'output') bg = '#ef4444'; // Red
                    // @ts-ignore
                    if (port.isGround) bg = '#52525b'; // Zinc-600
                    
                    return (
                        <div
                            key={port.id}
                            className={`absolute w-4 h-4 -ml-2 -mt-2 border border-zinc-900 rounded-full z-20 shadow-sm flex items-center justify-center group/port pointer-events-auto hover:scale-125 transition-transform cursor-help`}
                            style={{ 
                                left: `${portX}%`, 
                                top: `${port.y}%`,
                                backgroundColor: bg
                            }}
                        >
                             <div className="w-1.5 h-1.5 bg-black/30 rounded-full" />
                             
                             {/* Tooltip */}
                             <div 
                                className="absolute left-1/2 -translate-x-1/2 -top-10 bg-zinc-900/95 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white whitespace-nowrap hidden group-hover/port:block z-[60] shadow-xl pointer-events-none" 
                                style={{ transform: `rotate(${-r}deg)` }}
                             >
                                <div className="font-bold text-center">{port.label}</div>
                                <div className="text-[10px] text-zinc-400 text-center">{CONNECTOR_LABELS[port.connectorType] || port.connectorType}</div>
                                {/* @ts-ignore */}
                                {port.isPower && (
                                    <div className={`text-[9px] font-mono font-bold mt-0.5 pt-0.5 border-t border-zinc-700 ${port.isGround ? 'text-zinc-400' : 'text-yellow-400'}`}>
                                        {/* @ts-ignore */}
                                        {port.isGround ? 'GND' : `${port.voltage}V`}
                                    </div>
                                )}
                             </div>
                        </div>
                    );
                })}


                {/* Label (Always visible if configured) */}
                {labelVisible && (
                    <div 
                        className={`absolute font-bold text-center py-1 px-3 rounded pointer-events-none whitespace-nowrap shadow-sm z-40 transition-opacity group-hover:opacity-100 opacity-0 bg-black/80 text-white border border-white/10`}
                        style={{
                            // Simplified label positioning relative to center, using bbox estimate or fixed offsets
                            // Since we are inside rotated div, transform is tricky if we want label upright.
                            // Weave places it OUTSIDE rotation context often or counter-rotates.
                            // Here, let's keep it simple: Counter-rotate the label so it stays upright relative to screen?
                            // No, typically labels rotate WITH component in schematics unless purely annotation.
                            // Weave ProductNode rotates it. Let's match Weave logic but localized.
                            // Actually Weave's logic puts it absolute relative to the div which IS rotated.
                            // Wait, Weave's code: top: ... translate(-50%, -50%).
                            fontSize: `${labelConfig.fontSize}px`,
                            top: labelPos === 'top' ? '-25px' : labelPos === 'center' ? '50%' : 'calc(100% + 15px)',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {template.name}
                    </div>
                )}
            </div>
        </div>
    );
};
