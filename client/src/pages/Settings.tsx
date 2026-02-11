/**
 * Settings Page — Game configuration hub
 * Design: Neo-retro arcade aesthetic with indigo/coral/mint accents
 * Controls: Difficulty, Game Speed, Sound FX, Background Music, Theme
 */
import { Link } from "wouter";
import { ArrowLeft, Gamepad2, Home, Volume2, VolumeX, Music, Settings as SettingsIcon, Zap, RotateCcw, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useGameSettings, type Difficulty, type GameSpeed } from "@/contexts/GameSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { motion } from "framer-motion";

const difficulties: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: "easy", label: "EASY", desc: "Wider gaps, slower enemies, more forgiving", color: "arcade-mint" },
  { value: "medium", label: "MEDIUM", desc: "Balanced challenge for most players", color: "arcade-coral" },
  { value: "hard", label: "HARD", desc: "Tight gaps, fast enemies, no mercy", color: "arcade-indigo" },
];

const speeds: { value: GameSpeed; label: string; mult: string; color: string }[] = [
  { value: "slow", label: "SLOW", mult: "0.7x", color: "arcade-mint" },
  { value: "normal", label: "NORMAL", mult: "1.0x", color: "arcade-coral" },
  { value: "fast", label: "FAST", mult: "1.4x", color: "arcade-indigo" },
];

