import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Seat3DProps {
    position: [number, number, number];
    seatId: string;
    row: number;
    seatNumber: number;
    color: string;
    status?: 'available' | 'selected' | 'booked';
    onClick?: (seatId: string, position: [number, number, number]) => void;
}

const statusColors = {
    available: null, // Use zone color
    selected: '#22c55e',
    booked: '#6b7280',
};

export function Seat3D({
    position,
    seatId,
    row,
    seatNumber,
    color,
    status = 'available',
    onClick,
}: Seat3DProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const seatColor = status === 'available' ? color : statusColors[status];
    const finalColor = seatColor || color;

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (status !== 'booked' && onClick) {
            onClick(seatId, position);
        }
    };

    const handlePointerOver = () => {
        setHovered(true);
        document.body.style.cursor = status === 'booked' ? 'not-allowed' : 'pointer';
    };

    const handlePointerOut = () => {
        setHovered(false);
        document.body.style.cursor = 'auto';
    };

    return (
        <group position={position}>
            {/* Seat cushion - simple box, facing stage */}
            <mesh
                ref={meshRef}
                position={[0, 0.1, 0]}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                castShadow
            >
                <boxGeometry args={[0.7, 0.15, 0.6]} />
                <meshStandardMaterial
                    color={finalColor}
                    emissive={hovered ? finalColor : '#000000'}
                    emissiveIntensity={hovered ? 0.3 : 0}
                />
            </mesh>

            {/* Seat back - positioned behind seat, facing stage */}
            <mesh position={[0, 0.4, 0.28]} castShadow>
                <boxGeometry args={[0.7, 0.5, 0.1]} />
                <meshStandardMaterial
                    color={finalColor}
                    emissive={hovered ? finalColor : '#000000'}
                    emissiveIntensity={hovered ? 0.3 : 0}
                />
            </mesh>

            {/* Seat label (shown on hover) */}
            {hovered && (
                <Text
                    position={[0, 0.85, 0]}
                    fontSize={0.22}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {`R${row} S${seatNumber}`}
                </Text>
            )}
        </group>
    );
}

export default Seat3D;
