import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import {
  TbBolt,
  TbWind,
  TbDroplet,
  TbLeaf,
  TbFilter,
  TbAlertTriangle,
  TbLock,
} from "react-icons/tb";

import ProjectCardSkeleton from "../components/ProjectCardSkeleton";
import Tooltip from "../components/Tooltip";

import {
  shopItems,
  ShopItem,
  ItemCategory,
  ItemRarity,
} from "../types/Shop";

const rarityColors: Record<ItemRarity, string> = {
  Common:
    "border-gray-500/30 text-gray-300 bg-white/5 hover:bg-white/10",

  Rare:
    "border-blue-500/50 text-blue-200 bg-blue-900/20 hover:bg-blue-800/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]",

  Epic:
    "border-purple-500/60 text-purple-200 bg-purple-900/20 hover:bg-purple-800/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]",

  Legendary:
    "border-yellow-500/80 text-yellow-200 bg-yellow-900/20 hover:bg-yellow-800/30 shadow-[0_0_30px_rgba(234,179,8,0.4)]",
};

const categoryLabels: Record<"All" | ItemCategory, string> = {
  All: "All Items",
  trees_plants: "Trees & Plants",
  renewable_energy: "Energy",
  eco_buildings: "Buildings",
  decorations: "Decorations",
  community: "Community",
};

const EMOJI_TO_ITEM = Object.fromEntries(
  shopItems.map((item) => [item.emoji, item])
);

const RESOURCE_TOOLTIPS = {
  points: "Eco points — spend in the shop to grow your village",

  air:
    "Village air health. Improved by planting trees and adding solar panels.",

  water:
    "Water cleanliness. Improved by water filters; degraded by wildlife pollution.",

  bio:
    "Biodiversity level. Improved by planting trees, gardens, and wildlife.",

  filter:
    "Status of water filters. Degrades over time; buy new filters to restore water quality.",
} as const;

