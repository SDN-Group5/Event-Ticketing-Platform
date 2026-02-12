import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface Person3DProps {
    position: [number, number, number];
    color?: string;
    pose?: 'sitting' | 'standing';
}

export function Person3D({ position, color = '#4a5568', pose = 'sitting' }: Person3DProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Randomize slightly for natural look
    const randomOffset = useMemo(() => Math.random() * 0.1, []);

    // Adjust height based on pose
    const yOffset = pose === 'standing' ? 0.4 : 0;

    return (
        <group ref={groupRef} position={[position[0], position[1] + yOffset, position[2]]} rotation={[0, Math.PI, 0]}>
            {/* Torso - Main body */}
            <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.35, 0.45, 0.2]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.1]} />
                <meshStandardMaterial color="#f4a460" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.85, 0]} castShadow>
                <boxGeometry args={[0.25, 0.28, 0.25]} />
                <meshStandardMaterial color="#f4a460" />
            </mesh>

            {/* Hair/Hat (Simple top box) */}
            <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[0.27, 0.05, 0.27]} />
                <meshStandardMaterial color="#1a202c" />
            </mesh>

            {/* Arms */}
            {pose === 'sitting' ? (
                <>
                    {/* Sitting Arms - Resting on lap */}
                    <mesh position={[-0.23, 0.45, 0]} rotation={[0, 0, -0.2]} castShadow>
                        <boxGeometry args={[0.12, 0.35, 0.12]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[-0.25, 0.25, 0.2]} rotation={[-1, 0, -0.2]} castShadow>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#f4a460" />
                    </mesh>
                    <mesh position={[0.23, 0.45, 0]} rotation={[0, 0, 0.2]} castShadow>
                        <boxGeometry args={[0.12, 0.35, 0.12]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.25, 0.25, 0.2]} rotation={[-1, 0, 0.2]} castShadow>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#f4a460" />
                    </mesh>
                </>
            ) : (
                <>
                    {/* Standing Arms - By sides */}
                    <mesh position={[-0.23, 0.35, 0]} rotation={[0, 0, 0.1]} castShadow>
                        <boxGeometry args={[0.12, 0.5, 0.12]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[-0.25, 0.05, 0]} castShadow>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        <meshStandardMaterial color="#f4a460" />
                    </mesh>
                    <mesh position={[0.23, 0.35, 0]} rotation={[0, 0, -0.1]} castShadow>
                        <boxGeometry args={[0.12, 0.5, 0.12]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.25, 0.05, 0]} castShadow>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        <meshStandardMaterial color="#f4a460" />
                    </mesh>
                </>
            )}

            {/* Legs */}
            {pose === 'sitting' ? (
                <>
                    {/* Sitting Legs */}
                    <mesh position={[-0.12, 0.05, 0.25]} rotation={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.12, 0.5]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[-0.12, -0.2, 0.45]} rotation={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.4, 0.12]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[-0.12, -0.4, 0.5]} castShadow>
                        <boxGeometry args={[0.13, 0.1, 0.25]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>

                    <mesh position={[0.12, 0.05, 0.25]} rotation={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.12, 0.5]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[0.12, -0.2, 0.45]} rotation={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.4, 0.12]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[0.12, -0.4, 0.5]} castShadow>
                        <boxGeometry args={[0.13, 0.1, 0.25]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>
                </>
            ) : (
                <>
                    {/* Standing Legs */}
                    <mesh position={[-0.10, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.75, 0.14]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[-0.10, -0.7, 0.05]} castShadow>
                        <boxGeometry args={[0.15, 0.1, 0.25]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>

                    <mesh position={[0.10, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.75, 0.14]} />
                        <meshStandardMaterial color="#2d3748" />
                    </mesh>
                    <mesh position={[0.10, -0.7, 0.05]} castShadow>
                        <boxGeometry args={[0.15, 0.1, 0.25]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>
                </>
            )}

        </group>
    );
}

export default Person3D;
