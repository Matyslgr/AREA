import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

interface User {
  email: string;
  name?: string;
  username?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("area-user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  useEffect(() => {

    const storedUser = localStorage.getItem("area-user");

    if (!storedUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("area-user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleConnectGmail = async () => {
    try {
      const scope = "https://www.googleapis.com/auth/gmail.send";
      const encodedScope = encodeURIComponent(scope);
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/google?scope=${encodedScope}`
      );

      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user.name || user.username} 👋</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are successfully authenticated!
            </p>
            <div className="mt-4 rounded-md bg-slate-100 p-4 font-mono text-sm dark:bg-slate-800">
              <p>Email: {user.email}</p>
              <p>Status: Connected</p>
            </div>
            <Button onClick={handleConnectGmail} className="bg-blue-600 hover:bg-blue-700">
              Connect your Gmail account
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future AREAs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-50">
              <CardHeader>
                <CardTitle className="text-lg">Service Integration {i}</CardTitle>
              </CardHeader>
              <CardContent>
                Coming soon...
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}