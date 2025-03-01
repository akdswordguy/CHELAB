import Image from "next/image";
import Link from "next/link";
import Page from "./pages/page"; // Import the page component

export default function Home() {
  return (
    <div>
      <Page /> {/* Correct way to use the component */}
    </div>
  );
}
