import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage as sendChatMessage } from "../../../../api/chat";
import {
  Leaf,
  Plus,
  Clock,
  ChevronRight,
  Paperclip,
  Mic,
  Send,
  Download,
  Settings,
  Languages,
  X,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Sprout,
  MessageSquare,
  Menu,
  MicOff,
  ImageIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/* ─── Types ─────────────────────────────────────────────── */
type Lang = "en" | "hi";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  type: "text" | "image" | "recommendation";
  text?: string;
  textHindi?: string;
  imageFile?: string;
  recommendation?: Recommendation;
  timestamp: string;
}

interface Recommendation {
  diagnosis: string;
  diagnosisHindi?: string;
  confidence: number;
  treatment: TreatmentStep[];
  dosage: string;
  dosageHindi?: string;
  warning: string;
  warningHindi?: string;
  followUp: string;
  followUpHindi?: string;
}

interface TreatmentStep {
  step: number;
  action: string;
  actionHindi?: string;
  detail: string;
  detailHindi?: string;
}

interface HistoryItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

/* ─── Static seed data ───────────────────────────────────── */
const HISTORY: HistoryItem[] = [
  { id: "h1", label: "Wheat Fungal Issue", sublabel: "2 days ago", icon: Sprout },
  { id: "h2", label: "Soil Test — Zone B", sublabel: "5 days ago", icon: FlaskConical },
  { id: "h3", label: "Pest Control Timeline", sublabel: "1 week ago", icon: AlertTriangle },
  { id: "h4", label: "Cotton Blight Query", sublabel: "2 weeks ago", icon: Leaf },
  { id: "h5", label: "Irrigation Schedule", sublabel: "3 weeks ago", icon: MessageSquare },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "ai",
    type: "text",
    text: "Namaste! 🌿 I'm Krishi AI, your intelligent field assistant. Describe your crop issue, upload a field photo, or ask anything about soil, pests, or weather — I'm here to help.",
    textHindi: "नमस्ते! 🌿 मैं कृषि AI हूँ, आपका बुद्धिमान फील्ड सहायक। अपनी फसल की समस्या बताएं, खेत की फोटो अपलोड करें, या मिट्टी, कीट या मौसम के बारे में कुछ भी पूछें - मैं आपकी मदद के लिए यहाँ हूँ।",
    timestamp: "09:00 AM",
  },
  {
    id: "m2",
    role: "user",
    type: "text",
    text: "My cotton leaves have dark brown circular spots with yellow edges and some are wilting. This started 3 days ago in the eastern block.",
    textHindi: "मेरे कपास के पत्तों पर पीले किनारों वाले गहरे भूरे रंग के गोलाकार धब्बे हैं और कुछ मुरझा रहे हैं। यह 3 दिन पहले पूर्वी ब्लॉक में शुरू हुआ था।",
    timestamp: "09:02 AM",
  },
  {
    id: "m3",
    role: "user",
    type: "image",
    imageFile: "cotton_leaf_blight.jpg",
    timestamp: "09:02 AM",
  },
  {
    id: "m4",
    role: "ai",
    type: "recommendation",
    recommendation: {
      diagnosis:
        "Alternaria Leaf Blight (Alternaria macrospora) — a fungal infection thriving in warm, humid conditions. Symptoms match early-to-mid stage progression. Confidence: 91%.",
      diagnosisHindi: "अल्टरनेरिया लीफ ब्लाइट (अल्टरनेरिया मैक्रोस्पोरा) — गर्म, आर्द्र परिस्थितियों में पनपने वाला एक कवक संक्रमण। लक्षण शुरुआती-से-मध्य चरण की प्रगति से मेल खाते हैं। विश्वास: 91%।",
      confidence: 91,
      treatment: [
        {
          step: 1,
          action: "Isolate Affected Rows",
          actionHindi: "प्रभावित पंक्तियों को अलग करें",
          detail:
            "Immediately mark the eastern block and avoid moving equipment from that zone to prevent spore spread.",
          detailHindi: "तुरंत पूर्वी ब्लॉक को चिह्नित करें और बीजाणु प्रसार को रोकने के लिए उस क्षेत्र से उपकरणों को स्थानांतरित करने से बचें।",
        },
        {
          step: 2,
          action: "Apply Mancozeb Fungicide",
          actionHindi: "मैनकोज़ेब कवकनाशी लगाएं",
          detail:
            "Spray Mancozeb 75% WP as a preventative and curative measure. Ensure full leaf coverage including undersides.",
          detailHindi: "निवारक और उपचारात्मक उपाय के रूप में मैनकोज़ेब 75% WP का छिड़काव करें। पत्तियों के नीचे के हिस्से सहित पूर्ण कवरेज सुनिश्चित करें।",
        },
        {
          step: 3,
          action: "Remove Fallen Debris",
          actionHindi: "गिरे हुए मलबे को हटा दें",
          detail:
            "Collect and burn infected leaf litter. Do not compost — spores survive decomposition.",
          detailHindi: "संक्रमित पत्तों के कूड़े को इकट्ठा करें और जला दें। खाद न बनाएं - बीजाणु सड़ने के बाद भी जीवित रहते हैं।",
        },
        {
          step: 4,
          action: "Monitor Humidity",
          actionHindi: "नमी की निगरानी करें",
          detail:
            "Improve canopy airflow by thinning overcrowded plants. Avoid overhead irrigation for the next 10 days.",
          detailHindi: "भीड़भाड़ वाले पौधों को पतला करके कैनोपी वायु प्रवाह में सुधार करें। अगले 10 दिनों तक ओवरहेड सिंचाई से बचें।",
        },
      ],
      dosage: "Mancozeb 75% WP — 2.0 kg / acre. Dilute in 200 L water. Apply at 7-day intervals × 3 sprays.",
      dosageHindi: "मैनकोज़ेब 75% WP — 2.0 किलोग्राम / एकड़। 200 लीटर पानी में घोलें। 7 दिनों के अंतराल पर 3 छिड़काव करें।",
      warning:
        "Do not apply within 21 days of harvest. Wear PPE during application. Avoid spraying in windy conditions above 15 km/h.",
      warningHindi: "कटाई के 21 दिनों के भीतर आवेदन न करें। आवेदन के दौरान पीपीई पहनें। 15 किमी/घंटा से अधिक हवा की स्थिति में छिड़काव से बचें।",
      followUp:
        "Re-assess in 5 days. If lesions continue expanding despite treatment, escalate to Tebuconazole 25% EC at 200 mL/acre.",
      followUpHindi: "5 दिनों में पुन: मूल्यांकन करें। यदि उपचार के बावजूद घाव फैलते रहते हैं, तो 200 मिलीलीटर/एकड़ पर टेबुकोनाज़ोल 25% EC तक बढ़ाएं।",
    },
    timestamp: "09:03 AM",
  },
];

