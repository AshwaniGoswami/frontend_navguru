import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-gray-600" />
      <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
    </div>
  );
}
