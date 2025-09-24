import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Monitor, Settings, Heart } from "lucide-react";
import easterEggImage from "@/assets/easter-egg-hearts.png";

export function ThemeSettingsMenu() {
  const { theme, setTheme } = useTheme();
  const [darkModeClickCount, setDarkModeClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset click counter after 3 seconds of no clicks
  useEffect(() => {
    if (darkModeClickCount > 0) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setDarkModeClickCount(0);
      }, 3000);
    }

    return () => {
      clearTimeout(resetTimeoutRef.current);
    };
  }, [darkModeClickCount]);

  // Show easter egg after 10 clicks
  useEffect(() => {
    if (darkModeClickCount >= 10) {
      setShowEasterEgg(true);
      setDarkModeClickCount(0);
    }
  }, [darkModeClickCount]);

  const handleDarkModeClick = () => {
    setTheme("dark");
    setDarkModeClickCount(prev => prev + 1);
  };

  const handleCloseEasterEgg = () => {
    setShowEasterEgg(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Mode Sombre";
      case "light":
        return "Mode Clair";
      default:
        return "Système";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            data-testid="button-toolbox"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Paramètres</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Apparence
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Sun className="h-4 w-4" />
            <span>Mode Clair</span>
            {theme === "light" && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleDarkModeClick}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Moon className="h-4 w-4" />
            <span>Mode Sombre</span>
            {theme === "dark" && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Monitor className="h-4 w-4" />
            <span>Système</span>
            {theme === "system" && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Thème actuel : {getThemeLabel()}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Easter Egg Dialog */}
      <Dialog open={showEasterEgg} onOpenChange={setShowEasterEgg}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Heart className="h-5 w-5 text-red-500 animate-pulse" />
              Surprise ! 
              <Heart className="h-5 w-5 text-red-500 animate-pulse" />
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={easterEggImage} 
                alt="Easter Egg" 
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: "300px" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Félicitations ! Vous avez découvert notre easter egg ! 🎉
            </p>
            <p className="text-xs text-muted-foreground italic">
              10 clics sur "Mode Sombre" - vous êtes déterminé(e) ! 😄
            </p>
            <div className="flex justify-center pt-4">
              <Button onClick={handleCloseEasterEgg} className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Merci !
                <Heart className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}