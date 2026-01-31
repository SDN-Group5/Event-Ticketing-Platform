import { useRef, useState, useMemo, useLayoutEffect } from 'react';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import {
    SCALE_FACTOR_3D,
    SEAT_SPACING_3D,
    ROW_SPACING_3D,
    SEAT_WIDTH_3D,
    SEAT_DEPTH_3D,
    SEAT_HEIGHT_3D,
    SEAT_BACK_HEIGHT_3D,
} from '../../constants/layoutConstants';

interface Zone {
    id: string;
    name: string;
    type: string;
    price: number;
    color: string;
    rows: number;
    seatsPerRow: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    elevation?: number;
    rotation?: number;
}

interface Zone3DProps {
    zone: Zone;
    bookedSeats?: string[];
    selectedSeat?: string | null;
    canvasWidth?: number;
    onSeatClick?: (seatId: string, position: [number, number, number]) => void;
}

// Use shared constants for consistent 2D-3D mapping
const SCALE_FACTOR = SCALE_FACTOR_3D;
const SEAT_SPACING = SEAT_SPACING_3D;
const ROW_SPACING = ROW_SPACING_3D;

// Status colors
const COLOR_SELECTED = new THREE.Color('#22c55e');
const COLOR_BOOKED = new THREE.Color('#6b7280');
const COLOR_HOVER = new THREE.Color('#ffffff'); // Highlight color

