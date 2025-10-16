import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Clock, Book, Dumbbell, Heart, Users, FileText, Zap } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'session' | 'content' | 'routine' | 'patient' | 'page';
  url: string;
  category?: string;
  tags?: string[];
  lastAccessed?: Date;
  relevanceScore?: number;
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  hotkey?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
  placeholder = "Rechercher exercices, séances, contenus...",
  hotkey = "Ctrl+K"
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // Navigation personnalisée pour wouter
  const navigate = (path: string) => {
    window.location.href = path;
  };
  const [location] = useLocation();

  // Simuler des données de recherche (en production, utiliser une API)
  const mockData: SearchResult[] = useMemo(() => [
    {
      id: '1',
      title: 'Respiration profonde',
      description: 'Exercice de relaxation par la respiration',
      type: 'exercise',
      url: '/exercises/1',
      category: 'Relaxation',
      tags: ['respiration', 'stress', 'débutant']
    },
    {
      id: '2',
      title: 'Séance cardio débutant',
      description: 'Programme cardio adapté aux débutants',
      type: 'session',
      url: '/sessions/2',
      category: 'Cardio',
      tags: ['cardio', 'débutant', '15min']
    },
    {
      id: '3',
      title: 'Gestion du stress',
      description: 'Guide complet pour gérer le stress au quotidien',
      type: 'content',
      url: '/library/content/3',
      category: 'Psychoéducation',
      tags: ['stress', 'théorie', 'pratique']
    },
    {
      id: '4',
      title: 'Routine anti-craving',
      description: 'Routine d\'urgence pour gérer les envies',
      type: 'routine',
      url: '/emergency/4',
      category: 'Urgence',
      tags: ['craving', 'urgence', 'rapide']
    }
  ], []);

  // Charger les recherches récentes depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement recherches récentes:', e);
      }
    }
  }, []);

  // Sauvegarder les recherches récentes
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fonction de recherche avec debounce
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 200));

      // Algorithme de recherche simple (en production, utiliser Elasticsearch ou similaire)
      const filtered = mockData.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const descMatch = item.description.toLowerCase().includes(searchLower);
        const categoryMatch = item.category?.toLowerCase().includes(searchLower);
        const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        return titleMatch || descMatch || categoryMatch || tagsMatch;
      });

      // Calculer un score de pertinence simple
      const scored = filtered.map(item => ({
        ...item,
        relevanceScore: calculateRelevanceScore(item, searchQuery)
      }));

      // Trier par pertinence
      const sorted = scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      setResults(sorted);
      setLoading(false);
    },
    [mockData]
  );

  // Calculer score de pertinence
  const calculateRelevanceScore = (item: SearchResult, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Titre exact = score max
    if (item.title.toLowerCase() === queryLower) score += 100;
    // Titre commence par = score élevé
    else if (item.title.toLowerCase().startsWith(queryLower)) score += 80;
    // Titre contient = score moyen
    else if (item.title.toLowerCase().includes(queryLower)) score += 60;

    // Bonus pour catégorie
    if (item.category?.toLowerCase().includes(queryLower)) score += 30;

    // Bonus pour tags
    if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 20;

    // Bonus pour type populaire
    if (item.type === 'exercise') score += 10;
    if (item.type === 'session') score += 15;

    return score;
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Raccourci clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Dumbbell className="h-4 w-4" />;
      case 'session': return <Clock className="h-4 w-4" />;
      case 'content': return <Book className="h-4 w-4" />;
      case 'routine': return <Zap className="h-4 w-4" />;
      case 'patient': return <Users className="h-4 w-4" />;
      case 'page': return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      exercise: 'Exercice',
      session: 'Séance',
      content: 'Contenu',
      routine: 'Routine',
      patient: 'Patient',
      page: 'Page'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(query);
    navigate(result.url);
    setOpen(false);
    setQuery('');
  };

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  return (
    <>
      {/* Bouton déclencheur */}
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start text-sm text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">{placeholder}</span>
        <span className="inline-flex lg:hidden">Rechercher...</span>
        <div className="ml-auto flex items-center space-x-1">
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">{hotkey}</span>
          </kbd>
        </div>
      </Button>

      {/* Dialog de recherche */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm">
                Aucun résultat trouvé.
                <p className="text-xs text-muted-foreground mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )}
          </CommandEmpty>

          {/* Recherches récentes */}
          {!query && recentSearches.length > 0 && (
            <CommandGroup heading="Recherches récentes">
              {recentSearches.map((recentQuery, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleRecentSearch(recentQuery)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{recentQuery}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Résultats de recherche */}
          {results.length > 0 && (
            <CommandGroup heading={`${results.length} résultat${results.length > 1 ? 's' : ''}`}>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-start gap-3 p-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{result.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Raccourcis rapides si pas de query */}
          {!query && (
            <CommandGroup heading="Accès rapide">
              <CommandItem onSelect={() => navigate('/exercises')}>
                <Dumbbell className="mr-2 h-4 w-4" />
                <span>Tous les exercices</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/sessions')}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Mes séances</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/library')}>
                <Book className="mr-2 h-4 w-4" />
                <span>Bibliothèque</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/emergency')}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Routines d'urgence</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};