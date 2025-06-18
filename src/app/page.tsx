
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function App() {
  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      <main className="flex-grow flex items-center justify-center">
        Landing Page
        <div className="max-w-4xl w-full p-4">
          <Link
            className="text-blue-500 flex justify-center mb-6"
            href="/get-started"
          >
            <Button className="w-full">
            Get Started
            </Button>
          </Link>
          <Link
            className="text-blue-500 flex justify-center mb-6"
            href="/protected"
          >
            <Button className="w-full">
            Protected
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}