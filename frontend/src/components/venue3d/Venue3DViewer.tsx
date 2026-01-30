import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Stage3D } from './Stage3D';
import { Zone3D } from './Zone3D';

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
}

interface Stage {
    id: string;
    name: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    color: string;
    hideScreen?: boolean;
    elevation?: number;
}


interface Venue3DViewerProps {
    zones: Zone[];
    stages?: Stage[];
    isAdmin?: boolean;
    bookedSeats?: string[];
    onSeatSelect?: (seatId: string, seatInfo: SeatInfo) => void;
}

interface SeatInfo {
    seatId: string;
    position: [number, number, number];
    zoneName: string;
    row: number;
    seatNumber: number;
}

interface CameraControllerProps {
    targetPosition: [number, number, number] | null;
    isFirstPerson: boolean;
    stagePosition: [number, number, number];
    onReady?: () => void;
}

// Scale factor for converting 2D to 3D coordinates
const SCALE_FACTOR = 0.08;

// Free look controls - WASD movement + mouse rotation (no orbit pivot)
function FreeLookControls({ enabled }: { enabled: boolean }) {
    const { camera, gl } = useThree();
    const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false });
    const isPointerDown = useRef(false);
    const previousPointer = useRef({ x: 0, y: 0 });
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const moveSpeed = 0.8;

    useEffect(() => {
        if (!enabled) return;

        // Initialize euler from current camera rotation
        euler.current.setFromQuaternion(camera.quaternion);

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = false;
            }
        };

        const canvas = gl.domElement;

        const onPointerDown = (e: PointerEvent) => {
            isPointerDown.current = true;
            previousPointer.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        };

        const onPointerUp = () => {
            isPointerDown.current = false;
            canvas.style.cursor = 'grab';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isPointerDown.current) return;

            const deltaX = e.clientX - previousPointer.current.x;
            const deltaY = e.clientY - previousPointer.current.y;

            // Update euler angles
            euler.current.y -= deltaX * 0.003;
            euler.current.x -= deltaY * 0.003;

            // Clamp vertical rotation
            euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));

            previousPointer.current = { x: e.clientX, y: e.clientY };
        };

        const onWheel = (e: WheelEvent) => {
            // Zoom by moving camera forward/backward
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, -e.deltaY * 0.05);

            // Clamp height
            camera.position.y = Math.max(2, Math.min(100, camera.position.y));
        };

        canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerUp);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('wheel', onWheel);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.style.cursor = 'auto';
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointerleave', onPointerUp);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [enabled, camera, gl]);

    useFrame(() => {
        if (!enabled) return;

        // Apply rotation
        camera.quaternion.setFromEuler(euler.current);

        // Get movement directions
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

        // Forward/Backward (W/S)
        if (keys.current.w) {
            camera.position.addScaledVector(direction, moveSpeed);
        }
        if (keys.current.s) {
            camera.position.addScaledVector(direction, -moveSpeed);
        }

        // Left/Right (A/D)
        if (keys.current.a) {
            camera.position.addScaledVector(right, -moveSpeed);
        }
        if (keys.current.d) {
            camera.position.addScaledVector(right, moveSpeed);
        }

        // Up/Down (Q/E)
        if (keys.current.q) {
            camera.position.y -= moveSpeed * 0.5;
        }
        if (keys.current.e) {
            camera.position.y += moveSpeed * 0.5;
        }

        // Clamp height
        camera.position.y = Math.max(2, Math.min(100, camera.position.y));
    });

    return null;
}

// Camera animation controller with first-person look controls
function CameraController({ targetPosition, isFirstPerson, stagePosition, onReady }: CameraControllerProps) {
    const { camera } = useThree();
    const animating = useRef(false);
    const animationComplete = useRef(false);
    const targetRef = useRef<THREE.Vector3 | null>(null);

    useFrame(() => {
        if (targetPosition && isFirstPerson && !animationComplete.current) {
            if (!animating.current) {
                animating.current = true;
                targetRef.current = new THREE.Vector3(
                    targetPosition[0],
                    targetPosition[1] + 1.6, // Eye height
                    targetPosition[2]
                );
            }

            if (targetRef.current) {
                // Smoothly interpolate camera position
                camera.position.lerp(targetRef.current, 0.08);

                // Look at stage
                camera.lookAt(new THREE.Vector3(...stagePosition));

                // Check if animation is complete
                if (camera.position.distanceTo(targetRef.current) < 0.1) {
                    animating.current = false;
                    animationComplete.current = true;
                    onReady?.();
                }
            }
        }

        // Reset when exiting first person mode
        if (!isFirstPerson) {
            animating.current = false;
            animationComplete.current = false;
            targetRef.current = null;
        }
    });

    return null;
}

