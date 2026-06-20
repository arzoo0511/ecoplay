import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Search,
  Star,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { learningContent, LearningContent } from "../data/learningContent";

type ResourceType = "all" | LearningContent["type"];
type CategoryKey =
  | "all"
  | "climate"
  | "ocean"
  | "renewable"
  | "biodiversity"
  | "sustainability";

const categoryChips: Array<{ key: CategoryKey; label: string; emoji: string }> =
  [
    { key: "all", label: "All Topics", emoji: "🌍" },
    { key: "climate", label: "Climate", emoji: "🌡" },
    { key: "ocean", label: "Ocean", emoji: "🌊" },
    { key: "renewable", label: "Energy", emoji: "⚡" },
    { key: "biodiversity", label: "Biodiversity", emoji: "🦋" },
    { key: "sustainability", label: "Lifestyle", emoji: "♻️" },
  ];

const typeChips: Array<{ key: ResourceType; label: string; emoji: string }> = [
  { key: "all", label: "All Types", emoji: "" },
  { key: "video", label: "Video", emoji: "📹" },
  { key: "article", label: "Article", emoji: "📄" },
  { key: "interactive", label: "Interactive", emoji: "🎮" },
];

const categoryLabels: Record<string, string> = {
  climate: "Climate Change",
  ocean: "Ocean Conservation",
  renewable: "Renewable Energy",
  biodiversity: "Biodiversity",
  sustainability: "Sustainability",
};

const getDifficultyClasses = (difficulty: LearningContent["difficulty"]) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "Intermediate":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Advanced":
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
  }
};

const getTypeLabel = (type: LearningContent["type"]) => {
  switch (type) {
    case "video":
      return "📹 Video";
    case "article":
      return "📄 Article";
    case "interactive":
      return "🎮 Interactive";
    default:
      return type;
  }
};

const ResourceCard: React.FC<{
  content: LearningContent;
  isCompleted: boolean;
  onOpen: (id: string, url: string) => void;
}> = ({ content, isCompleted, onOpen }) => {
  const points = content.points ?? 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-eco-border bg-eco-panel"
    >
      {isCompleted && (
        <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl ring-2 ring-emerald-500/40" />
      )}

      <div className="relative">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="h-44 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg";
          }}
        />
        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {getTypeLabel(content.type)}
        </div>
        {isCompleted ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-bold text-white">
            <CheckCircle2 className="h-3 w-3" /> Done
          </div>
        ) : (
          <div className="absolute right-2 top-2 rounded-full bg-eco-accent/90 px-2.5 py-1 text-xs font-bold text-white">
            <Star className="inline h-3 w-3 mr-0.5" /> {points} pts
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-b-2xl border-t border-eco-border p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-eco-accent">
            {categoryLabels[content.category] ?? content.category}
          </p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyClasses(content.difficulty)}`}
          >
            {content.difficulty}
          </span>
        </div>

        <h3 className="overflow-hidden text-base font-semibold leading-snug text-eco-text line-clamp-2">
          {content.title}
        </h3>

        <p className="overflow-hidden text-sm leading-relaxed text-eco-muted line-clamp-3">
          {content.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-eco-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {content.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            {content.rating}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpen(content.id, content.url)}
          className={`mt-auto w-full rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            isCompleted
              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
              : "bg-eco-accent text-white hover:bg-eco-accentAlt"
          }`}
        >
          {isCompleted ? "✓ Review Again" : "Start Learning →"}
        </button>
      </div>
    </motion.div>
  );
};

const STORAGE_KEY_PREFIX = "ecoplay_learn_completed";

/** Builds a localStorage key scoped to the current user. */
function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}_${userId}`;
}

/** Loads the set of completed resource IDs from localStorage. */
function loadCompletedIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed))
      return new Set(parsed.filter((v): v is string => typeof v === "string"));
    return new Set();
  } catch {
    return new Set();
  }
}

/** Persists completed resource IDs to localStorage. */
function saveCompletedIds(userId: string, ids: Set<string>): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