export default function Settings() {
  const settings = useGameSettings();
  const { theme, toggleTheme, switchable } = useTheme();
  const { playSound } = useSoundEngine();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Back</span>
              </div>
            </Link>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-arcade-coral" />
              <h1 className="font-pixel text-sm sm:text-base text-arcade-coral">SETTINGS</h1>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
              <Gamepad2 className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Settings Content */}
      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">

          {/* Difficulty Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-arcade-coral/20 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-arcade-coral" />
              </div>
              <div>
                <h2 className="font-pixel text-sm sm:text-base text-foreground">DIFFICULTY</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Affects enemy speed, gap sizes, and obstacle frequency</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    settings.setDifficulty(d.value);
                    playSound("click");
                  }}
                  className={`relative rounded-lg border p-2 sm:p-3 text-center transition-all duration-200 ${
                    settings.difficulty === d.value
                      ? `border-${d.color} bg-${d.color}/10 shadow-lg`
                      : "border-border/50 bg-background hover:border-border"
                  }`}
                >
                  <span className={`font-pixel text-xs sm:text-sm block ${
                    settings.difficulty === d.value ? `text-${d.color}` : "text-muted-foreground"
                  }`}>
                    {d.label}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 block leading-tight">
                    {d.desc}
                  </span>
                  {settings.difficulty === d.value && (
                    <motion.div
                      layoutId="difficulty-indicator"
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-${d.color}`}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Game Speed Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-arcade-mint/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-arcade-mint" />
              </div>
              <div>
                <h2 className="font-pixel text-sm sm:text-base text-foreground">GAME SPEED</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Global speed multiplier for all games</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    settings.setGameSpeed(s.value);
                    playSound("click");
                  }}
                  className={`relative rounded-lg border p-2 sm:p-3 text-center transition-all duration-200 ${
                    settings.gameSpeed === s.value
                      ? `border-${s.color} bg-${s.color}/10 shadow-lg`
                      : "border-border/50 bg-background hover:border-border"
                  }`}
                >
                  <span className={`font-pixel text-xs sm:text-sm block ${
                    settings.gameSpeed === s.value ? `text-${s.color}` : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                  <span className={`font-pixel text-[10px] mt-1 block ${
                    settings.gameSpeed === s.value ? `text-${s.color}/70` : "text-muted-foreground/60"
                  }`}>
                    {s.mult}
                  </span>
                  {settings.gameSpeed === s.value && (
                    <motion.div
                      layoutId="speed-indicator"
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-${s.color}`}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Sound Effects Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-arcade-indigo/20 flex items-center justify-center">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-arcade-indigo" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-pixel text-sm sm:text-base text-foreground">SOUND EFFECTS</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Retro 8-bit bleeps and bloops</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => {
                  settings.setSoundEnabled(checked);
                  if (checked) setTimeout(() => playSound("click"), 50);
                }}
              />
            </div>
            {settings.soundEnabled && (
              <div className="flex items-center gap-3 mt-3">
                <VolumeX className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[settings.soundVolume]}
                  onValueChange={([v]) => settings.setSoundVolume(v)}
                  onValueCommit={() => playSound("eat")}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="font-pixel text-[10px] text-muted-foreground w-8 text-right">
                  {settings.soundVolume}%
                </span>
              </div>
            )}
          </motion.section>

          {/* Background Music Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-arcade-coral/20 flex items-center justify-center">
                <Music className={`w-4 h-4 ${settings.musicEnabled ? "text-arcade-coral" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <h2 className="font-pixel text-sm sm:text-base text-foreground">BACKGROUND MUSIC</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Chiptune loops while playing</p>
              </div>
              <Switch
                checked={settings.musicEnabled}
                onCheckedChange={(checked) => {
                  settings.setMusicEnabled(checked);
                }}
              />
            </div>
            {settings.musicEnabled && (
              <div className="flex items-center gap-3 mt-3">
                <Music className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-40" />
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={([v]) => settings.setMusicVolume(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Music className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="font-pixel text-[10px] text-muted-foreground w-8 text-right">
                  {settings.musicVolume}%
                </span>
              </div>
            )}
          </motion.section>

          {/* Theme Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-arcade-indigo/20 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-arcade-indigo" />
              </div>
              <div>
                <h2 className="font-pixel text-sm sm:text-base text-foreground">THEME</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Switch between dark and light mode</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (toggleTheme && theme !== "dark") toggleTheme();
                  playSound("click");
                }}
                className={`rounded-lg border p-3 sm:p-4 text-center transition-all duration-200 flex flex-col items-center gap-2 ${
                  theme === "dark"
                    ? "border-arcade-indigo bg-arcade-indigo/10"
                    : "border-border/50 bg-background hover:border-border"
                }`}
              >
                <Moon className={`w-5 h-5 ${theme === "dark" ? "text-arcade-indigo" : "text-muted-foreground"}`} />
                <span className={`font-pixel text-xs ${theme === "dark" ? "text-arcade-indigo" : "text-muted-foreground"}`}>
                  DARK
                </span>
              </button>
              <button
                onClick={() => {
                  if (toggleTheme && theme !== "light") toggleTheme();
                  playSound("click");
                }}
                className={`rounded-lg border p-3 sm:p-4 text-center transition-all duration-200 flex flex-col items-center gap-2 ${
                  theme === "light"
                    ? "border-arcade-coral bg-arcade-coral/10"
                    : "border-border/50 bg-background hover:border-border"
                }`}
              >
                <Sun className={`w-5 h-5 ${theme === "light" ? "text-arcade-coral" : "text-muted-foreground"}`} />
                <span className={`font-pixel text-xs ${theme === "light" ? "text-arcade-coral" : "text-muted-foreground"}`}>
                  LIGHT
                </span>
              </button>
            </div>
          </motion.section>

          {/* Test Sound & Reset */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 border-arcade-mint/30 text-arcade-mint hover:bg-arcade-mint/10 font-pixel text-xs gap-2"
              onClick={() => playSound("levelUp")}
            >
              <Volume2 className="w-4 h-4" /> TEST SOUND
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-arcade-coral/30 text-arcade-coral hover:bg-arcade-coral/10 font-pixel text-xs gap-2"
              onClick={() => {
                settings.resetToDefaults();
                playSound("start");
              }}
            >
              <RotateCcw className="w-4 h-4" /> RESET DEFAULTS
            </Button>
          </motion.section>

          {/* Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[10px] sm:text-xs text-muted-foreground pb-4"
          >
            Settings are saved automatically and apply to all games.
          </motion.p>
        </div>
      </main>
    </div>
  );
}
