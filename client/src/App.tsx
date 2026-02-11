import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameSettingsProvider } from "./contexts/GameSettingsContext";
import Home from "./pages/Home";
import SnakeGame from "./pages/SnakeGame";
import FlappyBirdGame from "./pages/FlappyBirdGame";
import DinoGame from "./pages/DinoGame";
import TetrisGame from "./pages/TetrisGame";
import PongGame from "./pages/PongGame";
import SpaceInvadersGame from "./pages/SpaceInvadersGame";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import MinesweeperGame from "./pages/MinesweeperGame";
import BreakoutGame from "./pages/BreakoutGame";
import Game2048 from "./pages/Game2048";
import MemoryMatchGame from "./pages/MemoryMatchGame";
import WhackAMoleGame from "./pages/WhackAMoleGame";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/snake"} component={SnakeGame} />
      <Route path={"/flappy-bird"} component={FlappyBirdGame} />
      <Route path={"/dino-jump"} component={DinoGame} />
      <Route path={"/tetris"} component={TetrisGame} />
      <Route path={"/pong"} component={PongGame} />
      <Route path={"/space-invaders"} component={SpaceInvadersGame} />
      <Route path={"/minesweeper"} component={MinesweeperGame} />
      <Route path={"/breakout"} component={BreakoutGame} />
      <Route path={"/2048"} component={Game2048} />
      <Route path={"/memory-match"} component={MemoryMatchGame} />
      <Route path={"/whack-a-mole"} component={WhackAMoleGame} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <GameSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </GameSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
