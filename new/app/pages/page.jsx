"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useRef } from "react";
import { Beaker } from "../Beaker";
import { Liquid } from "../Liquid";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useSound from "use-sound";
import { motion, AnimatePresence } from "framer-motion";
import { PetriDish } from "../PetriDish";
import Vapors from "../components/Vapors";
import "./page.css";

const ItemTypes = {
  ELEMENT: "element",
  ACID: "acid"
};

// Element block (Only Na is draggable)
const Element = ({ name, color, draggable = false }) => {
  const dragRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ELEMENT,
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [draggable]);

  if (draggable) {
    drag(dragRef);
  }

  return (
    <div
      ref={draggable ? dragRef : null}
      className={`p-4 w-16 h-16 flex items-center justify-center rounded-lg text-black text-center cursor-pointer border-2 border-gray-500 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ backgroundColor: color }}
    >
      {name}
    </div>
  );
};

// Acid Beaker Component
const AcidBeaker = ({ acid, draggable = false }) => {
  const dragRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ACID,
    item: { name: acid.name, color: acid.color },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [draggable, acid]);

  if (draggable) {
    drag(dragRef);
  }

  return (
    <div 
      ref={draggable ? dragRef : null}
      className={`acid-item ${draggable ? "cursor-grab" : ""} ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="acid-name">{acid.name}</div>
      <div className="acid-beaker">
        <Canvas className="w-full h-full">
          <ambientLight intensity={0.5} />
          <Beaker />
          <Liquid color={acid.color} />
        </Canvas>
      </div>
    </div>
  );
};

// Periodic Table Elements
const elements = [
  { name: "H", color: "#ff6666"  },
  { name: "He", color: "#ffcc66" },
  { name: "Li", color: "#ff99cc" },
  { name: "Be", color: "#ffcc99" },
  { name: "B", color: "#99ccff" },
  { name: "C", color: "#66cc99" },
  { name: "N", color: "#6699cc" },
  { name: "O", color: "#ff9966" },
  { name: "F", color: "#cccc99" },
  { name: "Ne", color: "#cc99ff" },
  { name: "Na", color: "#FFD700", draggable: true },
  { name: "Mg", color: "#ffcc99", draggable: true },
  { name: "Al", color: "#66ccff" },
  { name: "Si", color: "#ff9966" },
  { name: "P", color: "#ffcc99" },
  { name: "S", color: "#ffcc66" },
  { name: "Cl", color: "#6699cc" },
  { name: "Ar", color: "#cc99ff" },
];

const acids = [
  { name: "HCl", color: "#FF4500" },
  { name: "H2SO4", color: "#990000" },
  { name: "HNO3", color: "#ff9900" },
];

