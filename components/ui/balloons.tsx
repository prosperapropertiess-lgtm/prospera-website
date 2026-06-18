"use client";

import * as React from "react";

export interface BalloonsRef {
  launch: () => void;
}

const Balloons = React.forwardRef<BalloonsRef, { className?: string }>(
  ({ className }, ref) => {
    const launch = React.useCallback(() => {
      import("balloons-js").then(({ balloons }) => {
        balloons();
      });
    }, []);

    React.useImperativeHandle(ref, () => ({ launch }), [launch]);

    return <div className={className} />;
  }
);
Balloons.displayName = "Balloons";

export { Balloons };
