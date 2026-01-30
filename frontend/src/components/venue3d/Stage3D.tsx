import { Text, RoundedBox } from '@react-three/drei';

interface Stage3DProps {
    position?: [number, number, number];
    width?: number;
    depth?: number;
    height?: number;
    name?: string;
    hideScreen?: boolean;
}

export function Stage3D({
    position = [0, 0, 0],
    width = 20,
    depth = 8,
    height = 1.5,
    name = 'STAGE',
    hideScreen = false,
}: Stage3DProps) {
    // Adjust light positions based on stage width
    const lightPositions = [];
    const lightCount = Math.max(2, Math.floor(width / 5));
    for (let i = 0; i < lightCount; i++) {
        const x = ((i / (lightCount - 1)) - 0.5) * (width * 0.8);
        lightPositions.push(x);
    }

    return (
        <group position={position}>
            {/* Main stage platform */}
            <RoundedBox
                args={[width, height, depth]}
                radius={0.2}
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial color="#4a4a4a" />
            </RoundedBox>

            {/* Stage front decoration */}
            <mesh position={[0, height / 2, depth / 2 + 0.1]}>
                <boxGeometry args={[width, height, 0.2]} />
                <meshStandardMaterial color="#4a4a4a" />
            </mesh>

            {/* Stage lights (decorative) */}
            {lightPositions.map((x, i) => (
                <pointLight
                    key={i}
                    position={[x, height + 3, 0]}
                    color="#ff6b6b"
                    intensity={0.5}
                    distance={15}
                />
            ))}

            {/* Stage name text */}
            <Text
                position={[0, height + 0.5, depth / 2 + 0.2]}
                fontSize={Math.min(1.5, width * 0.08)}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                {name}
            </Text>

            {/* Back screen - hidden if hideScreen is true */}
            {!hideScreen && (
                <mesh position={[0, height + 3, -depth / 2]}>
                    <planeGeometry args={[width - 2, 5]} />
                    <meshStandardMaterial
                        color="#2d3748"
                        emissive="#4a5568"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            )}
        </group>
    );
}

export default Stage3D;