export function Zone3D({
    zone,
    bookedSeats = [],
    selectedSeat,
    onSeatClick,
    canvasWidth = 1000,
}: Zone3DProps) {
    // Refs for instanced meshes
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const backMeshRef = useRef<THREE.InstancedMesh>(null);

    // State for interactions
    const [hoveredInstance, setHoveredInstance] = useState<number | null>(null);

    // Calculate dimensions
    const isStanding = zone.type === 'standing';
    const zoneWidth = isStanding
        ? (zone.size?.width || 100) * SCALE_FACTOR
        : zone.seatsPerRow * SEAT_SPACING;
    const zoneDepth = isStanding
        ? (zone.size?.height || 60) * SCALE_FACTOR
        : zone.rows * ROW_SPACING;

    // Base position
    // Center X: (position.x + width/2 - canvasWidth/2)
    const baseX = zone.position ? (zone.position.x + (isStanding ? (zone.size?.width || 100) / 2 : (zone.seatsPerRow * SEAT_SPACING) / 2 / SCALE_FACTOR) - canvasWidth / 2) * SCALE_FACTOR : 0;
    const baseZ = zone.position ? (zone.position.y + (isStanding ? (zone.size?.height || 60) / 2 : (zone.rows * ROW_SPACING) / 2 / SCALE_FACTOR)) * SCALE_FACTOR : 8;
    const baseElevation = zone.elevation || 0;

    // Calculate seat positions and ids
    const { seatData, seatCount } = useMemo(() => {
        if (isStanding) return { seatData: [], seatCount: 0 };

        const data = [];
        const count = zone.rows * zone.seatsPerRow;

        for (let row = 0; row < zone.rows; row++) {
            for (let seat = 0; seat < zone.seatsPerRow; seat++) {
                const seatId = `${zone.id}-R${row + 1}-S${seat + 1}`;
                const x = (seat - (zone.seatsPerRow - 1) / 2) * SEAT_SPACING;
                const z = row * ROW_SPACING - (zone.rows * ROW_SPACING) / 2 + ROW_SPACING / 2; // Center rows
                const y = baseElevation + row * 0.2;

                data.push({
                    id: seatId,
                    position: [x, y, z] as [number, number, number],
                    row: row + 1,
                    seatNumber: seat + 1
                });
            }
        }
        return { seatData: data, seatCount: count };
    }, [zone, baseX, baseZ, baseElevation, isStanding]);

    // Update instances
    useLayoutEffect(() => {
        if (isStanding || !meshRef.current || !backMeshRef.current) return;

        const tempObject = new THREE.Object3D();
        const baseColor = new THREE.Color(zone.color);

        seatData.forEach((seat, i) => {
            // Set position
            tempObject.position.set(seat.position[0], seat.position[1] + 0.1, seat.position[2]);
            tempObject.rotation.set(0, 0, 0); // Reset rotation
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Set position for back rest
            tempObject.position.set(seat.position[0], seat.position[1] + 0.4, seat.position[2] + 0.28);
            tempObject.updateMatrix();
            backMeshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Determine color
            let color = baseColor;
            if (bookedSeats.includes(seat.id)) {
                color = COLOR_BOOKED;
            } else if (selectedSeat === seat.id) {
                color = COLOR_SELECTED;
            }

            if (hoveredInstance === i && !bookedSeats.includes(seat.id)) {
                // Mix with white for hover effect
                color = color.clone().lerp(COLOR_HOVER, 0.3);
            }

            meshRef.current!.setColorAt(i, color);
            backMeshRef.current!.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.instanceColor!.needsUpdate = true;

        backMeshRef.current.instanceMatrix.needsUpdate = true;
        if (backMeshRef.current.instanceColor) backMeshRef.current.instanceColor.needsUpdate = true;

    }, [seatData, bookedSeats, selectedSeat, hoveredInstance, zone.color, isStanding]);

    // Handlers
    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        if (isStanding || e.instanceId === undefined) return;
        e.stopPropagation();

        const seat = seatData[e.instanceId];
        if (seat && !bookedSeats.includes(seat.id) && onSeatClick) {
            // Calculate world position by adding zone's base position to seat's local position
            const worldPosition: [number, number, number] = [
                baseX + seat.position[0],
                seat.position[1],
                baseZ + seat.position[2]
            ];
            onSeatClick(seat.id, worldPosition);
        }
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (isStanding || e.instanceId === undefined) return;
        e.stopPropagation();

        if (hoveredInstance !== e.instanceId) {
            setHoveredInstance(e.instanceId);
            document.body.style.cursor = bookedSeats.includes(seatData[e.instanceId].id) ? 'not-allowed' : 'pointer';
        }
    };

    const handlePointerOut = () => {
        if (isStanding) return;
        setHoveredInstance(null);
        document.body.style.cursor = 'auto';
    };

    // Helper to convert deg to rad
    const rotationRad = (zone.rotation || 0) * Math.PI / 180;

    return (
        <group position={[baseX, 0, baseZ]} rotation={[0, -rotationRad, 0]}>
            {/* Standing zone rendering (unchanged) */}
            {isStanding && (
                <>
                    {/* Floor */}
                    <mesh
                        position={[0, baseElevation + 0.05, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[zoneWidth, zoneDepth]} />
                        <meshStandardMaterial
                            color={zone.color}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>

                    {/* Border outline */}
                    <mesh
                        position={[0, baseElevation + 0.08, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <ringGeometry args={[Math.min(zoneWidth, zoneDepth) / 2 - 0.2, Math.min(zoneWidth, zoneDepth) / 2, 4]} />
                        <meshStandardMaterial
                            color={zone.color}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>

                    {/* Zone label */}
                    <Text
                        position={[0, baseElevation + 0.15, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={1.2}
                        color={zone.color}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {zone.name}
                    </Text>

                    {/* Price badge */}
                    <Text
                        position={[0, baseElevation + 0.15, 1.5]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.8}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        ${zone.price}
                    </Text>
                </>
            )}

            {/* Seat Zones */}
            {!isStanding && (
                <>
                    {baseElevation === 0 && (
                        <mesh
                            position={[0, -0.1, 0]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            receiveShadow
                        >
                            <planeGeometry args={[zoneWidth + 0.3, zoneDepth + 0.2]} />
                            <meshStandardMaterial
                                color={zone.color}
                                transparent
                                opacity={0.2}
                            />
                        </mesh>
                    )}

                    {baseElevation > 0 && (
                        <>
                            {/* Main solid platform/floor */}
                            <mesh
                                position={[0, baseElevation - 0.15, 0]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[zoneWidth + 0.3, 0.3, zoneDepth + 0.2]} />
                                <meshStandardMaterial color="#2a2a3a" />
                            </mesh>

                            {/* Solid support block underneath */}
                            <mesh
                                position={[0, baseElevation / 2 - 0.15, 0]}
                                castShadow
                            >
                                <boxGeometry args={[zoneWidth + 0.3, baseElevation, zoneDepth + 0.2]} />
                                <meshStandardMaterial color="#1a1a2e" />
                            </mesh>

                            {/* Front face - darker for depth */}
                            <mesh
                                position={[0, baseElevation / 2 - 0.15, -zoneDepth / 2]}
                                castShadow
                            >
                                <boxGeometry args={[zoneWidth + 0.3, baseElevation, 0.1]} />
                                <meshStandardMaterial color="#0f0f1a" />
                            </mesh>

                            {/* Color accent strip at top edge */}
                            <mesh
                                position={[0, baseElevation - 0.05, -zoneDepth / 2]}
                            >
                                <boxGeometry args={[zoneWidth + 0.3, 0.15, 0.15]} />
                                <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.3} />
                            </mesh>
                        </>
                    )}

                    {/* INSTANCED MESHES FOR SEATS */}
                    <instancedMesh
                        ref={meshRef}
                        args={[undefined, undefined, seatCount]}
                        onClick={handleClick}
                        onPointerMove={handlePointerMove}
                        onPointerOut={handlePointerOut}
                        castShadow
                    >
                        <boxGeometry args={[SEAT_WIDTH_3D, SEAT_HEIGHT_3D, SEAT_DEPTH_3D]} />
                        <meshStandardMaterial />
                    </instancedMesh>

                    <instancedMesh
                        ref={backMeshRef}
                        args={[undefined, undefined, seatCount]}
                        castShadow
                    >
                        <boxGeometry args={[SEAT_WIDTH_3D, SEAT_BACK_HEIGHT_3D, 0.1]} />
                        <meshStandardMaterial />
                    </instancedMesh>

                    {/* Hover Tooltip - Positioned at hovered seat */}
                    {hoveredInstance !== null && seatData[hoveredInstance] && (
                        <Html
                            position={[
                                seatData[hoveredInstance].position[0],
                                seatData[hoveredInstance].position[1] + 1,
                                seatData[hoveredInstance].position[2]
                            ]}
                            center
                            distanceFactor={10}
                        >
                            <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/20">
                                {`Row ${seatData[hoveredInstance].row} Seat ${seatData[hoveredInstance].seatNumber}`}
                                {bookedSeats.includes(seatData[hoveredInstance].id) && <span className="text-red-400 ml-1">(Booked)</span>}
                            </div>
                        </Html>
                    )}
                </>
            )}
        </group>
    );
}

export default Zone3D;
