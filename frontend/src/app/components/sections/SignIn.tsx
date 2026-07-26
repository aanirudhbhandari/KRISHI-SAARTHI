import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { I18nextProvider } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../../../../api/auth";
import {
  ChevronRight,
  Leaf,
  Zap,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn } = useAuth();

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Flow states
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("email");

  // Clear errors when changing tabs
  useEffect(() => {
    setError("");
    setOtpSent(false);
    setPhoneNumber("");
    setOtp("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRememberMe(false);
  }, [activeTab]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  // Handle Mock Phone Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(
        i18n.language === "en"
          ? "Please enter a valid 10-digit mobile number."
          : "कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें।"
      );
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  // Handle Mock OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError(
        i18n.language === "en"
          ? "Please enter the 6-digit OTP code."
          : "कृपया 6-अंकीय ओटीपी कोड दर्ज करें।"
      );
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    }, 1200);
  };

  // Handle Mock Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        i18n.language === "en"
          ? "Please fill in all fields."
          : "कृपया सभी फ़ील्ड भरें।"
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(
        i18n.language === "en"
          ? "Please enter a valid email address."
          : "कृपया एक वैध ईमेल पता दर्ज करें।"
      );
      return;
    }

    if (password.length < 6) {
      setError(
        i18n.language === "en"
          ? "Password must be at least 6 characters long."
          : "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: normalizedEmail,
        password,
      });

      console.log(response);

      signIn(
        response.user,
        response.access_token,
        {
          persist: rememberMe,
        }
      );

      setSuccess(true);

      setTimeout(() => {
        navigate("/chat");
      }, 1200);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ??
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }

  };

  // Handle Mock Google Sign In
  const handleGoogleSignIn = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    }, 1000);
  };

  // Inline language change handler
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
        {/* Decorative backgrounds */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        {/* Global actions row (Top level header) */}
        <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between z-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{t("signIn.back")}</span>
          </button>

          {/* Inline language selector */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm active:scale-95 duration-200"
          >
            <Globe size={16} />
            <span>{i18n.language === "en" ? "हिन्दी" : "English"}</span>
          </button>
        </div>

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] z-10"
        >
          <Card className="border border-border/80 bg-card/85 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Visual top border aligned to primary theme */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 mb-4 border border-primary/20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                >
                  <Leaf className="text-primary size-6 fill-primary/10" />
                </motion.div>
              </div>
              <CardTitle className="font-serif text-2xl font-bold tracking-tight text-foreground flex justify-center items-center gap-2">
                <span>{t("navbar.brand")}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm max-w-[280px] mx-auto mt-1">
                {t("signIn.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error block */}
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

              {/* Success state display */}
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
                    {t("signIn.successMessage")}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-primary" />
                    Redirecting to fields...
                  </p>
                </motion.div>
              ) : (
                <>
                  <Tabs
                    defaultValue="email"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    {/*
                    <TabsList className="grid grid-cols-2 w-full mb-4 bg-muted/50 p-1 rounded-xl">
                      <TabsTrigger
                        value="phone"
                        className="rounded-lg text-xs font-semibold py-2 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Phone size={14} />
                        {t("signIn.phoneButton")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="email"
                        className="rounded-lg text-xs font-semibold py-2 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Mail size={14} />
                        {t("signIn.emailButton")}
                      </TabsTrigger>
                    </TabsList>
                    */}

                    {/* Phone Authentication Form */}
                    {/*
                    <TabsContent value="phone">
                      <form
                        onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="phone-number" className="text-xs font-semibold">
                            {t("signIn.phoneLabel")}
                          </Label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-sm text-muted-foreground font-medium select-none pointer-events-none">
                              +91
                            </span>
                            <Input
                              id="phone-number"
                              type="tel"
                              maxLength={10}
                              placeholder={t("signIn.phonePlaceholder")}
                              disabled={otpSent || loading}
                              value={phoneNumber}
                              onChange={(e) =>
                                setPhoneNumber(
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="pl-[3.25rem] text-sm font-medium tracking-wide"
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {otpSent && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-4 pt-1"
                            >
                              <div className="space-y-1.5">
                                <Label htmlFor="otp" className="text-xs font-semibold">
                                  {t("signIn.otpLabel")}
                                </Label>
                                <div className="relative flex items-center">
                                  <Lock
                                    size={16}
                                    className="absolute left-3.5 text-muted-foreground pointer-events-none"
                                  />
                                  <Input
                                    id="otp"
                                    type="text"
                                    maxLength={6}
                                    placeholder={t("signIn.otpPlaceholder")}
                                    disabled={loading}
                                    value={otp}
                                    onChange={(e) =>
                                      setOtp(e.target.value.replace(/\D/g, ""))
                                    }
                                    className="pl-10 text-sm font-medium tracking-widest text-center"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                                <span>{t("signIn.otpSentMessage")}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtp("");
                                    setOtpSent(false);
                                  }}
                                  className="text-primary hover:underline font-semibold"
                                >
                                  Change number
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2 active:scale-98"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin size-4" />
                          ) : otpSent ? (
                            t("signIn.verifyOtp")
                          ) : (
                            t("signIn.sendOtp")
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    */}

                    {/* Email Authentication Form */}
                    <TabsContent value="email">
                      <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-semibold">
                            {t("signIn.emailLabel")}
                          </Label>
                          <div className="relative flex items-center">
                            <Mail
                              size={16}
                              className="absolute left-3.5 text-muted-foreground pointer-events-none"
                            />
                            <Input
                              id="email"
                              type="email"
                              placeholder={t("signIn.emailPlaceholder")}
                              autoFocus
                              disabled={loading}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="password" className="text-xs font-semibold">
                            {t("signIn.passwordLabel")}
                          </Label>
                          <div className="relative flex items-center">
                            <Lock
                              size={16}
                              className="absolute left-3.5 text-muted-foreground pointer-events-none"
                            />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={t("signIn.passwordPlaceholder")}
                              disabled={loading}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
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
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                            <Checkbox
                              checked={rememberMe}
                              onCheckedChange={(checked) => setRememberMe(checked === true)}
                            />
                            <span>Remember Me</span>
                          </label>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2 active:scale-98"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin size-4" />
                          ) : (
                            t("signIn.login")
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Connect Divider */}
                  {/*
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-border/80"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {t("signIn.or")}
                    </span>
                    <div className="flex-grow border-t border-border/80"></div>
                  </div>
                  */}

                  {/* Google Login Inline Button */}
                  {/*
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="w-full border-border hover:bg-muted/30 text-foreground font-medium py-5 rounded-xl flex items-center justify-center gap-3 text-sm active:scale-98 transition-all duration-200"
                  >
                    {loading && activeTab === "google" ? (
                      <Loader2 className="animate-spin size-4" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    {t("signIn.googleButton")}
                  </Button>
                  */}
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 text-xs text-muted-foreground space-y-1 border-t border-border/40 mt-4 bg-muted/10">
              <div className="flex items-center gap-1">
                <span>{t("signIn.dontHaveAccount")}</span>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline font-semibold"
                >
                  {t("signIn.register")}
                </button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </I18nextProvider>
  );
}

export default Login;