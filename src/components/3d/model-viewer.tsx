'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, useProgress, Grid } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-medium">{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  );
}

function CameraLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (light.current) {
      light.current.position.copy(state.camera.position);
    }
  });
  return <pointLight ref={light} intensity={1} decay={0} distance={0} />;
}

function Model({ url }: { url: string }) {
  // Determine file type, ignoring query parameters (e.g. ?alt=media&token=...)
  const cleanUrl = url.split('?')[0].toLowerCase();
  const isObj = cleanUrl.endsWith('.obj');
  
  // Use proxy to bypass CORS
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  
  if (isObj) {
      return <ObjModel url={proxyUrl} />;
  }
  return <GltfModel url={proxyUrl} />;
}

function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
}

function GltfModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

interface ModelViewerProps {
  url: string;
  className?: string;
}

export function ModelViewer({ url, className }: ModelViewerProps) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <CameraLight />
        
        {/* Infinite Grid for ground reference */}
        <Grid 
            infiniteGrid 
            fadeDistance={50} 
            fadeStrength={5}
            cellColor="#444" 
            sectionColor="#666"
            position={[0, -0.01, 0]}
        />

        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.6}>
            <Model url={url} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate={false} makeDefault />
      </Canvas>
    </div>
  );
}
