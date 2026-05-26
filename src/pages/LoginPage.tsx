// pages/LoginPage.tsx
import { useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

import { ROUTES } from "../router/routes";

interface LoginPageProps {
  isModal?: boolean;
}

export default function LoginPage({ isModal = false }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // get tab from url
  const isRegister = location.pathname === ROUTES.REGISTER;

  const activeTab = isRegister ? "register" : "login";
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || ROUTES.HOME;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields");
      return;
    }

    setLoginLoading(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterError("Please fill in all fields");
      return;
    }

    setRegisterLoading(true);
  };

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  const LoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {loginError && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {loginError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Email
        </label>

        <Input
          type="email"
          placeholder="you@example.com"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          disabled={loginLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Password
        </label>

        <Input
          type="password"
          placeholder="••••••••"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          disabled={loginLoading}
        />
      </div>

      <Button type="submit" className="w-full">
        {loginLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );

  const RegisterForm = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      {registerError && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {registerError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Name
        </label>

        <Input
          type="text"
          placeholder="John Doe"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          disabled={registerLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Email
        </label>

        <Input
          type="email"
          placeholder="you@example.com"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          disabled={registerLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Password
        </label>

        <Input
          type="password"
          placeholder="••••••••"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          disabled={registerLoading}
        />
      </div>

      <Button type="submit" className="w-full">
        {registerLoading
          ? "Creating account..."
          : "Create Account"}
      </Button>
    </form>
  );

  return (
    <Card size="sm" className="w-full max-w-sm mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle>
            {activeTab === "login"
              ? "Hello and welcome"
              : "Welcome back"}
          </CardTitle>

          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              navigate(
                v === "register"
                  ? ROUTES.REGISTER
                  : ROUTES.LOGIN,
                {
                  replace: true, 
                  state: location.state,
                }
              );
            }}
          >
          <TabsList variant="line" className="w-full mb-4">
            <TabsTrigger value="login" className="flex-1">
              Login
            </TabsTrigger>

            <TabsTrigger value="register" className="flex-1">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}