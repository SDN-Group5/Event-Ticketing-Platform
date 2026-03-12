import { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';

export interface PersonInstanceData {
  id: string;
  position: [number, number, number];
  color: string;
  pose: 'sitting' | 'standing';
}

interface InstancedPeopleProps {
  people: PersonInstanceData[];
}

export const InstancedPeople = ({ people }: InstancedPeopleProps) => {
  // Separate people by pose as they have different geometries/part placements
  const sittingPeople = useMemo(() => people.filter(p => p.pose === 'sitting'), [people]);
  const standingPeople = useMemo(() => people.filter(p => p.pose === 'standing'), [people]);

  return (
    <group>
      {sittingPeople.length > 0 && <SittingInstances people={sittingPeople} />}
      {standingPeople.length > 0 && <StandingInstances people={standingPeople} />}
    </group>
  );
};

const SittingInstances = ({ people }: { people: PersonInstanceData[] }) => {
  // We need multiple Instances components - one for each body part
  // Torso
  return (
    <group>
      {/* Torso */}
      <Instances range={people.length} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.2]} />
        <meshStandardMaterial />
        {people.map((p, i) => (
          <Instance 
            key={p.id + '-torso'} 
            position={[p.position[0], p.position[1] + 0.35, p.position[2]]} 
            rotation={[0, Math.PI, 0]}
            color={p.color}
          />
        ))}
      </Instances>

      {/* Head */}
      <Instances range={people.length} castShadow>
        <boxGeometry args={[0.25, 0.28, 0.25]} />
        <meshStandardMaterial color="#f4a460" />
        {people.map((p, i) => (
          <Instance 
            key={p.id + '-head'} 
            position={[p.position[0], p.position[1] + 0.85, p.position[2]]}
            rotation={[0, Math.PI, 0]}
          />
        ))}
      </Instances>

      {/* Neck */}
      <Instances range={people.length} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#f4a460" />
        {people.map((p, i) => (
          <Instance 
            key={p.id + '-neck'} 
            position={[p.position[0], p.position[1] + 0.6, p.position[2]]}
            rotation={[0, Math.PI, 0]}
          />
        ))}
      </Instances>

      {/* Hair */}
      <Instances range={people.length} castShadow>
        <boxGeometry args={[0.27, 0.05, 0.27]} />
        <meshStandardMaterial color="#1a202c" />
        {people.map((p) => (
          <Instance 
            key={p.id + '-hair'} 
            position={[p.position[0], p.position[1] + 1.0, p.position[2]]}
            rotation={[0, Math.PI, 0]}
          />
        ))}
      </Instances>

      {/* Sitting Arms - Shoulders */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial />
        {people.map((p) => (
          <group key={p.id + '-arms-upper'} position={p.position} rotation={[0, Math.PI, 0]}>
             <Instance position={[-0.23, 0.45, 0]} rotation={[0, 0, -0.2]} color={p.color} />
             <Instance position={[0.23, 0.45, 0]} rotation={[0, 0, 0.2]} color={p.color} />
          </group>
        ))}
      </Instances>

      {/* Sitting Arms - Forearms */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#f4a460" />
        {people.map((p) => (
          <group key={p.id + '-arms-lower'} position={p.position} rotation={[0, Math.PI, 0]}>
             <Instance position={[-0.25, 0.25, 0.2]} rotation={[-1, 0, -0.2]} />
             <Instance position={[0.25, 0.25, 0.2]} rotation={[-1, 0, 0.2]} />
          </group>
        ))}
      </Instances>

      {/* Sitting Legs - Upper */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.14, 0.12, 0.5]} />
        <meshStandardMaterial color="#2d3748" />
        {people.map((p) => (
          <group key={p.id + '-legs-upper'} position={p.position} rotation={[0, Math.PI, 0]}>
             <Instance position={[-0.12, 0.05, 0.25]} />
             <Instance position={[0.12, 0.05, 0.25]} />
          </group>
        ))}
      </Instances>
      
      {/* Sitting Legs - Lower */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#2d3748" />
        {people.map((p) => (
            <group key={p.id + '-legs-lower'} position={p.position} rotation={[0, Math.PI, 0]}>
                <Instance position={[-0.12, -0.2, 0.45]} />
                <Instance position={[0.12, -0.2, 0.45]} />
            </group>
        ))}
      </Instances>

      {/* Feet */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.13, 0.1, 0.25]} />
        <meshStandardMaterial color="#000000" />
        {people.map((p) => (
            <group key={p.id + '-feet'} position={p.position} rotation={[0, Math.PI, 0]}>
                 <Instance position={[-0.12, -0.4, 0.5]} />
                 <Instance position={[0.12, -0.4, 0.5]} />
            </group>
        ))}
      </Instances>
    </group>
  );
};

const StandingInstances = ({ people }: { people: PersonInstanceData[] }) => {
  return (
    <group>
      {/* Torso */}
      <Instances range={people.length} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.2]} />
        <meshStandardMaterial />
        {people.map((p) => (
          <Instance 
            key={p.id + '-torso'} 
            position={[p.position[0], p.position[1] + 0.35 + 0.4, p.position[2]]} 
            rotation={[0, Math.PI, 0]}
            color={p.color}
          />
        ))}
      </Instances>

      {/* Head */}
      <Instances range={people.length} castShadow>
        <boxGeometry args={[0.25, 0.28, 0.25]} />
        <meshStandardMaterial color="#f4a460" />
        {people.map((p) => (
          <Instance 
            key={p.id + '-head'} 
            position={[p.position[0], p.position[1] + 0.85 + 0.4, p.position[2]]}
            rotation={[0, Math.PI, 0]}
          />
        ))}
      </Instances>

      {/* Neck */}
      <Instances range={people.length} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#f4a460" />
        {people.map((p) => (
          <Instance 
            key={p.id + '-neck'} 
            position={[p.position[0], p.position[1] + 0.6 + 0.4, p.position[2]]}
            rotation={[0, Math.PI, 0]}
          />
        ))}
      </Instances>

      {/* Standing Arms */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial />
        {people.map((p) => (
            <group key={p.id + '-arms'} position={p.position} rotation={[0, Math.PI, 0]}>
               <Instance position={[-0.23, 0.35 + 0.4, 0]} rotation={[0, 0, 0.1]} color={p.color} />
               <Instance position={[0.23, 0.35 + 0.4, 0]} rotation={[0, 0, -0.1]} color={p.color} />
            </group>
        ))}
      </Instances>

      {/* Standing Legs */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.14, 0.75, 0.14]} />
        <meshStandardMaterial color="#2d3748" />
        {people.map((p) => (
             <group key={p.id + '-legs'} position={p.position} rotation={[0, Math.PI, 0]}>
                <Instance position={[-0.10, -0.3 + 0.4, 0]} />
                <Instance position={[0.10, -0.3 + 0.4, 0]} />
             </group>
        ))}
      </Instances>

      {/* Standing Feet */}
      <Instances range={people.length * 2} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#000000" />
        {people.map((p) => (
            <group key={p.id + '-feet'} position={p.position} rotation={[0, Math.PI, 0]}>
                <Instance position={[-0.10, -0.7 + 0.4, 0.05]} />
                <Instance position={[0.10, -0.7 + 0.4, 0.05]} />
            </group>
        ))}
      </Instances>
    </group>
  );
};

export default InstancedPeople;
