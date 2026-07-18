import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "../../../../api/auth";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Leaf,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [fullName, email, password, confirmPassword]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      setLoading(true);

      const response = await registerUser({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      console.log(response);

      alert("Registration Successful!");

      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    } finally {
      setLoading(false);
    }


  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div
        className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 overflow-hidden select-none"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "var(--background)",
        }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between z-20">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm active:scale-95 duration-200"
          >
            <Globe size={16} />
            <span>{i18n.language === "en" ? "हिन्दी" : "English"}</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] z-10"
        >
          <Card className="border border-border/80 bg-card/85 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 mb-4 border border-primary/20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <Leaf className="text-primary size-6 fill-primary/10" />
                </motion.div>
              </div>
              <CardTitle className="font-serif text-2xl font-bold tracking-tight text-foreground flex justify-center items-center gap-2">
                <span>{t("navbar.brand")}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm max-w-[280px] mx-auto mt-1">
                Create your account to continue.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-destructive/10 text-destructive border border-destructive/20 text-xs rounded-xl flex items-start gap-2.5"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-500 size-8 animate-bounce" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">
                    Account created successfully.
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-primary" />
                    Redirecting to chat...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full-name" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <div className="relative flex items-center">
                      <User
                        size={16}
                        className="absolute left-3.5 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Enter your full name"
                        autoFocus
                        disabled={loading}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-email" className="text-xs font-semibold">
                      Email
                    </Label>
                    <div className="relative flex items-center">
                      <Mail
                        size={16}
                        className="absolute left-3.5 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        disabled={loading}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock
                        size={16}
                        className="absolute left-3.5 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        disabled={loading}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="pl-10 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock
                        size={16}
                        className="absolute left-3.5 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        disabled={loading}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="pl-10 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2 active:scale-98"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin size-4" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 text-xs text-muted-foreground space-y-1 border-t border-border/40 mt-4 bg-muted/10">
              <div className="flex items-center gap-1">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </I18nextProvider>
  );
}

export default Register;
