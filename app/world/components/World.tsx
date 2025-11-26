//component/World.tsx
export default function World() {
  return (
    <>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshStandardMaterial color="#7a7a7a" />
      </mesh>

      <mesh position={[0, 2.5, -15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#8a7a7a" />
      </mesh>

      <mesh position={[0, 2.5, 15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#6a7a7a" />
      </mesh>

      <mesh position={[-15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#4a7a7a" />
      </mesh>

      <mesh position={[15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#5a7a7a" />
      </mesh>
    </>
  );
}