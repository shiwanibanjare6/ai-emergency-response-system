"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ImagePlus, MapPin, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useReportEmergency } from "@/hooks/useEmergencies";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { SeverityBadge } from "@/components/emergency/severity-badge";

export default function ReportEmergencyPage() {
  const router = useRouter();
  const report = useReportEmergency();
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState(String(DEFAULT_MAP_CENTER.lat));
  const [lng, setLng] = useState(String(DEFAULT_MAP_CENTER.lng));
  const [image, setImage] = useState<File | null>(null);
  const [voice, setVoice] = useState<File | null>(null);
  const [result, setResult] = useState<{ id: number; severity: string } | null>(null);

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        toast.success("GPS location captured");
      },
      () => toast.error("Could not get location")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emergency = await report.mutateAsync({
        description,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        image,
        voice_file: voice,
      });
      setResult({ id: emergency.id, severity: emergency.severity });
      toast.success("Emergency reported — AI triage complete");
    } catch {
      toast.error("Failed to report emergency");
    }
  };

  return (
    <DashboardLayout title="Report Emergency" subtitle="AI-assisted incident reporting" roles={["citizen"]}>
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-400" /> Incident Report
              </CardTitle>
              <CardDescription>Describe the situation. AI will classify severity automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4 text-center py-6">
                  <p className="text-lg text-zinc-200">Emergency #{result.id} submitted</p>
                  <SeverityBadge severity={result.severity as "low" | "medium" | "critical"} />
                  <p className="text-sm text-zinc-500">Dispatch has been notified. Track status on your dashboard.</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="secondary" onClick={() => router.push("/citizen")}>Dashboard</Button>
                    <Button onClick={() => router.push(`/citizen/emergency/${result.id}`)}>Track Status</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what happened, injuries, hazards..."
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input value={lat} onChange={(e) => setLat(e.target.value)} required type="number" step="any" />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input value={lng} onChange={(e) => setLng(e.target.value)} required type="number" step="any" />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={useGPS} className="gap-2">
                    <MapPin className="h-4 w-4" /> Use My GPS Location
                  </Button>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Photo Evidence</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Mic className="h-4 w-4" /> Voice Note</Label>
                      <Input type="file" accept="audio/*" onChange={(e) => setVoice(e.target.files?.[0] ?? null)} />
                    </div>
                  </div>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    AI will analyze text, image, and audio on submit
                  </Badge>
                  <Button type="submit" className="w-full" disabled={report.isPending}>
                    {report.isPending ? "Analyzing & Submitting..." : "Submit Emergency Report"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
