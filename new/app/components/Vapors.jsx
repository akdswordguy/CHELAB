import { useRef, useEffect } from "react";
import useSound from "use-sound";

const Vapors = ({ active, color = "white" }) => {
  const vaporRef = useRef();
  const [playFireSound, { stop }] = useSound("/sounds/fire.mp3", { volume: 1.0 });

  useEffect(() => {
    if (active) {
      playFireSound(); // Play the fire sound
      const timer = setTimeout(() => {
        stop(); // Stop after 3 seconds
      }, 3000);

      return () => {
        clearTimeout(timer);
        stop(); // Ensure sound stops when component unmounts
      };
    }
  }, [active, playFireSound, stop]);

  return (
    <group ref={vaporRef} visible={active} position={[0, 0.8, 0]}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[Math.random() - 0.5, 0, Math.random() - 0.5]}>
          <sphereGeometry args={[0.1, 20, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export default Vapors;