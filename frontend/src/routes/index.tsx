import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCounterState } from "@/hooks/useCounter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {

  return (
    <div className="p-4 border border-red-500 rounded-lg max-w-md mx-auto mt-10">
      <h1>Hello world</h1>
    </div>
  );
}
