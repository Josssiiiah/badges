import { Textarea } from "./ui/textarea";

export default function Space() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="border border-black p-48">
        <Textarea placeholder="Type something..." />
      </div>
    </div>
  );
}
