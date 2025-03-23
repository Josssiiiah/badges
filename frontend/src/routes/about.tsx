import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});

function AboutComponent() {

  return (
    <div className="p-4 border border-red-500 rounded-lg max-w-md mx-auto mt-10">
      <h3 className="text-3xl font-light text-red-500 mb-4">Counter App</h3>

    </div>
  );
}