const LABELS: Record<Lang, Record<string, string>> = {
  en: {
    newConsult: "+ New Consultation",
    recentHistory: "Recent History",
    language: "हिन्दी",
    settings: "Settings",
    online: "● Krishi AI — Online",
    export: "Export Advice",
    placeholder: "Describe your crop issue or upload a photo...",
    you: "You",
    krishi: "Krishi AI",
    diagnosis: "Diagnosis",
    treatment: "Recommended Treatment",
    dosage: "Dosage / Acre",
    warning: "Safety Warning",
    followUp: "Follow-Up",
    confidence: "Confidence",
    attach: "Attach photo",
    voice: "Voice query",
  },
  hi: {
    newConsult: "+ नई परामर्श",
    recentHistory: "हाल का इतिहास",
    language: "English",
    settings: "सेटिंग्स",
    online: "● कृषि AI — ऑनलाइन",
    export: "सलाह निर्यात करें",
    placeholder: "अपनी फसल समस्या बताएं या फ़ोटो अपलोड करें...",
    you: "आप",
    krishi: "कृषि AI",
    diagnosis: "निदान",
    treatment: "अनुशंसित उपचार",
    dosage: "खुराक / एकड़",
    warning: "सुरक्षा चेतावनी",
    followUp: "अनुवर्ती",
    confidence: "विश्वास",
    attach: "फ़ोटो संलग्न करें",
    voice: "आवाज़ क्वेरी",
  },
};