const Learn = () => {
  const { user } = useAuth();
  const { dispatch } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [selectedType, setSelectedType] = useState<ResourceType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setCompletedIds(loadCompletedIds(user.id));
  }, [user?.id]);

  const filteredContent = learningContent.filter((content) => {
    const matchesCategory =
      selectedCategory === "all" || content.category === selectedCategory;
    const matchesType = selectedType === "all" || content.type === selectedType;
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  const completedCount = learningContent.filter((c) =>
    completedIds.has(c.id),
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
  };

  const scrollToGrid = () => {
    setTimeout(() => {
      document.getElementById("resource-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  /** Shows a transient toast message for 3 seconds. */
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const openResource = useCallback(
    (id: string, url: string) => {
      window.open(url, "_blank", "noopener,noreferrer");

      if (completedIds.has(id)) {
        showToast("Already completed — no extra points awarded");
        return;
      }

      const next = new Set(completedIds);
      next.add(id);
      setCompletedIds(next);

      if (user?.id) {
        saveCompletedIds(user.id, next);
      }

      const resource = learningContent.find((c) => c.id === id);
      const points = resource?.points ?? 0;

      if (points > 0) {
        dispatch({
          type: "ADD_POINTS",
          payload: points,
          activityType: "learn_video",
          metadata: { resourceId: id, resourceTitle: resource?.title },
        });
        showToast(`+${points} XP earned!`);
      }
    },
    [completedIds, user?.id, dispatch, showToast],
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        {/* Hero Section */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8">
          <div className="h-10 w-72 rounded-full bg-white/10 mb-4"></div>
          <div className="h-4 w-96 rounded-full bg-white/10 mb-6"></div>

          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 w-36 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="h-12 rounded-xl bg-white/10 mb-4"></div>

          <div className="space-y-4">
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-10 w-28 rounded-full bg-white/10"
                />
              ))}
            </div>

            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-10 w-24 rounded-full bg-white/10"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <div
              key={card}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]"
            >
              {/* shimmer */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative z-10">
                <div className="h-44 bg-white/10"></div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 rounded-full bg-white/10"></div>
                    <div className="h-5 w-20 rounded-full bg-white/10"></div>
                  </div>

                  <div className="h-5 w-4/5 rounded-full bg-white/10"></div>

                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-white/10"></div>
                    <div className="h-3 w-5/6 rounded-full bg-white/10"></div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-4 w-20 rounded-full bg-white/10"></div>
                    <div className="h-4 w-16 rounded-full bg-white/10"></div>
                  </div>

                  <div className="h-10 rounded-xl bg-white/10"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-900/90 px-5 py-3 text-sm font-medium text-emerald-200 shadow-lg backdrop-blur-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 overflow-hidden rounded-3xl border border-eco-border bg-eco-surface bg-gradient-to-br from-eco-accent/10 to-transparent px-6 py-8 sm:px-8 lg:px-10">
        <h1 className="text-4xl font-bold text-eco-text">Explore & Learn</h1>
        <p className="mt-3 text-lg text-eco-muted">
          Discover sustainability topics at your own pace
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-eco-border bg-eco-panel px-4 py-1.5 text-sm text-eco-muted">
            <BookOpen className="h-3.5 w-3.5 text-eco-accent" />
            <span>{learningContent.length} Resources</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-eco-border bg-eco-panel px-4 py-1.5 text-sm text-eco-muted">
            <LayoutGrid className="h-3.5 w-3.5 text-eco-accent" />
            <span>6 Categories</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-eco-border bg-eco-panel px-4 py-1.5 text-sm text-eco-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {completedCount} / {learningContent.length} Completed
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-eco-border bg-eco-panel px-4 py-1.5 text-sm text-eco-muted">
            <Star className="h-3.5 w-3.5 text-eco-accent" />
            <span>Earn Points</span>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-10 mb-8 rounded-2xl border border-eco-border bg-eco-surface/95 p-4 shadow-md backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="w-full lg:max-w-md">
            <label className="sr-only" htmlFor="resource-search">
              Search resources
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eco-muted" />
              <input
                id="resource-search"
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-eco-border bg-eco-panel py-3 pl-10 pr-10 text-eco-text placeholder:text-eco-muted focus:outline-none focus:ring-2 focus:ring-eco-accent/40"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-eco-muted transition-colors hover:text-eco-text"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-eco-muted">
              Categories
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {categoryChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(chip.key);
                    scrollToGrid();
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === chip.key
                      ? "bg-eco-accent text-white"
                      : "border border-eco-border bg-eco-panel text-eco-muted hover:border-eco-accent"
                  }`}
                >
                  {chip.emoji ? `${chip.emoji} ` : ""}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-eco-muted">
              Type
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {typeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    setSelectedType(chip.key);
                    scrollToGrid();
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedType === chip.key
                      ? "bg-eco-accent text-white"
                      : "border border-eco-border bg-eco-panel text-eco-muted hover:border-eco-accent"
                  }`}
                >
                  {chip.emoji ? `${chip.emoji} ` : ""}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-eco-muted">
        Showing {filteredContent.length} of {learningContent.length} resources
      </div>

      <div id="resource-grid">
        <AnimatePresence mode="wait">
          {filteredContent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-eco-border bg-eco-surface px-6 py-12 text-center max-w-md mx-auto my-4 space-y-4 shadow-xl"
            >
              {/* Circular Search Icon Wrapper */}
              <div className="p-4 bg-eco-accent/10 rounded-full text-eco-accent border border-eco-accent/20 shadow-inner">
                <Search className="h-8 w-8 animate-pulse" />
              </div>

              {/* Text Hierarchy */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-eco-text">
                  No Resources Found
                </h2>
                <p className="text-sm text-eco-muted max-w-xs mx-auto">
                  We couldn't find any matches for your current search keywords
                  or category combinations.
                </p>
              </div>

              {/* Interactive CTA to Reset Filters */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-xl bg-eco-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-eco-accentAlt shadow-lg shadow-eco-accent/20"
              >
                🔄 Reset Filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredContent.map((content) => (
                <ResourceCard
                  key={content.id}
                  content={content}
                  isCompleted={completedIds.has(content.id)}
                  onOpen={openResource}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Learn;
