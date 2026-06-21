import dynamic from "next/dynamic";

export const LiveTrackingMap = dynamic(
  () => import("./live-tracking-map").then((m) => m.LiveTrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        Loading live map...
      </div>
    ),
  }
);
