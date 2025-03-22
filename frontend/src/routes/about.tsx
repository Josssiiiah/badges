import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCounterState } from "@/hooks/useCounter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});

function AboutComponent() {
  const { count, increment, isLoading, isPending } = useCounterState();

  return (
    <div className="p-4 border border-red-500 rounded-lg max-w-md mx-auto mt-10">
      <h3 className="text-3xl font-light text-red-500 mb-4">Counter App</h3>

      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <p className="text-lg">Current Count:</p>
        <p className="text-4xl font-bold">{isLoading ? "Loading..." : count}</p>
      </div>

      <Button
        onClick={() => increment()}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Incrementing..." : "Increment Counter"}
      </Button>
    </div>
  );
}
