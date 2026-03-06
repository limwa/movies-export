import { UserDataVisualizer } from "./components/UserDataVisualizer";

export default function Home() {
  return (
    <div className="flex min-h-screen font-sans">
      <main className="w-full">
        <UserDataVisualizer />
      </main>
    </div>
  );
}
