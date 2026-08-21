import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendMessage as sendChatMessage,
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  ConversationSummary,
} from "../../../api/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  LogOut,
  Home,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

function formatSublabel(dateStr: string) {
  if (!dateStr) return "";
  const isoStr = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}



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
    logout: "Log Out",
    home: "Home",
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
    logout: "लॉग आउट",
    home: "मुख्य पृष्ठ",
  },
};

const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    "Who is your creator? 😎",
    "How can I control fungal growth in my field?",
    "Give me a quick irrigation plan for today.",
  ],
  hi: [
    "तुम्हारे निर्माता कौन है? 😎",
    "मेरे खेत में कवक वृद्धि को कैसे नियंत्रित करूं?",
    "आज के लिए एक त्वरित सिंचाई योजना दीजिए।",
  ],
};

const EMPTY_STATE_PROMPTS: Record<Lang, Array<{ label: string; prompt: string }>> = {
  en: [
    {
      label: "Crop disease",
      prompt: "My crop has a disease. Diagnose it and suggest treatment.",
    },
    {
      label: "Soil advice",
      prompt: "Give me soil health and fertilizer advice for my field.",
    },
    {
      label: "Weather plan",
      prompt: "Create a weather-based irrigation and farm plan for today.",
    },
  ],
  hi: [
    {
      label: "फसल रोग",
      prompt: "मेरी फसल में रोग है। इसका निदान करें और उपचार बताएं।",
    },
    {
      label: "मिट्टी सलाह",
      prompt: "मेरे खेत के लिए मिट्टी स्वास्थ्य और उर्वरक सलाह दें।",
    },
    {
      label: "मौसम योजना",
      prompt: "आज के लिए मौसम-आधारित सिंचाई और कृषि योजना बनाएं।",
    },
  ],
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
      className="rounded-2xl overflow-hidden shadow-md transition-colors"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        maxWidth: "520px",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: "var(--primary)", borderBottom: "none" }}
      >
        <div className="flex items-center gap-2">
          <FlaskConical size={16} style={{ color: "var(--primary-foreground)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "var(--primary-foreground)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            AI Field Report
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary-foreground)" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--primary-foreground)", fontWeight: 600 }}>
            {rec.confidence}% {labels.confidence}
          </span>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              textTransform: "uppercase",
              fontWeight: 700,
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
          <Sprout size={14} style={{ color: "var(--accent)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              textTransform: "uppercase",
              fontWeight: 700,
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
                    color: "var(--accent)",
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
          <FlaskConical size={14} style={{ color: "var(--accent)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {labels.dosage}
          </span>
        </div>
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: "var(--secondary)",
            border: "1.5px solid var(--border)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.82rem",
            color: "var(--foreground)",
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
          style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
        >
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div>
            <p
              className="text-red-600 dark:text-red-400"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}
            >
              {labels.warning}
            </p>
            <p className="text-red-700 dark:text-red-300" style={{ fontSize: "0.82rem", lineHeight: 1.55 }}>
              {lang === "hi" && rec.warningHindi ? rec.warningHindi : rec.warning}
            </p>
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
        <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.6 }}>
          {lang === "hi" && rec.followUpHindi ? rec.followUpHindi : rec.followUp}
        </p>
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
          <Leaf size={14} color="var(--accent-foreground)" />
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
          color: isUser ? "var(--primary-foreground)" : "var(--accent-foreground)",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>R</span>
        ) : (
          <Leaf size={14} />
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
          className="px-4 py-3 rounded-2xl shadow-sm"
          style={{
            background: isUser ? "var(--primary)" : "var(--chat-bubble-ai-bg)",
            color: isUser ? "var(--primary-foreground)" : "var(--chat-bubble-ai-text)",
            border: isUser ? "none" : "1px solid var(--border)",
            borderBottomRightRadius: isUser ? "4px" : undefined,
            borderBottomLeftRadius: !isUser ? "4px" : undefined,
            fontSize: "0.9rem",
            lineHeight: 1.65,
          }}
        >
          {isUser ? (
            lang === "hi" && msg.textHindi ? msg.textHindi : msg.text
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground dark:text-emerald-50">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lang === "hi" && msg.textHindi ? msg.textHindi : msg.text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ChatbotPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const labels = LABELS[lang];
  const suggestions = SUGGESTIONS[lang];
  const emptyStatePrompts = EMPTY_STATE_PROMPTS[lang];
  const hasInput = input.trim().length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [isAuthenticated]);

  async function loadConversations(selectId?: number) {
    setLoadingConversations(true);
    try {
      const list = await fetchConversations();
      setConversations(list);
      if (selectId) {
        selectConversation(selectId);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }

  async function selectConversation(id: number) {
    setActiveConversationId(id);
    setSidebarOpen(false);
    setLoadingMessages(true);
    try {
      const detail = await fetchConversationMessages(id);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }

  function startNewConsult() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSidebarOpen(false);
  }

  function handleDeleteConversation(id: number) {
    const target = conversations.find((conversation) => conversation.id === id);
    if (!target) return;

    setDeleteTarget(target);
  }

  async function confirmDeleteConversation() {
    if (!deleteTarget) return;

    try {
      await deleteConversation(deleteTarget.id);
      setConversations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (activeConversationId === deleteTarget.id) {
        startNewConsult();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function sendMessage(messageOverride?: string) {
    const trimmed = (messageOverride ?? input).trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: "user",
      type: "text",
      text: trimmed,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setTyping(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        conversation_id: activeConversationId,
      });

      if (response.conversation_id) {
        setActiveConversationId(response.conversation_id);
      }

      loadConversations();

      if (response.messages && response.messages.length > 0) {
        setMessages(response.messages);
      } else if (response.reply) {
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
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "ai",
        type: "text",
        text: "I couldn't process your request right now. Please check your network connection or try logging in again.",
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  function handleSuggestionClick(text: string) {
    setInput(text);
    textareaRef.current?.focus();
  }

  function handleEmptyStatePrompt(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  function handleGoHome() {
    setSidebarOpen(false);
    navigate("/");
  }

  function handleExportAdvice() {
    const sections = messages.map((message, index) => {
      const speaker = message.role === "ai" ? labels.krishi : labels.you;
      const body =
        message.type === "recommendation" && message.recommendation
          ? [
            `${labels.diagnosis}: ${lang === "hi" && message.recommendation.diagnosisHindi ? message.recommendation.diagnosisHindi : message.recommendation.diagnosis}`,
            `${labels.treatment}: ${message.recommendation.treatment
              .map((step) => `${step.step}. ${lang === "hi" && step.actionHindi ? step.actionHindi : step.action}`)
              .join("; ")}`,
          ].join("\n")
          : lang === "hi" && message.textHindi
            ? message.textHindi
            : message.text || "";

      return [
        `${index + 1}. ${speaker} | ${message.timestamp}`,
        body,
      ].join("\n");
    });

    const content = [
      `Krishi Saarthi ${labels.export}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      ...(sections.length > 0 ? sections : ["No consultation messages available."]),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `krishi-saarthi-advice-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function handleToggleLanguage(nextLang: Lang) {
    setLang(nextLang);
  }

  function handleLogout() {
    setSidebarOpen(false);
    signOut();
  }


  return (
    <div
      className="flex h-screen overflow-hidden transition-colors"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "var(--chat-gradient)",
      }}
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
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-80"
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
          </div>
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
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            <Plus size={16} />
            {labels.newConsult}
          </button>
        </div>

        {/* Recent history */}
        <div className="px-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <p
            className="mb-3"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            {labels.recentHistory}
          </p>
          <div className="flex flex-col gap-1">
            {conversations.length === 0 ? (
              <div
                className="px-3 py-4 text-center"
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                No saved consultations
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className="group relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors hover:bg-white/5"
                  style={{
                    background:
                      activeConversationId === c.id
                        ? "rgba(122,182,72,0.15)"
                        : "transparent",
                    border:
                      activeConversationId === c.id
                        ? "1px solid rgba(122,182,72,0.25)"
                        : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        activeConversationId === c.id
                          ? "rgba(122,182,72,0.2)"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <MessageSquare
                      size={13}
                      color={activeConversationId === c.id ? "var(--accent)" : "rgba(255,255,255,0.4)"}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pr-12">
                    <p
                      className="truncate"
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: activeConversationId === c.id ? "#fff" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {c.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      <Clock size={9} className="inline mr-1" />
                      {formatSublabel(c.updated_at)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(c.id);
                    }}
                    className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    title="Delete consultation"
                    aria-label="Delete consultation"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className="px-4 py-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.87rem" }}
              >
                <Settings size={16} color="rgba(255,255,255,0.35)" />
                <span>{labels.settings}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={10}
              collisionPadding={12}
              className="w-[min(18rem,calc(100vw-2rem))] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#23261d] p-2 shadow-2xl"
            >
              <DropdownMenuItem
                onSelect={handleGoHome}
                className="min-h-11 gap-3 rounded-xl px-3 py-3 text-sm text-white/80 focus:bg-white/5 focus:text-white"
              >
                <Home size={16} color="var(--accent)" />
                <span>{lang === "en" ? "Home" : "मुख्य पृष्ठ"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleExportAdvice}
                className="min-h-11 gap-3 rounded-xl px-3 py-3 text-sm text-white/80 focus:bg-white/5 focus:text-white"
              >
                <Download size={16} color="var(--accent)" />
                <span>{labels.export}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleLogout}
                className="min-h-11 gap-3 rounded-xl px-3 py-3 text-sm text-white/80 focus:bg-white/5 focus:text-white"
              >
                <LogOut size={16} color="var(--accent)" />
                <span>{labels.logout}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-white/10" />
              <DropdownMenuLabel className="px-3 pb-2 pt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                {lang === "en" ? "Language" : "भाषा"}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={lang} onValueChange={(value) => handleToggleLanguage(value as Lang)}>
                <DropdownMenuRadioItem
                  value="en"
                  className="min-h-11 rounded-xl px-3 py-3 text-sm text-white/80 focus:bg-white/5 focus:text-white"
                >
                  <Languages size={16} color="var(--accent)" />
                  <span>English</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="hi"
                  className="min-h-11 rounded-xl px-3 py-3 text-sm text-white/80 focus:bg-white/5 focus:text-white"
                >
                  <Languages size={16} color="var(--accent)" />
                  <span>हिन्दी</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Chat header */}
        <header
          className="flex items-center gap-4 px-5 py-3.5 flex-shrink-0"
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 1px 0 var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ color: "var(--foreground)" }}
            >
              <Menu size={20} />
            </button>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              <Leaf size={16} />
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

          <div className="ml-auto flex items-center gap-2">
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
          </div>
        </header>

        {/* Message stream */}
        <div
          className="flex-1 overflow-y-auto px-5 md:px-8 py-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
        >
          <div className="max-w-3xl mx-auto h-full">
            {messages.length === 0 && !typing ? (
              <div className="flex h-full min-h-[420px] items-center justify-center">
                <div
                  className="w-full max-w-xl rounded-[28px] border p-8 text-center shadow-lg transition-colors"
                  style={{
                    background: "var(--chat-empty-card-bg)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-md"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <Leaf size={24} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--foreground)",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {lang === "en" ? "How can Krishi AI help you today?" : "आज कृषि AI आपकी किस तरह मदद कर सकता है?"}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      lineHeight: 1.7,
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {lang === "en"
                      ? "Ask about crops, soil, pests, irrigation, or upload a photo for quick guidance."
                      : "फसल, मिट्टी, कीट, सिंचाई के बारे में पूछें या त्वरित मार्गदर्शन के लिए फोटो अपलोड करें।"}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {emptyStatePrompts.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleEmptyStatePrompt(chip.prompt)}
                        className="rounded-full px-3 py-1.5 text-sm transition-colors"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} lang={lang} labels={labels} />
                ))}
                {typing && <TypingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 px-5 md:px-8 py-4 transition-colors"
          style={{
            background: "var(--chat-input-bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="mb-3 flex flex-wrap gap-2">
              {messages.length === 0 && !typing && suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border px-3 py-2 text-left text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: "var(--chat-suggestion-bg)",
                    borderColor: "var(--chat-suggestion-border)",
                    color: "var(--foreground)",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div
              className="flex items-end gap-2 px-4 py-3 rounded-2xl transition-shadow shadow-sm focus-within:ring-1 focus-within:ring-[var(--accent)]"
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
              }}
            >
              {/* Attach */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fileName = file.name;
                  e.target.value = "";

                  const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  setMessages((prev) => [
                    ...prev,
                    { id: `img-${Date.now()}`, role: "user", type: "image", imageFile: fileName, timestamp: now },
                  ]);
                  setTyping(true);

                  try {
                    const response = await sendChatMessage({
                      message: `[Field Image: ${fileName}] Please inspect this image and advise.`,
                      conversation_id: activeConversationId,
                      image_file: fileName,
                    });
                    if (response.conversation_id) {
                      setActiveConversationId(response.conversation_id);
                    }
                    loadConversations();
                    if (response.messages && response.messages.length > 0) {
                      setMessages(response.messages);
                    }
                  } catch (err) {
                    console.error("Image upload send error:", err);
                  } finally {
                    setTyping(false);
                  }
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 self-end w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--secondary)]"
                title={labels.attach}
                style={{ color: "var(--muted-foreground)" }}
              >
                <Paperclip size={17} />
              </button>

              {/* Text input */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={labels.placeholder}
                className="flex-1 resize-none outline-none bg-transparent"
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  lineHeight: 1.55,
                  minHeight: "44px",
                  maxHeight: "144px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  paddingTop: "2px",
                }}
              />

              {/* Mic */}
              <button
                onClick={() => setMicActive((v) => !v)}
                className="flex-shrink-0 self-end w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
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
                onClick={() => sendMessage()}
                disabled={!hasInput}
                className="flex-shrink-0 self-end w-10 h-10 rounded-lg flex items-center justify-center transition-all enabled:hover:opacity-90 enabled:shadow-sm disabled:opacity-35 disabled:cursor-not-allowed"
                style={{
                  background: hasInput ? "var(--accent)" : "var(--muted)",
                  color: hasInput ? "#fff" : "var(--muted-foreground)",
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

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border border-border bg-[var(--card)] text-[var(--foreground)] sm:max-w-[28rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.title ?? "this conversation"} from your recent history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteConversation} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}