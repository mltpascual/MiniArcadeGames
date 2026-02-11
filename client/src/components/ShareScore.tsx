import { useState, useCallback } from "react";
import { Share2, Twitter, Facebook, Link2, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareScoreProps {
  gameName: string;
  score: number;
  /** Optional extra detail like "Level 5" or "15 moves" */
  extraDetail?: string;
  /** Whether this was a new high score */
  isHighScore?: boolean;
}

/**
 * ShareScore — Social sharing buttons for game-over screens.
 * Shows a share icon that expands into Twitter/X, Facebook, and Copy Link buttons.
 * Uses the neo-retro arcade aesthetic with dark explicit colors.
 */
export default function ShareScore({
  gameName,
  score,
  extraDetail,
  isHighScore = false,
}: ShareScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(gameName, score, extraDetail, isHighScore);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }, [shareText, shareUrl]);

  const handleFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }, [shareText, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, shareUrl]);

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="share-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg
              border border-arcade-indigo/40 bg-arcade-indigo/10
              text-arcade-indigo hover:bg-arcade-indigo/20 hover:border-arcade-indigo/60
              transition-colors font-pixel text-[10px] sm:text-xs"
            aria-label="Share your score"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            SHARE
          </motion.button>
        ) : (
          <motion.div
            key="share-options"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {/* Twitter / X */}
            <button
              onClick={handleTwitter}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                border border-sky-500/40 bg-sky-500/10
                text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/60
                transition-colors"
              aria-label="Share on Twitter"
              title="Share on X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                border border-blue-500/40 bg-blue-500/10
                text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/60
                transition-colors"
              aria-label="Share on Facebook"
              title="Share on Facebook"
            >
              <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                border transition-colors ${
                  copied
                    ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
                    : "border-arcade-mint/40 bg-arcade-mint/10 text-arcade-mint hover:bg-arcade-mint/20 hover:border-arcade-mint/60"
                }`}
              aria-label={copied ? "Copied!" : "Copy share link"}
              title={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Collapse */}
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                border border-white/10 bg-white/5
                text-white/40 hover:bg-white/10 hover:text-white/60
                transition-colors font-pixel text-[10px]"
              aria-label="Close share options"
              title="Close"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Build the share text message */
function buildShareText(
  gameName: string,
  score: number,
  extraDetail?: string,
  isHighScore?: boolean
): string {
  const parts = [
    `🎮 I scored ${score.toLocaleString()} on ${gameName}`,
  ];
  if (extraDetail) parts[0] += ` (${extraDetail})`;
  parts[0] += "!";
  if (isHighScore) parts.push("🏆 New high score!");
  parts.push("Can you beat it? Play now on Pixel Playground!");
  return parts.join(" ");
}

/** Exported for testing */
export { buildShareText };