function VirtualLabComponent() {
  const [liquidColor, setLiquidColor] = useState(""); // No initial color
  const [reactionMessage, setReactionMessage] = useState("");
  const [addedElements, setAddedElements] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [vaporsVisible, setVaporsVisible] = useState(false);
  const [playBoom] = useSound("/sounds/boom.mp3", { volume: 1.0 }); // Ensure volume is set correctly
  const [playFireSound] = useSound("/sounds/fire.mp3", { volume: 1.0 }); // Fire sound for Petri dish
  const [petriElement, setPetriElement] = useState(null);
  const [petriElementColor, setPetriElementColor] = useState("yellow"); // Default color
  const [beakerElements, setBeakerElements] = useState([]);
  const [showVapors, setShowVapors] = useState(false);

  const resetLab = () => {
    setLiquidColor("");
    setReactionMessage("");
    setAddedElements([]);
    setShaking(false);
    setVaporsVisible(false);
    setPetriElement(null);
    setPetriElementColor("yellow"); // Reset to default color
    setBeakerElements([]);
    setShowVapors(false);
  };

  const [{ isOver: isOverPetriDish }, dropPetriDish] = useDrop(() => ({
    accept: [ItemTypes.ELEMENT],
    drop: (item) => {
      console.log("Item dropped on Petri dish:", item);
      handlePetriDishDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [{ isOver: isOverBeaker }, dropBeaker] = useDrop(() => ({
    accept: [ItemTypes.ELEMENT, ItemTypes.ACID],
    drop: (item) => {
      console.log("Item dropped on Beaker:", item);
      handleBeakerDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handlePetriDishDrop = (item) => {
    if (item.name === "Na") {
      alert("Na was successfully dropped onto the Petri dish");
      setPetriElement(item.name);
      setPetriElementColor("yellow"); // Set color to yellow for Na
    } else {
      setPetriElement(null); // Reset if other elements are dropped
    }
  };

  const handleBeakerDrop = (item) => {
    setBeakerElements((prev) => {
      if (!prev.includes(item.name)) {
        const newElements = [...prev, item.name];

        // Example Reactions (Only for the beaker)
        if (item.name === "Na") {
          setLiquidColor("#ffff00");
        }
        if (item.name === "HCl") {
          setLiquidColor("#ff0000");
        }
        if (item.name === "H2SO4") {
          setLiquidColor("#990000");
        }
        if (item.name === "Mg") {
          setLiquidColor("#ffcc99");
        }

        // Reactions for the beaker
        if (newElements.includes("Na") && newElements.includes("HCl")) {
          setTimeout(() => {
            setShaking(true);
            playBoom();// Play explosion sound
            setReactionMessage("2Na + 2HCl → 2NaCl + H₂↑");
            setVaporsVisible(true);
            setLiquidColor("#ffa500");

            let flashCount = 0;
            const flashInterval = setInterval(() => {
              setLiquidColor((prev) => (prev === "#ffa500" ? "#ff0000" : "#ffa500"));
              flashCount++;
              if (flashCount > 5) {
                clearInterval(flashInterval);
                setShaking(false);
              }
            }, 200);

            setTimeout(() => {
              setVaporsVisible(false);
              setReactionMessage("");
            }, 5000);
          }, 1000);
        }

        // Additional reaction for Na + H2SO4
        if (newElements.includes("Na") && newElements.includes("H2SO4")) {
          setTimeout(() => {
            setShaking(true);
            playBoom();
            setReactionMessage("2Na + H2SO4 → Na2SO4 + H₂↑");
            setVaporsVisible(true);
            setLiquidColor("#800080");  // Change to a different color

            let flashCount = 0;
            const flashInterval = setInterval(() => {
              setLiquidColor((prev) => (prev === "#800080" ? "#ff00ff" : "#800080"));
              flashCount++;
              if (flashCount > 5) {
                clearInterval(flashInterval);
                setShaking(false);
              }
            }, 200);

            setTimeout(() => {
              setVaporsVisible(false);
              setReactionMessage("");
            }, 5000);
          }, 1000);
        }

        // Additional reaction for Mg + HCl
        if (newElements.includes("Mg") && newElements.includes("HCl")) {
          setTimeout(() => {
            setShaking(true);
            playBoom();
            setReactionMessage("Mg + 2HCl → MgCl2 + H₂↑");
            setVaporsVisible(true);
            setLiquidColor("#00ff00");

            let flashCount = 0;
            const flashInterval = setInterval(() => {
              setLiquidColor((prev) => (prev === "#00ff00" ? "#00ffcc" : "#00ff00"));
              flashCount++;
              if (flashCount > 5) {
                clearInterval(flashInterval);
                setShaking(false);
              }
            }, 200);

            setTimeout(() => {
              setVaporsVisible(false);
              setReactionMessage("");
            }, 5000);
          }, 1000);
        }

        // Return updated elements state
        return newElements;
      }
      return prev;
    });
  };

  const handlePetriDishClick = () => {
    console.log("Petri dish clicked. Current element:", petriElement);
    if (petriElement === "Na") {
      setReactionMessage("Na flame test: Yellow flame");
      setShowVapors(true);
      playFireSound(); // Play fire sound for Petri dish
      setTimeout(() => setShowVapors(false), 3000); // Show vapors for 3 seconds
    }
    // Add more flame tests for other elements if needed
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-2xl mb-4">3D Virtual Chemistry Lab</h1>

      {/* Periodic Table Layout */}
      <div className="grid gap-1 bg-gray-800 rounded-lg p-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(18, 1fr)",
          gridAutoRows: "50px"
        }}>
        {elements.map((element) => (
          <Element
            key={element.name}
            name={element.name}
            color={element.color}
            draggable={element.draggable}
          />
        ))}
      </div>

      {/* Acid Container */}
      <div className="acid-container">
        {acids.map((acid) => (
          <AcidBeaker
            key={acid.name}
            acid={acid}
            draggable={acid.name === "HCl" || acid.name === "H2SO4" || acid.name === "HNO3"}
          />
        ))}
      </div>

      {/* Main Experiment Area */}
      <div className="flex flex-row gap-4 mt-4 justify-center items-center">
        {/* Petri Dish Drop Zone */}
        <div ref={dropPetriDish} className={`p-4 rounded-lg ${isOverPetriDish ? "bg-gray-700" : "bg-gray-800"} flex flex-col items-center`}>
          <Canvas className="w-full h-96">
            <ambientLight intensity={0.5} />
            <OrbitControls />
            <PetriDish element={petriElement} color={petriElementColor} onDrop={handlePetriDishDrop} onClick={handlePetriDishClick} />
            {showVapors && <Vapors active={showVapors} color="yellow" />}
          </Canvas>
          <div className="text-white text-center mt-2">Petri Dish</div>
        </div>

        {/* Beaker Drop Zone */}
        <div ref={dropBeaker} className={`p-4 rounded-lg ${isOverBeaker ? "bg-gray-700" : "bg-gray-800"} flex flex-col items-center`}>
          <Canvas className={`w-full h-96 ${shaking ? "animate-shake" : ""}`}>
            <ambientLight intensity={0.5} />
            <OrbitControls />
            <Beaker />
            <Liquid color={liquidColor} />
            <Vapors active={vaporsVisible} />
          </Canvas>
          <div className="text-white text-center mt-2">Beaker</div>
        </div>
      </div>

      {/* Reaction Message */}
      <div className="mt-4">
        <AnimatePresence>
          {reactionMessage && (
            <motion.p
              className="text-white text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {reactionMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button onClick={resetLab} className="mt-4 p-2 bg-red-600 text-white rounded-lg">Reset</button>
      <style jsx>{`
        .acid-container {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          width: 100%;
          margin-top: 1.5rem;
          overflow-x: auto;
        }
        
        .acid-item {
          flex: 0 0 auto;
          padding: 1.5rem;
          background-color: rgb(55, 65, 81);
          border-radius: 0.5rem;
          text-align: center;
          min-width: 140px;
          transition: transform 0.2s;
        }
        
        .acid-item.cursor-grab:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .acid-name {
          font-size: 1.25rem;
          line-height: 1.75rem;
          color: white;
          margin-bottom: 0.5rem; /* Adjusted margin */
        }
        
        .acid-beaker {
          width: 6rem;
          height: 8rem;
          background-color: rgb(75, 85, 99);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      
        .petri-dish {
          width: 200px;
          height: 200px;
          background-color: #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .flame {
          width: 50px;
          height: 100px;
          border-radius: 50% 50% 0 0;
          position: absolute;
          bottom: 0;
        }
      `}</style>
    </div>
  );
}

export default function VirtualLab() {
  return <DndProvider backend={HTML5Backend}><VirtualLabComponent /></DndProvider>;
}