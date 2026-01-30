import { Text } from '@react-three/drei';
import { Seat3D } from './Seat3D';

interface Zone {
    id: string;
    name: string;
    type: string;
    price: number;
    color: string;
    rows: number;
    seatsPerRow: number;
    // Position from layout editor (2D coordinates)
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    // Elevation/height in 3D space
    elevation?: number;
}

interface Zone3DProps {
    zone: Zone;
    bookedSeats?: string[];
    selectedSeat?: string | null;
    onSeatClick?: (seatId: string, position: [number, number, number]) => void;
}

// Scale factor to convert 2D editor coordinates to 3D world coordinates
const SCALE_FACTOR = 0.08;

export function Zone3D({
    zone,
    bookedSeats = [],
    selectedSeat,
    onSeatClick,
}: Zone3DProps) {
    const seatSpacing = 1.2;
    const rowSpacing = 1.5;

    // Calculate zone dimensions based on type
    const isStanding = zone.type === 'standing';

    // For standing zones, use size from layout if available
    const zoneWidth = isStanding
        ? (zone.size?.width || 100) * SCALE_FACTOR
        : zone.seatsPerRow * seatSpacing;
    const zoneDepth = isStanding
        ? (zone.size?.height || 60) * SCALE_FACTOR
        : zone.rows * rowSpacing;

    // Convert 2D position (top-left) to 3D position (center)
    const baseX = zone.position ? (zone.position.x + (isStanding ? (zone.size?.width || 100) / 2 : (zone.seatsPerRow * seatSpacing) / 2 / SCALE_FACTOR) - 500) * SCALE_FACTOR : 0;
    const baseZ = zone.position ? (zone.position.y + (isStanding ? (zone.size?.height || 60) / 2 : (zone.rows * rowSpacing) / 2 / SCALE_FACTOR)) * SCALE_FACTOR : 8;

    // Use elevation from layout (default to 0)
    const baseElevation = zone.elevation || 0;

    // Generate seats only for seat zones
    const seats = [];
    if (!isStanding) {
        for (let row = 0; row < zone.rows; row++) {
            for (let seat = 0; seat < zone.seatsPerRow; seat++) {
                const seatId = `${zone.id}-R${row + 1}-S${seat + 1}`;
                const x = baseX + (seat - (zone.seatsPerRow - 1) / 2) * seatSpacing;
                const z = baseZ + row * rowSpacing;
                const y = baseElevation + row * 0.2;

                const status = bookedSeats.includes(seatId)
                    ? 'booked'
                    : selectedSeat === seatId
                        ? 'selected'
                        : 'available';

                seats.push(
                    <Seat3D
                        key={seatId}
                        seatId={seatId}
                        position={[x, y, z]}
                        row={row + 1}
                        seatNumber={seat + 1}
                        color={zone.color}
                        status={status}
                        onClick={onSeatClick}
                    />
                );
            }
        }
    }

    return (
        <group>
            {/* Standing zone floor */}
            {isStanding && (
                <>
                    {/* Floor */}
                    <mesh
                        position={[baseX, baseElevation + 0.05, baseZ + zoneDepth / 2]}
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
                        position={[baseX, baseElevation + 0.08, baseZ + zoneDepth / 2]}
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
                        position={[baseX, baseElevation + 0.15, baseZ + zoneDepth / 2]}
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
                        position={[baseX, baseElevation + 0.15, baseZ + zoneDepth / 2 + 1.5]}
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

            {/* Ground level floor indicator for seats (transparent) */}
            {!isStanding && baseElevation === 0 && (
                <mesh
                    position={[baseX, -0.1, baseZ + zoneDepth / 2 - rowSpacing / 2]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[zoneWidth + 2, zoneDepth + 1]} />
                    <meshStandardMaterial
                        color={zone.color}
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            )}

            {/* Elevated platform - solid block structure (seats only) */}
            {!isStanding && baseElevation > 0 && (
                <>
                    {/* Main solid platform/floor */}
                    <mesh
                        position={[baseX, baseElevation - 0.15, baseZ + zoneDepth / 2 - rowSpacing / 2]}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry args={[zoneWidth + 2, 0.3, zoneDepth + 1]} />
                        <meshStandardMaterial color="#2a2a3a" />
                    </mesh>

                    {/* Solid support block underneath */}
                    <mesh
                        position={[baseX, baseElevation / 2 - 0.15, baseZ + zoneDepth / 2 - rowSpacing / 2]}
                        castShadow
                    >
                        <boxGeometry args={[zoneWidth + 2, baseElevation, zoneDepth + 1]} />
                        <meshStandardMaterial color="#1a1a2e" />
                    </mesh>

                    {/* Front face - darker for depth */}
                    <mesh
                        position={[baseX, baseElevation / 2 - 0.15, baseZ - rowSpacing / 2 - 0.5]}
                        castShadow
                    >
                        <boxGeometry args={[zoneWidth + 2, baseElevation, 0.1]} />
                        <meshStandardMaterial color="#0f0f1a" />
                    </mesh>

                    {/* Color accent strip at top edge */}
                    <mesh
                        position={[baseX, baseElevation - 0.05, baseZ - rowSpacing / 2 - 0.5]}
                    >
                        <boxGeometry args={[zoneWidth + 2, 0.15, 0.15]} />
                        <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.3} />
                    </mesh>
                </>
            )}

            {/* Seats (only for seat zones) */}
            {seats}
        </group>
    );
}

export default Zone3D;
