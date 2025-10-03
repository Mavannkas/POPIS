"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001");
      const data = await response.text();
      setMessage(data);
    } catch {
      setMessage("Backend not running. Start it with: cd backend && npm run start:dev");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Hackathon Boilerplate 🚀
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))]">
            A blazingly fast starter template for your next project
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Frontend Stack</CardTitle>
              <CardDescription>Modern React with Next.js</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Next.js 15 with App Router</li>
                <li>✅ React 19</li>
                <li>✅ TypeScript</li>
                <li>✅ Tailwind CSS v4</li>
                <li>✅ shadcn/ui Components</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend Stack</CardTitle>
              <CardDescription>Powerful NestJS API</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ NestJS Framework</li>
                <li>✅ TypeScript</li>
                <li>✅ SQLite Database</li>
                <li>✅ TypeORM</li>
                <li>✅ RESTful API</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backend Connection</CardTitle>
            <CardDescription>
              Test the connection between frontend and backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))]">
              <p className="font-mono text-sm">
                {loading ? "Loading..." : message || "No response yet"}
              </p>
            </div>
            <Button onClick={fetchMessage} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>🐳 Docker-ready • 🔥 Hot reload • 📦 5-person team setup</p>
        </div>
      </div>
    </div>
  );
}