// First person controls component - rotates camera in place (not orbiting)
function FirstPersonControls({
    enabled,
    cameraPosition
}: {
    enabled: boolean;
    cameraPosition: [number, number, number] | null;
}) {
    const { camera, gl } = useThree();
    const isPointerDown = useRef(false);
    const previousPointer = useRef({ x: 0, y: 0 });
    const rotation = useRef({ yaw: 0, pitch: 0 });
    const initialized = useRef(false);

    useEffect(() => {
        if (!enabled || !cameraPosition) {
            initialized.current = false;
            return;
        }

        // Initialize rotation based on looking at origin (stage area)
        if (!initialized.current) {
            const dx = 0 - cameraPosition[0]; // Look towards center
            const dz = 0 - cameraPosition[2];
            rotation.current.yaw = Math.atan2(dx, -dz);
            rotation.current.pitch = -0.1; // Slight downward look
            initialized.current = true;
        }

        const canvas = gl.domElement;

        const onPointerDown = (e: PointerEvent) => {
            isPointerDown.current = true;
            previousPointer.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        };

        const onPointerUp = () => {
            isPointerDown.current = false;
            canvas.style.cursor = 'grab';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isPointerDown.current) return;

            const deltaX = e.clientX - previousPointer.current.x;
            const deltaY = e.clientY - previousPointer.current.y;

            // Update rotation (inverted for natural feel)
            rotation.current.yaw -= deltaX * 0.003;
            rotation.current.pitch -= deltaY * 0.003;

            // Clamp pitch to avoid flipping
            rotation.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.pitch));

            previousPointer.current = { x: e.clientX, y: e.clientY };
        };

        canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerUp);
        canvas.addEventListener('pointermove', onPointerMove);

        return () => {
            canvas.style.cursor = 'auto';
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointerleave', onPointerUp);
            canvas.removeEventListener('pointermove', onPointerMove);
        };
    }, [enabled, cameraPosition, gl]);

    // Apply rotation every frame
    useFrame(() => {
        if (!enabled || !cameraPosition) return;

        // Calculate look direction from yaw and pitch
        const lookX = Math.sin(rotation.current.yaw) * Math.cos(rotation.current.pitch);
        const lookY = Math.sin(rotation.current.pitch);
        const lookZ = -Math.cos(rotation.current.yaw) * Math.cos(rotation.current.pitch);

        // Set camera to look in that direction
        camera.lookAt(
            camera.position.x + lookX,
            camera.position.y + lookY,
            camera.position.z + lookZ
        );
    });

    return null;
}

// Scene content
function VenueScene({
    zones,
    stages,
    isAdmin,
    bookedSeats,
    selectedSeat,
    firstPersonMode,
    firstPersonReady,
    seatPosition,
    stagePosition,
    onSeatClick,
    onFirstPersonReady,
    isDayMode,
}: {
    zones: Zone[];
    stages: Stage[];
    isAdmin: boolean;
    bookedSeats: string[];
    selectedSeat: string | null;
    firstPersonMode: boolean;
    firstPersonReady: boolean;
    seatPosition: [number, number, number] | null;
    stagePosition: [number, number, number];
    onSeatClick: (seatId: string, position: [number, number, number]) => void;
    onFirstPersonReady: () => void;
    isDayMode: boolean;
}) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={isDayMode ? 0.8 : 0.4} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={isDayMode ? 1.2 : 1}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />

            {/* Environment - Keep night for stability, use lighting for day/night feel */}
            <Environment preset="night" />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 30]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={isDayMode ? "#e2e8f0" : "#1a1a1a"} />
            </mesh>

            {/* Grid helper (admin only) */}
            {isAdmin && (
                <Grid
                    position={[0, -0.49, 30]}
                    args={[200, 200]}
                    cellSize={2}
                    cellThickness={0.5}
                    cellColor="#333333"
                    sectionSize={10}
                    sectionThickness={1}
                    sectionColor="#444444"
                    fadeDistance={80}
                />
            )}

            {/* Stages from layout */}
            {stages.map((stage) => {
                const stageWidth = (stage.size?.width || 200) * SCALE_FACTOR;
                const stageDepth = (stage.size?.height || 80) * SCALE_FACTOR;

                // Convert top-left (2D) to center (3D)
                const stageX = (stage.position.x + (stage.size?.width || 200) / 2 - 500) * SCALE_FACTOR;
                const stageZ = (stage.position.y + (stage.size?.height || 80) / 2) * SCALE_FACTOR;

                return (
                    <Stage3D
                        key={stage.id}
                        position={[stageX, 0, stageZ]}
                        width={stageWidth}
                        depth={stageDepth}
                        name={stage.name}
                        hideScreen={stage.hideScreen}
                        height={typeof stage.elevation === 'number' ? Math.max(0.1, stage.elevation) : 1.5}
                    />
                );
            })}

            {/* Default stage if no stages from layout */}
            {stages.length === 0 && (
                <Stage3D position={[0, 0, 0]} />
            )}

            {/* Zones with seats */}
            {zones.map((zone) => (
                <Zone3D
                    key={zone.id}
                    zone={zone}
                    bookedSeats={bookedSeats}
                    selectedSeat={selectedSeat}
                    onSeatClick={onSeatClick}
                />
            ))}

            {/* Camera controller for first-person view */}

            {/* Camera controller for first-person view */}
            <CameraController
                targetPosition={seatPosition}
                isFirstPerson={firstPersonMode}
                stagePosition={stagePosition}
                onReady={onFirstPersonReady}
            />

            {/* First person rotation controls */}
            <FirstPersonControls
                enabled={firstPersonMode && firstPersonReady}
                cameraPosition={seatPosition}
            />

            {/* Free look controls - WASD + mouse rotation */}
            <FreeLookControls enabled={!firstPersonMode} />
        </>
    );
}