const EcoVillage = () => {
  const { state, dispatch } = useGame();

  const { user, ecoVillage, notifications } = state;

  const [isLoading, setIsLoading] = useState(true);

  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showNotifications, setShowNotifications] = useState(true);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<"All" | ItemCategory>("All");

  const [purchaseEffects, setPurchaseEffects] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setShowNotifications(true);
    }
  }, [notifications]);

  const buyItem = (
    item: ShopItem,
    event: React.MouseEvent
  ) => {
    if (item.unlockRequirements) {
      const {
        airQuality = 0,
        waterQuality = 0,
        biodiversity = 0,
      } = item.unlockRequirements;

      if (
        (ecoVillage.airQuality || 0) < airQuality ||
        (ecoVillage.waterQuality || 0) < waterQuality ||
        (ecoVillage.biodiversity || 0) < biodiversity
      ) {
        setPopup({
          message: "Village milestones not met!",
          type: "error",
        });

        setTimeout(() => setPopup(null), 1500);

        return;
      }
    }

    if (user.points < item.cost) {
      setPopup({
        message: "Not enough points!",
        type: "error",
      });

      setTimeout(() => setPopup(null), 1500);

      return;
    }

    dispatch({
      type: "ADD_POINTS",
      payload: -item.cost,
    });

    const updates: Partial<typeof ecoVillage> = {
      inventory: [
        ...(ecoVillage.inventory || []),
        item.emoji,
      ],
    };

    if (item.category === "trees_plants") {
      updates.trees = Math.max(0, (ecoVillage.trees || 0) + 1);
    }

    if (item.category === "renewable_energy") {
      updates.solarPanels = Math.max(0, (ecoVillage.solarPanels || 0) + 1);
    }

    if (item.id === "water_filter") {
      updates.waterFilters = Math.max(0, (ecoVillage.waterFilters || 0) + 1);
    }

    if (item.impactScores) {
      if (item.impactScores.air) {
        updates.airQuality = Math.min(
          100,
          (ecoVillage.airQuality || 0) +
            item.impactScores.air
        );
      }

      if (item.impactScores.water) {
        updates.waterQuality = Math.min(
          100,
          (ecoVillage.waterQuality || 0) +
            item.impactScores.water
        );
      }

      if (item.impactScores.bio) {
        updates.biodiversity = Math.min(
          100,
          (ecoVillage.biodiversity || 0) +
            item.impactScores.bio
        );
      }

      if (item.id === "water_filter") {
        updates.filterHealth = 100;
      }
    }

    dispatch({
      type: "UPDATE_ECO_VILLAGE",
      payload: updates,
    });

    setPopup({
      message: `You bought ${item.label}!`,
      type: "success",
    });

    setTimeout(() => setPopup(null), 1500);

    const rect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();

    const newEffect = {
      id: Date.now(),
      x: rect.left + rect.width / 2,
      y: rect.top,
    };

    setPurchaseEffects((prev) => [
      ...prev,
      newEffect,
    ]);

    setTimeout(() => {
      setPurchaseEffects((prev) =>
        prev.filter((e) => e.id !== newEffect.id)
      );
    }, 1000);
  };

  const handleDragStart = (emoji: string) => {
    setDraggedItem(emoji);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    if (!draggedItem) return;

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) * 100;

    const y =
      ((e.clientY - rect.top) / rect.height) * 100;

    const newLandscape = [
      ...(ecoVillage.landscape || []),
      { emoji: draggedItem, x, y },
    ];

    const newInventory = [
      ...(ecoVillage.inventory || []),
    ];

    const itemIndex =
      newInventory.indexOf(draggedItem);

    if (itemIndex > -1) {
      newInventory.splice(itemIndex, 1);
    }

    dispatch({
      type: "UPDATE_ECO_VILLAGE",
      payload: {
        landscape: newLandscape,
        inventory: newInventory,
      },
    });

    setDraggedItem(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
  };

  const filteredItems =
    activeCategory === "All"
      ? shopItems
      : shopItems.filter(
          (item) =>
            item.category === activeCategory
        );

  return (
    <div className="p-4 md:p-8 text-white max-w-7xl mx-auto relative z-10">
      {/* Purchase Effects */}
      {purchaseEffects.map((effect) => (
        <motion.div
          key={effect.id}
          initial={{
            opacity: 1,
            y: effect.y,
            x: effect.x,
            scale: 0.5,
          }}
          animate={{
            opacity: 0,
            y: effect.y - 100,
            scale: 2,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="fixed pointer-events-none z-50 text-4xl text-yellow-300"
        >
          ✨
        </motion.div>
      ))}

      {/* Header and Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent flex items-center gap-2">
            🌱 Eco Village
          </h1>
          <p className="text-blue-100 mt-1.5 font-medium">
            Invest in sustainable technologies and nature to grow your green paradise.
          </p>
        </div>
        <div className="flex gap-3.5 flex-wrap w-full lg:w-auto">
          {/* Points */}
          <Tooltip content={RESOURCE_TOOLTIPS.points}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3.5 text-center min-w-[96px] shadow-lg flex-1 sm:flex-none cursor-help hover:bg-white/15 transition-all">
              <TbBolt className="h-6 w-6 text-yellow-400 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-white">{user.points}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Points</div>
            </div>
          </Tooltip>

          {/* Air Quality */}
          <Tooltip content={RESOURCE_TOOLTIPS.air}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3.5 text-center min-w-[96px] shadow-lg flex-1 sm:flex-none cursor-help hover:bg-white/15 transition-all">
              <TbWind className="h-6 w-6 text-blue-400 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-white">{ecoVillage.airQuality || 0}%</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Air</div>
            </div>
          </Tooltip>

          {/* Water Quality */}
          <Tooltip content={RESOURCE_TOOLTIPS.water}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3.5 text-center min-w-[96px] shadow-lg flex-1 sm:flex-none cursor-help hover:bg-white/15 transition-all">
              <TbDroplet className="h-6 w-6 text-cyan-400 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-white">{ecoVillage.waterQuality || 0}%</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Water</div>
            </div>
          </Tooltip>

          {/* Biodiversity */}
          <Tooltip content={RESOURCE_TOOLTIPS.bio}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3.5 text-center min-w-[96px] shadow-lg flex-1 sm:flex-none cursor-help hover:bg-white/15 transition-all">
              <TbLeaf className="h-6 w-6 text-green-400 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-white">{ecoVillage.biodiversity || 0}%</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Bio</div>
            </div>
          </Tooltip>

          {/* Filter Health */}
          <Tooltip content={RESOURCE_TOOLTIPS.filter}>
            <div className={`bg-white/10 backdrop-blur-lg border rounded-2xl p-3.5 text-center min-w-[96px] shadow-lg flex-1 sm:flex-none cursor-help hover:bg-white/15 transition-all ${
              (ecoVillage.filterHealth || 0) < 30 ? "border-red-500/50 bg-red-900/10" : "border-white/20"
            }`}>
              <TbFilter className={`h-6 w-6 mx-auto mb-1.5 ${
                (ecoVillage.filterHealth || 0) < 30 ? "text-red-400" : "text-cyan-400"
              }`} />
              <div className="text-xl font-bold text-white">{ecoVillage.filterHealth || 0}%</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Filter</div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* LANDSCAPE CONTAINER */}
      <div 
        className="mb-8 relative shadow-2xl rounded-3xl overflow-hidden min-h-[460px] border border-green-500/25 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-600"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading ? (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white font-bold gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Loading village layout...
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: "url('/villageback.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center 65%",
                transform: "scale(1.2)",
                filter: "brightness(0.9)",
              }}
            />
            {/* Ambient cloud assets */}
            <div className="absolute top-6 left-12 text-6xl z-5 pointer-events-none opacity-40 select-none">☁️</div>
            <div className="absolute top-10 right-16 text-5xl z-5 pointer-events-none opacity-40 select-none">☁️</div>
            <div className="absolute top-20 left-1/3 text-4xl z-5 pointer-events-none opacity-25 select-none">☁️</div>

            <div className="relative z-20 w-full h-[460px] overflow-hidden">
              {(ecoVillage.landscape || []).map((item, index) => {
                const placed = EMOJI_TO_ITEM[item.emoji];
                const tooltipText = placed
                  ? `${placed.label} — placed in your village`
                  : `${item.emoji} — placed item`;
                return (
                  <Tooltip key={index} content={tooltipText}>
                    <div
                      className="absolute cursor-pointer drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] select-none text-7xl hover:scale-115 transition-transform"
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 120, delay: index * 0.01 }}
                      >
                        {item.emoji}
                      </motion.div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>

            {/* Bottom visual grass fringe */}
            <div className="absolute bottom-0 left-0 right-0 h-12 z-30 pointer-events-none flex items-end justify-around text-4xl pb-2 select-none opacity-50">
              <span>🌿</span>
              <span>🌾</span>
              <span>🌱</span>
              <span>🌿</span>
              <span>🌾</span>
              <span>🌱</span>
              <span>🌿</span>
            </div>
            <div
              className="absolute inset-0 z-40 pointer-events-none"
              style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.25)" }}
            />
          </>
        )}
      </div>

      {/* INVENTORY */}
      <h2 className="text-2xl font-bold mb-3.5 flex items-center gap-2">
        📦 Inventory <span className="text-sm font-semibold text-blue-200 opacity-80">(Drag onto the village board to place)</span>
      </h2>
      <div className="flex gap-4 flex-wrap mb-8 min-h-[96px] bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 items-center">
        {isLoading ? (
          <div className="h-10 bg-white/10 rounded-xl w-1/3 animate-pulse" />
        ) : (ecoVillage.inventory || []).length === 0 ? (
          <p className="text-gray-400 text-sm">Your inventory is empty. Purchase items from the shop below to start decorating!</p>
        ) : (
          (ecoVillage.inventory || []).map((emoji, i) => {
            const item = EMOJI_TO_ITEM[emoji];
            const tooltipText = item
              ? `${item.label} — Drag to place in village`
              : `${emoji} — Drag to place`;
            return (
              <Tooltip key={i} content={tooltipText}>
                <div
                  draggable
                  onDragStart={() => handleDragStart(emoji)}
                  className="text-5xl p-3.5 bg-green-700/25 hover:bg-green-700/45 hover:scale-110 active:scale-95 transition-all cursor-grab active:cursor-grabbing border border-green-500/20 shadow-md rounded-xl select-none"
                >
                  {emoji}
                </div>
              </Tooltip>
            );
          })
        )}
      </div>

      {/* SHOP HEADER & CATEGORIES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🛒 Village Shop
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(Object.keys(categoryLabels) as ("All" | ItemCategory)[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* SHOP GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="contents"
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProjectCardSkeleton key={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="shop-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="contents"
            >
              {filteredItems.map((item) => {
                const canAfford = user.points >= item.cost;
                
                // Unlock milestone checks
                let isLocked = false;
                const reqs = item.unlockRequirements;
                if (reqs) {
                  if (
                    (ecoVillage.airQuality || 0) < (reqs.airQuality || 0) ||
                    (ecoVillage.waterQuality || 0) < (reqs.waterQuality || 0) ||
                    (ecoVillage.biodiversity || 0) < (reqs.biodiversity || 0)
                  ) {
                    isLocked = true;
                  }
                }

                return (
                  <Tooltip key={item.id} content={item.description} disableTouchToggle>
                    <motion.div
                      whileHover={isLocked ? {} : { y: -4 }}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                        isLocked
                          ? "bg-slate-950/20 border-white/5 opacity-50"
                          : rarityColors[item.rarity] || rarityColors.Common
                      }`}
                    >
                      {/* Rarity Tag */}
                      <div className="absolute top-3.5 right-3.5 text-[9px] uppercase font-extrabold tracking-widest opacity-60">
                        {item.rarity}
                      </div>

                      <div>
                        {/* Item Icon */}
                        <div className="text-5xl my-4 text-center select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
                          {item.emoji}
                        </div>
                        {/* Meta */}
                        <h3 className="font-extrabold text-white text-lg">{item.label}</h3>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">
                        {/* Stats Boost Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                          {item.impactScores.air && (
                            <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/25">
                              💨 +{item.impactScores.air}% Air
                            </span>
                          )}
                          {item.impactScores.water && (
                            <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/25">
                              💧 +{item.impactScores.water}% Water
                            </span>
                          )}
                          {item.impactScores.bio && (
                            <span className="text-[9px] font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md border border-green-500/25">
                              🌿 +{item.impactScores.bio}% Bio
                            </span>
                          )}
                          {item.impactScores.pointsMultiplier && (
                            <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-md border border-yellow-500/25">
                              🪙 x{item.impactScores.pointsMultiplier} XP
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        {isLocked ? (
                          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold select-none">
                            <TbLock className="h-4 w-4" />
                            <span>Unlock: </span>
                            <span className="font-extrabold text-blue-300">
                              {reqs?.airQuality ? `💨${reqs.airQuality}% ` : ""}
                              {reqs?.waterQuality ? `💧${reqs.waterQuality}% ` : ""}
                              {reqs?.biodiversity ? `🌿${reqs.biodiversity}%` : ""}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => buyItem(item, e)}
                            disabled={!canAfford}
                            className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md shadow-green-500/10 cursor-pointer"
                                : "bg-white/5 text-slate-400 border border-white/10 cursor-not-allowed"
                            }`}
                          >
                            <span>Buy for {item.cost} points</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </Tooltip>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* POPUP TOAST */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-2 font-bold ${
              popup.type === "success"
                ? "bg-green-950/95 border-green-500/30 text-green-300"
                : "bg-red-950/95 border-red-500/30 text-red-300"
            }`}
          >
            {popup.type === "success" ? "✨" : "⚠️"}
            <span>{popup.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VILLAGE LOG PANEL */}
      <AnimatePresence>
        {showNotifications && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 z-40 max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <TbAlertTriangle className="h-5 w-5 text-orange-400" />
                Village Log
              </h3>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  dispatch({ type: "CLEAR_NOTIFICATIONS" });
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {notifications.map((note, index) => (
                <div key={index} className="text-xs text-slate-200 bg-white/5 border border-white/5 rounded-xl p-2.5">
                  {note}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcoVillage;