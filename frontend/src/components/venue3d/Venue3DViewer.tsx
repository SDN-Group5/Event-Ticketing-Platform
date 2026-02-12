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
    rotation?: number;
}

interface Stage {
    id: string;
    name: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    color: string;
    hideScreen?: boolean;
    elevation?: number;
    videoUrl?: string;
    screenHeight?: number;
    screenWidthRatio?: number;
    rotation?: number;
}


interface Venue3DViewerProps {
    zones: Zone[];
    stages?: Stage[];
    isAdmin?: boolean;
    bookedSeats?: string[];
    showPeople?: boolean;
    daylight?: boolean;
    cinematicMode?: boolean;
    selectedSeat?: string | null;
    onSeatSelect?: (seatId: string, seatInfo: SeatInfo) => void;
    canvasWidth?: number;
    canvasHeight?: number;
    canvasColor?: string;
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
    const keys = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false });
    const isPointerDown = useRef(false);
    const previousPointer = useRef({ x: 0, y: 0 });
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const moveSpeed = 0.3;

    useEffect(() => {
        if (!enabled) return;

        // Initialize euler from current camera rotation
        euler.current.setFromQuaternion(camera.quaternion);

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                keys.current[key as 'w' | 'a' | 's' | 'd'] = true;
            } else if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scroll
                keys.current.space = true;
            } else if (e.key === 'Shift') {
                keys.current.shift = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                keys.current[key as 'w' | 'a' | 's' | 'd'] = false;
            } else if (e.code === 'Space') {
                keys.current.space = false;
            } else if (e.key === 'Shift') {
                keys.current.shift = false;
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
            canvas.style.cursor = 'auto';
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
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        // Build movement vector (normalized to prevent faster diagonal movement)
        const moveVector = new THREE.Vector3(0, 0, 0);

        // Forward/Backward (W/S)
        if (keys.current.w) {
            moveVector.add(forward);
        }
        if (keys.current.s) {
            moveVector.sub(forward);
        }

        // Left/Right (A/D)
        if (keys.current.a) {
            moveVector.sub(right);
        }
        if (keys.current.d) {
            moveVector.add(right);
        }

        // Normalize horizontal movement to prevent faster diagonal
        if (moveVector.length() > 0) {
            moveVector.normalize();
            camera.position.addScaledVector(moveVector, moveSpeed);
        }

        // Up/Down (Space/Ctrl) - independent from horizontal movement
        if (keys.current.space) {
            camera.position.y += moveSpeed * 0.5;
        }
        if (keys.current.shift) {
            camera.position.y -= moveSpeed * 0.5;
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
                if (camera.position.distanceTo(targetRef.current) < 0.05) {
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

    // Reset initialized flag when disabled
    useEffect(() => {
        if (!enabled) {
            initialized.current = false;
        }
    }, [enabled]);

    // Setup event listeners
    useEffect(() => {
        if (!enabled || !cameraPosition) return;

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

    // Apply rotation every frame - initialize synchronously here to avoid delay
    useFrame(() => {
        if (!enabled || !cameraPosition) return;

        // Initialize rotation on first frame (no delay from useEffect)
        if (!initialized.current) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            rotation.current.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
            rotation.current.yaw = Math.atan2(dir.x, -dir.z);
            initialized.current = true;
        }

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

// Imports removed (duplicates)

// ... (interfaces remain same until Venue3DViewerProps)

interface Venue3DViewerProps {
    zones: Zone[];
    stages?: Stage[];
    isAdmin?: boolean;
    bookedSeats?: string[];
    selectedSeat?: string | null;
    onSeatSelect?: (seatId: string, seatInfo: SeatInfo) => void;
    canvasWidth?: number;
    canvasHeight?: number;
    canvasColor?: string;
}

// ... (FreeLookControls and other helpers)

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
    onSeatHover,
    onFirstPersonReady,
    isDayMode,
    showPeople = false,
    canvasWidth = 800,
    canvasHeight = 600,
    canvasColor = '#1a1a1a',
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
    onSeatHover?: (seatInfo: SeatInfo | null) => void;
    isDayMode: boolean;
    showPeople?: boolean;
    canvasWidth?: number;
    canvasHeight?: number;
    canvasColor?: string;
}) {
    // Calculate ground plane dimensions based on canvas size
    const groundWidth = canvasWidth * SCALE_FACTOR;
    const groundDepth = canvasHeight * SCALE_FACTOR;

    // Position ground to be centered relative to the content
    // X: 0 (centered)
    // Z: groundDepth / 2 (since 2D Y=0 maps to 3D Z=0, and 2D Y=max maps to 3D Z=max)
    const groundZ = groundDepth / 2;

    // We'll use the canvas color for the ground material
    // And also set scene background if desired
    const { scene } = useThree();
    useEffect(() => {
        if (!isDayMode) {
            scene.background = new THREE.Color(canvasColor);
        } else {
            scene.background = new THREE.Color('#87CEEB'); // Sky blue for day
        }
    }, [canvasColor, isDayMode, scene]);

    return (
        <>
            {/* Lighting - Constant for consistent object appearance */}
            <ambientLight intensity={0.8} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.0}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />

            {/* Environment - Use a neutral preset or remove if it tints too much */}
            {/* Keeping 'city' as it provides good reflections without too much color tinting */}
            <Environment preset="city" />

            {/* Ground */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, groundZ]}
                receiveShadow
            >
                <planeGeometry args={[groundWidth, groundDepth]} />
                <meshStandardMaterial
                    color={canvasColor}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Grid helper (admin only) */}
            {isAdmin && (
                <Grid
                    position={[0, -0.49, groundZ]}
                    args={[groundWidth, groundDepth]}
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
                // X: (x + width/2 - canvasWidth/2)
                const stageX = (stage.position.x + (stage.size?.width || 200) / 2 - canvasWidth / 2) * SCALE_FACTOR;
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
                        videoUrl={stage.videoUrl}
                        screenHeight={stage.screenHeight}
                        screenWidthRatio={stage.screenWidthRatio}
                        rotation={stage.rotation}
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
                    onSeatHover={onSeatHover}
                    canvasWidth={canvasWidth}
                    showPeople={showPeople}
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

// Cinematic camera controls
function CinematicControls({ enabled }: { enabled: boolean }) {
    const { camera } = useThree();
    const time = useRef(0);
    const radius = 100;
    const height = 40;

    useFrame((state, delta) => {
        if (!enabled) return;

        time.current += delta * 0.2; // Speed control

        // Circular orbit
        const x = Math.sin(time.current) * radius;
        const z = Math.cos(time.current) * radius;

        // Sine wave elevation for "drone" feel
        const y = height + Math.sin(time.current * 0.5) * 10;

        // Smoothly interpolate current camera position to target
        const targetPos = new THREE.Vector3(x, y, z);
        camera.position.lerp(targetPos, 0.02);

        // Look at center (slightly elevated)
        camera.lookAt(0, 5, 0);
    });

    return null;
}

export function Venue3DViewer({
    zones,
    stages = [],
    isAdmin = false,
    bookedSeats = [],
    showPeople: showPeopleFromProps,
    daylight: daylightFromProps,
    cinematicMode: cinematicModeFromProps,
    selectedSeat: propSelectedSeat,
    onSeatSelect,
    canvasWidth = 800,
    canvasHeight = 600,
    canvasColor = '#1a1a1a',
}: Venue3DViewerProps) {
    const [internalSelectedSeat, setInternalSelectedSeat] = useState<string | null>(null);
    const selectedSeat = propSelectedSeat !== undefined ? propSelectedSeat : internalSelectedSeat;

    const [seatPosition, setSeatPosition] = useState<[number, number, number] | null>(null);
    const [seatDisplayInfo, setSeatDisplayInfo] = useState<{ zoneName: string; row: number; seatNumber: number } | null>(null);
    const [hoveredSeatInfo, setHoveredSeatInfo] = useState<SeatInfo | null>(null);
    const [firstPersonMode, setFirstPersonMode] = useState(false);
    const [firstPersonReady, setFirstPersonReady] = useState(false);

    // Use props if provided, otherwise use local state
    const [isCinematic, setIsCinematic] = useState(cinematicModeFromProps ?? false);
    const [isDayMode, setIsDayMode] = useState(daylightFromProps ?? false);
    const [showPeople, setShowPeople] = useState(showPeopleFromProps ?? false);

    // Sync with props when they change
    useEffect(() => {
        if (cinematicModeFromProps !== undefined) {
            setIsCinematic(cinematicModeFromProps);
        }
    }, [cinematicModeFromProps]);

    useEffect(() => {
        if (daylightFromProps !== undefined) {
            setIsDayMode(daylightFromProps);
        }
    }, [daylightFromProps]);

    useEffect(() => {
        if (showPeopleFromProps !== undefined) {
            setShowPeople(showPeopleFromProps);
        }
    }, [showPeopleFromProps]);

    // Calculate stage position for camera to look at
    // Calculate stage position for camera to look at
    const stagePosition: [number, number, number] = stages.length > 0
        ? [
            (stages[0].position.x + (stages[0].size?.width || 200) / 2 - canvasWidth / 2) * SCALE_FACTOR,
            2,
            (stages[0].position.y + (stages[0].size?.height || 80) / 2) * SCALE_FACTOR
        ]
        : [0, 2, 0];

    const handleSeatClick = useCallback(
        (seatId: string, position: [number, number, number]) => {
            setInternalSelectedSeat(seatId);
            setSeatPosition(position);

            // Parse seat info from seatId (format: zoneId-R{row}-S{seat})
            // Zone ID can contain dashes, so we find -R{num}-S{num} pattern from the end
            const match = seatId.match(/^(.+)-R(\d+)-S(\d+)$/);
            if (match) {
                const zoneId = match[1];
                const row = parseInt(match[2]);
                const seatNumber = parseInt(match[3]);
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

                // Store seat display info for UI
                setSeatDisplayInfo({
                    zoneName: zone?.name || 'Unknown',
                    row,
                    seatNumber
                });
            }
        },
        [zones, onSeatSelect]
    );

    const handleViewFromSeat = () => {
        if (seatPosition) {
            setIsCinematic(false);
            setFirstPersonMode(true);
            setFirstPersonReady(false);
        }
    };

    const handleResetView = () => {
        setFirstPersonMode(false);
        setFirstPersonReady(false);
    };

    const toggleCinematic = () => {
        setIsCinematic(!isCinematic);
        if (!isCinematic) {
            setFirstPersonMode(false);
            setInternalSelectedSeat(null);
        }
    };

    const handleFirstPersonReady = useCallback(() => {
        setFirstPersonReady(true);
    }, []);

    const handleSeatHover = useCallback((info: SeatInfo | null) => {
        setHoveredSeatInfo(info);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas shadows>
                <PerspectiveCamera
                    makeDefault
                    position={isAdmin ? [0, 60, 80] : [0, 30, 60]}
                    fov={45}
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
                    onSeatHover={handleSeatHover}
                    onFirstPersonReady={() => setFirstPersonReady(true)}
                    isDayMode={isDayMode}
                    showPeople={showPeople}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    canvasColor={canvasColor}
                />

                {/* Controls */}
                <CinematicControls enabled={isCinematic} />
                <FreeLookControls enabled={!firstPersonMode && !isCinematic} />
                <CameraController
                    targetPosition={seatPosition}
                    isFirstPerson={firstPersonMode}
                    stagePosition={stagePosition}
                    onReady={handleFirstPersonReady}
                />
                <FirstPersonControls
                    enabled={firstPersonMode && firstPersonReady}
                    cameraPosition={seatPosition}
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
                {/* Left Controls Group - WASD hint only */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        alignItems: 'flex-start',
                        pointerEvents: 'auto'
                    }}
                >
                    {/* WASD Controls hint */}
                    {!isCinematic && (
                        <div
                            style={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                color: '#a0a0a0',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                lineHeight: '1.4',
                            }}
                        >
                            <div><b style={{ color: 'white' }}>WASD</b> - Move</div>
                            <div><b style={{ color: 'white' }}>Space</b> - Up | <b style={{ color: 'white' }}>Shift</b> - Down</div>
                            <div><b style={{ color: 'white' }}>Drag</b> - Look around</div>
                        </div>
                    )}
                </div>

                {/* Hover seat info - Bottom Center (Replaces Selected Info) */}
                {/* Hover seat info - Hidden per user request */}
                {/* {hoveredSeatInfo && !isCinematic && ( ... )} */}
                {/* View controls - Bottom Right */}
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        pointerEvents: 'auto',
                    }}
                >
                    {selectedSeat && !firstPersonMode && !isCinematic && (
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
        </div>
    );
}

export default Venue3DViewer;