export function Venue3DViewer({
    zones,
    stages = [],
    isAdmin = false,
    bookedSeats = [],
    onSeatSelect,
}: Venue3DViewerProps) {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [seatPosition, setSeatPosition] = useState<[number, number, number] | null>(null);
    const [firstPersonMode, setFirstPersonMode] = useState(false);
    const [firstPersonReady, setFirstPersonReady] = useState(false);
    const [isDayMode, setIsDayMode] = useState(false);

    // Calculate stage position for camera to look at
    const stagePosition: [number, number, number] = stages.length > 0
        ? [
            (stages[0].position.x - 500) * SCALE_FACTOR,
            2,
            stages[0].position.y * SCALE_FACTOR
        ]
        : [0, 2, 0];

    const handleSeatClick = useCallback(
        (seatId: string, position: [number, number, number]) => {
            setSelectedSeat(seatId);
            setSeatPosition(position);

            // Parse seat info from seatId (format: zoneId-R{row}-S{seat})
            const parts = seatId.split('-');
            const zoneId = parts[0];
            const row = parseInt(parts[1].replace('R', ''));
            const seatNumber = parseInt(parts[2].replace('S', ''));
            const zone = zones.find((z) => z.id === zoneId);

            if (onSeatSelect) {
                onSeatSelect(seatId, {
                    seatId,
                    position,
                    zoneName: zone?.name || 'Unknown',
                    row,
                    seatNumber,
                });
            }
        },
        [zones, onSeatSelect]
    );

    const handleViewFromSeat = () => {
        if (seatPosition) {
            setFirstPersonMode(true);
            setFirstPersonReady(false);
        }
    };

    const handleResetView = () => {
        setFirstPersonMode(false);
        setFirstPersonReady(false);
    };

    const handleFirstPersonReady = useCallback(() => {
        setFirstPersonReady(true);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas shadows>
                <PerspectiveCamera
                    makeDefault
                    position={isAdmin ? [0, 60, 80] : [0, 30, 60]}
                    fov={60}
                />
                <VenueScene
                    zones={zones}
                    stages={stages}
                    isAdmin={isAdmin}
                    bookedSeats={bookedSeats}
                    selectedSeat={selectedSeat}
                    firstPersonMode={firstPersonMode}
                    firstPersonReady={firstPersonReady}
                    seatPosition={seatPosition}
                    stagePosition={stagePosition}
                    onSeatClick={handleSeatClick}
                    onFirstPersonReady={handleFirstPersonReady}
                    isDayMode={isDayMode}
                />
            </Canvas>

            {/* UI Overlay */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                }}
            >
                {/* Selected seat info */}
                {selectedSeat && (
                    <div
                        style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            pointerEvents: 'auto',
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            Selected: {selectedSeat}
                        </div>
                        <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                            Click "View from Seat" to see first-person view
                        </div>
                    </div>
                )}

                {/* View controls */}
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        pointerEvents: 'auto',
                    }}
                >
                    {selectedSeat && !firstPersonMode && (
                        <button
                            onClick={handleViewFromSeat}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}
                        >
                            👁️ View from Seat
                        </button>
                    )}
                    {firstPersonMode && (
                        <button
                            onClick={handleResetView}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}
                        >
                            ↩️ Reset View
                        </button>
                    )}
                </div>
            </div>

            {/* Mode indicator */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: firstPersonMode
                        ? 'rgba(34, 197, 94, 0.9)'
                        : isAdmin
                            ? 'rgba(59, 130, 246, 0.9)'
                            : 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                }}
            >
                {firstPersonMode
                    ? firstPersonReady
                        ? '👤 First Person View (Drag to look around)'
                        : '👤 Moving to seat...'
                    : isAdmin
                        ? '🎮 Admin View (Drag to rotate)'
                        : '🎫 Select a seat'}
            </div>

            {/* Day/Night Toggle */}
            <button
                onClick={() => setIsDayMode(!isDayMode)}
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '20px',
                    transition: 'all 0.2s',
                    zIndex: 10,
                }}
                title={isDayMode ? "Switch to Night Mode" : "Switch to Day Mode"}
            >
                {isDayMode ? '☀️' : '🌙'}
            </button>
        </div>
    );
}

export default Venue3DViewer;
