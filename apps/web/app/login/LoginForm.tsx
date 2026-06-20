"use client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@metamarket/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "../lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage(null);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({ name, email, password });
        if (result.error) throw new Error(result.error.message ?? "Sign up failed");
        setMessage({ type: "success", text: "Account created. You are signed in." });
        router.push("/services");
        router.refresh();
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message ?? "Sign in failed");
        setMessage({ type: "success", text: "Signed in." });
        router.push("/services");
        router.refresh();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Authentication failed"
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
        <CardDescription>
          Use one account across customer, provider, and admin experiences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "sign-up" ? (
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" disabled={busy} onClick={submit}>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
          </Button>
        </div>
        {message ? (
          <Alert variant={message.type === "error" ? "destructive" : "success"}>
            {message.text}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