/* ─── Sub-components ─────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: "var(--accent)" }}
      >
        <Leaf size={14} color="#fff" />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageBubble({ file }: { file: string }) {
  return (
    <div className="flex flex-col items-end gap-1 mb-1">
      <div
        className="rounded-2xl rounded-br-sm overflow-hidden"
        style={{
          border: "2px solid var(--accent)",
          maxWidth: "220px",
          background: "var(--muted)",
        }}
      >
        <div
          className="w-full flex items-center justify-center"
          style={{ height: "130px", background: "linear-gradient(135deg, #c8dfc4 0%, #e8f0e9 100%)" }}
        >
          <div className="flex flex-col items-center gap-2 opacity-60">
            <ImageIcon size={32} color="var(--primary)" />
            <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontFamily: "'DM Mono', monospace" }}>
              PREVIEW
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: "rgba(45,106,47,0.08)", borderTop: "1px solid var(--border)" }}
        >
          <Paperclip size={11} color="var(--accent)" />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              color: "var(--primary)",
              fontWeight: 500,
            }}
          >
            {file}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, lang, labels }: { rec: Recommendation; lang: Lang; labels: Record<string, string> }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        maxWidth: "520px",
        boxShadow: "0 4px 20px rgba(45,106,47,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: "var(--primary)", borderBottom: "none" }}
      >
        <div className="flex items-center gap-2">
          <FlaskConical size={16} color="#a5d67a" />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "#a5d67a",
              textTransform: "uppercase",
            }}
          >
            AI Field Report
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
          style={{ background: "rgba(165,214,122,0.2)", border: "1px solid rgba(165,214,122,0.35)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a5d67a" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#a5d67a" }}>
            {rec.confidence}% {labels.confidence}
          </span>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            {labels.diagnosis}
          </span>
        </div>
        <p style={{ color: "var(--foreground)", fontSize: "0.88rem", lineHeight: 1.65 }}>
          {lang === "hi" && rec.diagnosisHindi ? rec.diagnosisHindi : rec.diagnosis}
        </p>
      </div>

      {/* Treatment steps */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sprout size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            {labels.treatment}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {rec.treatment.map((t) => (
            <div key={t.step} className="flex gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  {t.step}
                </span>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.87rem", color: "var(--foreground)", marginBottom: "0.15rem" }}>
                  {lang === "hi" && t.actionHindi ? t.actionHindi : t.action}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
                  {lang === "hi" && t.detailHindi ? t.detailHindi : t.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dosage box */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical size={14} color="var(--primary)" />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--primary)",
              textTransform: "uppercase",
            }}
          >
            {labels.dosage}
          </span>
        </div>
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: "var(--secondary)",
            border: "1.5px solid rgba(45,106,47,0.25)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.82rem",
            color: "var(--primary)",
            lineHeight: 1.6,
          }}
        >
          {lang === "hi" && rec.dosageHindi ? rec.dosageHindi : rec.dosage}
        </div>
      </div>

      {/* Warning */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="flex gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(212,24,61,0.06)", border: "1px solid rgba(212,24,61,0.2)" }}
        >
          <AlertTriangle size={16} color="#d4183d" className="flex-shrink-0 mt-0.5" />
          <div>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "#d4183d",
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}
            >
              {labels.warning}
            </p>
            <p style={{ fontSize: "0.82rem", color: "#9b1530", lineHeight: 1.55 }}>{lang === "hi" && rec.warningHindi ? rec.warningHindi : rec.warning}</p>
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="px-5 py-4">
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}
        >
          {labels.followUp}
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.6 }}>{lang === "hi" && rec.followUpHindi ? rec.followUpHindi : rec.followUp}</p>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  lang,
  labels,
}: {
  msg: ChatMessage;
  lang: Lang;
  labels: Record<string, string>;
}) {
  const isUser = msg.role === "user";

  if (msg.type === "image" && isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-end mb-4"
      >
        <ImageBubble file={msg.imageFile!} />
        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
          {msg.timestamp}
        </span>
      </motion.div>
    );
  }

  if (msg.type === "recommendation" && !isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 mb-4"
      >
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
          style={{ background: "var(--accent)" }}
        >
          <Leaf size={14} color="#fff" />
        </div>
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--muted-foreground)",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {labels.krishi} · {msg.timestamp}
          </span>
          <RecommendationCard rec={msg.recommendation!} lang={lang} labels={labels} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{
          background: isUser ? "var(--primary)" : "var(--accent)",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>R</span>
        ) : (
          <Leaf size={14} color="#fff" />
        )}
      </div>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1 max-w-[72%]`}>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--muted-foreground)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {isUser ? labels.you : labels.krishi} · {msg.timestamp}
        </span>
        <div
          className="px-4 py-3 rounded-2xl"
          style={{
            background: isUser ? "var(--primary)" : "var(--card)",
            color: isUser ? "var(--primary-foreground)" : "var(--foreground)",
            border: isUser ? "none" : "1px solid var(--border)",
            borderBottomRightRadius: isUser ? "4px" : undefined,
            borderBottomLeftRadius: !isUser ? "4px" : undefined,
            fontSize: "0.9rem",
            lineHeight: 1.65,
          }}
        >
          {lang === "hi" && msg.textHindi ? msg.textHindi : msg.text}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ChatbotPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeHistory, setActiveHistory] = useState("h1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const labels = LABELS[lang];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // User message
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: "user",
      type: "text",
      text: trimmed,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
      });

      const aiMsg: ChatMessage = {
        id: `m${Date.now()}-ai`,
        role: "ai",
        type: "text",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function startNewConsult() {
    setMessages([
      {
        id: `new-${Date.now()}`,
        role: "ai",
        type: "text",
        text:
          lang === "en"
            ? "New consultation started. What crop issue can I help you with today?"
            : "नई परामर्श शुरू हुई। आज मैं आपकी किस फसल समस्या में मदद कर सकता हूँ?",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setSidebarOpen(false);
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: "var(--background)" }}
    >
      {/* ── Sidebar overlay on mobile ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: "rgba(26,28,20,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Left Sidebar ── */}
      <aside
        className={`
          fixed md:relative z-40 md:z-auto
          h-full flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          width: "280px",
          minWidth: "280px",
          background: "#1a1c14",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Leaf size={15} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: "1rem",
              color: "#fff",
            }}
          >
            Krishi Saarthi
          </span>
          <button
            className="ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* New consultation */}
        <div className="px-4 pt-5 pb-3">
          <button
            onClick={startNewConsult}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <Plus size={50} />
            {labels.newConsult}
          </button>
        </div>

        {/* Recent history */}
        <div className="px-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <p
            className="mb-3"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "1.65rem",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            {labels.recentHistory}
          </p>
          <div className="flex flex-col gap-1">
            {HISTORY.map((h) => (
              <button
                key={h.id}
                onClick={() => { setActiveHistory(h.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                style={{
                  background:
                    activeHistory === h.id
                      ? "rgba(122,182,72,0.15)"
                      : "transparent",
                  border:
                    activeHistory === h.id
                      ? "1px solid rgba(122,182,72,0.25)"
                      : "1px solid transparent",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      activeHistory === h.id
                        ? "rgba(122,182,72,0.2)"
                        : "rgba(255,255,255,0.06)",
                  }}
                >
                  <h.icon
                    size={13}
                    color={activeHistory === h.id ? "var(--accent)" : "rgba(255,255,255,0.4)"}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: activeHistory === h.id ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    {h.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    <Clock size={9} className="inline mr-1" />
                    {h.sublabel}
                  </p>
                </div>
                {activeHistory === h.id && (
                  <ChevronRight size={14} color="var(--accent)" className="ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className="px-4 py-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.87rem" }}
          >
            <Languages size={16} color="var(--accent)" />
            <span>{labels.language}</span>
            <div
              className="ml-auto px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(122,182,72,0.15)",
                border: "1px solid rgba(122,182,72,0.25)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                color: "var(--accent)",
              }}
            >
              {lang === "en" ? "EN" : "HI"}
            </div>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.87rem" }}
          >
            <Settings size={27} color="rgba(255,255,255,0.35)" />
            <span>{labels.settings}</span>
          </button>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Chat header */}
        <header
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 1px 0 var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ color: "var(--foreground)" }}
            >
              <Menu size={20} />
            </button>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Leaf size={16} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  letterSpacing: "0.01em",
                }}
              >
                {labels.online}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "var(--muted-foreground)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {lang === "en" ? "Powered by LLM · Agronomic AI" : "LLM द्वारा संचालित · कृषि AI"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-xl transition-colors hover:bg-[var(--secondary)] text-[var(--primary)]"
              style={{
                border: "1px solid var(--border)",
              }}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-[var(--secondary)]"
              style={{
                border: "1px solid var(--border)",
                color: "var(--primary)",
                fontSize: "0.83rem",
                fontWeight: 500,
              }}
            >
              <Download size={14} />
              <span className="hidden sm:inline">{labels.export}</span>
            </button>
          </div>
        </header>

        {/* Message stream */}
        <div
          className="flex-1 overflow-y-auto px-5 md:px-8 py-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} lang={lang} labels={labels} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 px-5 md:px-8 py-4"
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-2 px-4 py-3 rounded-2xl"
              style={{
                background: "var(--background)",
                border: "1.5px solid var(--border)",
                transition: "border-color 0.2s",
              }}
              onFocus={() => { }}
            >
              {/* Attach */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  setMessages((prev) => [
                    ...prev,
                    { id: `img-${Date.now()}`, role: "user", type: "image", imageFile: file.name, timestamp: now },
                  ]);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--secondary)]"
                title={labels.attach}
                style={{ color: "var(--muted-foreground)" }}
              >
                <Paperclip size={17} />
              </button>

              {/* Text input */}
              <textarea
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder={labels.placeholder}
                className="flex-1 resize-none outline-none bg-transparent"
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  lineHeight: 1.55,
                  maxHeight: "120px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  paddingTop: "2px",
                }}
              />

              {/* Mic */}
              <button
                onClick={() => setMicActive((v) => !v)}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                title={labels.voice}
                style={{
                  color: micActive ? "#fff" : "var(--muted-foreground)",
                  background: micActive ? "var(--accent)" : "transparent",
                }}
              >
                {micActive ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-30"
                style={{
                  background: input.trim() ? "var(--primary)" : "var(--muted)",
                  color: "#fff",
                }}
              >
                <Send size={17} />
              </button>
            </div>

            <p
              className="mt-2 text-center"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.67rem",
                color: "var(--muted-foreground)",
                letterSpacing: "0.02em",
              }}
            >
              {lang === "en"
                ? "Krishi AI may make mistakes. Verify critical advice with a certified agronomist."
                : "कृषि AI गलतियाँ कर सकता है। महत्वपूर्ण सलाह को प्रमाणित कृषि विशेषज्ञ से सत्यापित करें।"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
