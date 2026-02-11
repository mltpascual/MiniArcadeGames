import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SnakeGame from "./pages/SnakeGame";
import FlappyBirdGame from "./pages/FlappyBirdGame";
import DinoGame from "./pages/DinoGame";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/snake"} component={SnakeGame} />
      <Route path={"/flappy-bird"} component={FlappyBirdGame} />
      <Route path={"/dino-jump"} component={DinoGame} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
