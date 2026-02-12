import { useRef, useState, useEffect } from 'react';
import { Text, RoundedBox, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

interface Stage3DProps {
    position?: [number, number, number];
    width?: number;
    depth?: number;
    height?: number;
    name?: string;
    hideScreen?: boolean;
    videoUrl?: string;
    screenHeight?: number;
    screenWidthRatio?: number;
}

export function Stage3D({
    position = [0, 0, 0],
    width = 20,
    depth = 8,
    height = 1.5,
    name = 'STAGE',
    hideScreen = false,
    videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    screenHeight = 5,
    screenWidthRatio = 0.9,
    rotation = 0,
}: Stage3DProps & { rotation?: number }) {
    // Video texture
    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

    useEffect(() => {
        if (!hideScreen && videoUrl) {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = 'Anonymous';
            video.loop = true;
            video.muted = true;
            video.play().catch(e => console.warn("Video autoplay failed", e));

            const texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.colorSpace = THREE.SRGBColorSpace;

            setVideoTexture(texture);

            return () => {
                video.pause();
                video.remove();
                texture.dispose();
            };
        }
    }, [hideScreen, videoUrl]);

    // Adjust light positions based on stage width
    const lightPositions = [];
    const lightCount = Math.max(2, Math.floor(width / 5));
    for (let i = 0; i < lightCount; i++) {
        const x = ((i / (lightCount - 1)) - 0.5) * (width * 0.8);
        lightPositions.push(x);
    }

    // Calculate screen dimensions
    const screenWidth = width * screenWidthRatio;
    const actualScreenHeight = screenHeight;

    return (
        <group position={position} rotation={[0, -rotation * Math.PI / 180, 0]}>
            {/* Main stage platform with reflection - Optimized */}
            <RoundedBox
                args={[width, height, depth]}
                radius={0.2}
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.8}
                    metalness={0.2}
                />
            </RoundedBox>

            {/* Stage front decoration */}
            <mesh position={[0, height / 2, depth / 2 + 0.1]}>
                <boxGeometry args={[width, height, 0.2]} />
                <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Stage name text (Glowing) */}
            <Text
                position={[0, height + 0.5, depth / 2 + 0.2]}
                fontSize={Math.min(1.5, width * 0.08)}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#ff3366"
            >
                {name}
                <meshBasicMaterial attach="material" color="#ffffff" toneMapped={false} />
            </Text>

            {/* Back screen - Video Wall */}
            {!hideScreen && (
                <group position={[0, height + (actualScreenHeight / 2) + 0.5, -depth / 2 + 0.5]}>
                    {/* Screen Frame */}
                    <mesh position={[0, 0, -0.1]}>
                        <boxGeometry args={[screenWidth + 0.4, actualScreenHeight + 0.4, 0.2]} />
                        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Screen Content - Offset z to prevent z-fighting with frame */}
                    <mesh position={[0, 0, 0.02]}>
                        <planeGeometry args={[screenWidth, actualScreenHeight]} />
                        {videoTexture ? (
                            <meshBasicMaterial map={videoTexture} toneMapped={false} />
                        ) : (
                            <meshStandardMaterial
                                color="#000000"
                                emissive="#1a1a1a"
                                emissiveIntensity={0.5}
                            />
                        )}
                    </mesh>

                    {/* Left/Right Speakers/Truss (Decoration) - Adjusted for screen width */}
                    <mesh position={[-(screenWidth / 2) - 1, 0, 0]}>
                        <boxGeometry args={[1, actualScreenHeight, 1]} />
                        <meshStandardMaterial color="#222" wireframe />
                    </mesh>
                    <mesh position={[(screenWidth / 2) + 1, 0, 0]}>
                        <boxGeometry args={[1, actualScreenHeight, 1]} />
                        <meshStandardMaterial color="#222" wireframe />
                    </mesh>
                </group>
            )}
        </group>
    );
}

export default Stage3D;
