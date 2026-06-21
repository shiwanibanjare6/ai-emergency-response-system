import dynamic from "next/dynamic";

export const EmergencyMap = dynamic(
  () => import("./emergency-map").then((m) => m.EmergencyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        Loading map...
      </div>
    ),
  }
);
