import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { EducationalContent, ContentCategory } from "../../../../shared/schema";
import { 
  BookOpen, 
  Play, 
  Volume2, 
  FileText, 
  Image as ImageIcon,
  Search,
  Filter,
  Heart,
  Eye,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  Grid3x3,
  List,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Brain,
  Zap,
  Shield
} from "lucide-react";

interface ContentStats {
  totalContents: number;
  completedContents: number;
  likedContents: number;
  bookmarkedContents: number;
  totalReadTime: number;
  currentStreak: number;
}

interface UserProgress {
  contentId: string;
  isCompleted: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  viewCount: number;
  lastViewedAt?: string;
}

interface ContentCardProps {
  content: EducationalContent;
  isCompleted: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  category?: ContentCategory;
  onLike: () => void;
  onBookmark: () => void;
  onComplete: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getDifficultyColor: (difficulty: string) => string;
}

function ContentCard({ 
  content, 
  isCompleted, 
  isLiked, 
  isBookmarked, 
  category,
  onLike,
  onBookmark,
  onComplete,
  getTypeIcon,
  getDifficultyColor 
}: ContentCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon(content.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">
                {content.title}
                {content.isRecommended && (
                  <Star className="inline h-4 w-4 text-yellow-500 ml-2 fill-current" />
                )}
              </CardTitle>
              {content.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {content.description}
                </p>
              )}
            </div>
          </div>
          {content.thumbnailUrl && (
            <img 
              src={content.thumbnailUrl} 
              alt={content.title}
              className="w-16 h-16 object-cover rounded-lg ml-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métadonnées */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getDifficultyColor(content.difficulty)}>
            {content.difficulty === 'easy' ? 'Facile' : 
             content.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </Badge>
          {category && (
            <Badge variant="outline">{category.name}</Badge>
          )}
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complété
            </Badge>
          )}
        </div>

        {/* Statistiques */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {content.estimatedReadTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {content.estimatedReadTime} min
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {content.viewCount || 0}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {content.likeCount || 0}
          </div>
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Contenu */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="content">
            <AccordionTrigger className="text-left hover:no-underline">
              Lire le contenu
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="prose prose-sm max-w-none">
                {content.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {content.mediaUrl && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Ressource supplémentaire :</p>
                  <a 
                    href={content.mediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Accéder à la ressource →
                  </a>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onBookmark}
              className={isBookmarked ? "text-blue-500" : ""}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isCompleted}
            className={isCompleted ? "bg-green-600 text-white" : ""}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complété
              </>
            ) : (
              "Marquer comme lu"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EducationNew() {
  // États pour la navigation et filtres
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // États pour l'interaction utilisateur
  const [completedContents, setCompletedContents] = useState<string[]>([]);
  const [likedContents, setLikedContents] = useState<string[]>([]);
  const [bookmarkedContents, setBookmarkedContents] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Récupération des catégories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError, refetch: refetchCategories } = useQuery<ContentCategory[]>({
    queryKey: ['content-categories'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/content-categories');
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data.filter(cat => cat.isActive !== false) : [];
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Récupération du contenu éducationnel
  const { data: contents = [], isLoading: isLoadingContents, error, refetch: refetchContents } = useQuery<EducationalContent[]>({
    queryKey: ['educational-contents', selectedCategory, difficultyFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('status', 'published');
        if (selectedCategory && selectedCategory !== "all") params.append('categoryId', selectedCategory);
        if (difficultyFilter && difficultyFilter !== "all") params.append('difficulty', difficultyFilter);
        
        const response = await apiRequest('GET', `/api/educational-contents?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu éducationnel:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
    enabled: true, // Toujours activer, même si pas de catégories
  });

  // Ne pas sélectionner automatiquement une catégorie pour afficher tous les contenus initialement
  // L'utilisateur peut choisir manuellement la catégorie qu'il souhaite explorer

  // Mutations pour les interactions
  const likeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/like`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setLikedContents(prev => 
        prev.includes(contentId) 
          ? prev.filter(id => id !== contentId)
          : [...prev, contentId]
      );
      queryClient.invalidateQueries({ queryKey: ['educational-contents'] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/bookmark`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setBookmarkedContents(prev => 
        prev.includes(contentId) 
          ? prev.filter(id => id !== contentId)
          : [...prev, contentId]
      );
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/complete`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setCompletedContents(prev => [...prev, contentId]);
      queryClient.invalidateQueries({ queryKey: ['educational-contents'] });
    }
  });

  // Fonctions de filtrage et tri améliorées
  const filteredContents = contents
    .filter(content => {
      if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Prioriser les contenus recommandés d'abord, puis appliquer le tri secondaire
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'recommended':
          return (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0);
        case 'shortest':
          return (a.estimatedReadTime || 0) - (b.estimatedReadTime || 0);
        case 'difficulty':
          const difficultyOrder = { easy: 1, intermediate: 2, advanced: 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title, 'fr');
        default:
          // Tri par défaut : recommandés d'abord, puis par ordre de difficulté, puis par titre
          const defaultDifficultyOrder = { easy: 1, intermediate: 2, advanced: 3 };
          const aDiff = defaultDifficultyOrder[a.difficulty] || 0;
          const bDiff = defaultDifficultyOrder[b.difficulty] || 0;
          if (aDiff !== bDiff) return aDiff - bDiff;
          return a.title.localeCompare(b.title, 'fr');
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('addiction') || name.includes('dépendance')) return Brain;
    if (name.includes('relaxation') || name.includes('détente')) return Shield;
    if (name.includes('motivation') || name.includes('énergie')) return Zap;
    if (name.includes('technique') || name.includes('méthode')) return Target;
    return Lightbulb;
  };

  // Statistiques calculées
  const stats: ContentStats = {
    totalContents: contents.length,
    completedContents: completedContents.length,
    likedContents: likedContents.length,
    bookmarkedContents: bookmarkedContents.length,
    totalReadTime: completedContents.reduce((acc, id) => {
      const content = contents.find(c => c.id === id);
      return acc + (content?.estimatedReadTime || 0);
    }, 0),
    currentStreak: 3 // Placeholder - à calculer selon les dates réelles
  };

  if (isLoadingCategories || isLoadingContents) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de votre espace éducatif...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || categoriesError) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <div className="mb-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
              <p className="text-muted-foreground mb-6">
                {categoriesError ? 
                  "Impossible de charger les catégories de contenu. Cela peut indiquer un problème de configuration." :
                  "Impossible de charger le contenu éducatif. Veuillez réessayer."
                }
              </p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
                {(categoriesError || (categories.length === 0 && !isLoadingCategories)) && (
                  <p className="text-sm text-muted-foreground">
                    Si le problème persiste, contactez l'administrateur.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* En-tête de la page */}
        <section className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                  <BookOpen className="h-8 w-8" />
                </div>
                Espace Éducatif
              </h1>
              <p className="text-muted-foreground">
                Explorez des ressources éducatives pour enrichir votre parcours de récupération
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Actualiser le contenu lors du changement d'onglet
          if (value === "explore" || value === "dashboard") {
            refetchContents();
            refetchCategories();
          }
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Favoris
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Complétés
            </TabsTrigger>
          </TabsList>

          {/* Onglet Tableau de Bord */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Statistiques de progression */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Votre Progression
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Contenus Complétés</p>
                        <p className="text-3xl font-bold text-blue-700">{stats.completedContents}</p>
                        <p className="text-xs text-blue-500">sur {stats.totalContents} disponibles</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Temps de Lecture</p>
                        <p className="text-3xl font-bold text-green-700">{stats.totalReadTime}</p>
                        <p className="text-xs text-green-500">minutes au total</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Contenus Aimés</p>
                        <p className="text-3xl font-bold text-purple-700">{stats.likedContents}</p>
                        <p className="text-xs text-purple-500">évaluations positives</p>
                      </div>
                      <Heart className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Série Actuelle</p>
                        <p className="text-3xl font-bold text-orange-700">{stats.currentStreak}</p>
                        <p className="text-xs text-orange-500">jours consécutifs</p>
                      </div>
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progression par catégorie */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progression par Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.sort((a, b) => a.order - b.order).map((category) => {
                      const categoryContents = contents.filter(c => c.categoryId === category.id);
                      const completed = categoryContents.filter(c => completedContents.includes(c.id)).length;
                      const progress = categoryContents.length > 0 ? (completed / categoryContents.length) * 100 : 0;
                      const IconComponent = getCategoryIcon(category.name);
                      
                      return (
                        <div key={category.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{category.name}</h4>
                              <span className="text-sm text-muted-foreground">
                                {completed}/{categoryContents.length}
                              </span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-primary">
                            {Math.round(progress)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contenus recommandés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Recommandés pour Vous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contents
                      .filter(content => content.isRecommended && !completedContents.includes(content.id))
                      .slice(0, 4)
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{content.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              {content.estimatedReadTime} min • {categories.find(c => c.id === content.categoryId)?.name}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setActiveTab("explore")}>
                            Lire
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Onglet Explorer */}
          <TabsContent value="explore" className="space-y-8">
            {/* Filtres et recherche */}
            <section>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un contenu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les niveaux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        <SelectItem value="easy">Facile</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Trier par..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Ordre recommandé</SelectItem>
                        <SelectItem value="difficulty">Par difficulté</SelectItem>
                        <SelectItem value="alphabetical">Alphabétique</SelectItem>
                        <SelectItem value="newest">Plus récents</SelectItem>
                        <SelectItem value="popular">Plus populaires</SelectItem>
                        <SelectItem value="shortest">Plus courts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Catégories rapides avec progression */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {categories.sort((a, b) => a.order - b.order).map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  const categoryContents = contents.filter(c => c.categoryId === category.id);
                  const completedInCategory = categoryContents.filter(c => completedContents.includes(c.id)).length;
                  const progressPercentage = categoryContents.length > 0 ? (completedInCategory / categoryContents.length) * 100 : 0;
                  
                  return (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCategory === category.id ? 'border-primary shadow-md' : 'border-border'
                      }`}
                      onClick={() => setSelectedCategory(category.id === selectedCategory ? "all" : category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{category.name}</h4>
                            <p className="text-xs text-muted-foreground">{categoryContents.length} contenus</p>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Badges d'information */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {completedInCategory}/{categoryContents.length}
                          </Badge>
                          {categoryContents.some(c => c.isRecommended) && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Recommandé
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Liste des contenus avec organisation améliorée */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">
                    {selectedCategory && selectedCategory !== "all"
                      ? `${categories.find(c => c.id === selectedCategory)?.name}`
                      : `Tous les contenus`
                    }
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredContents.length} contenu{filteredContents.length !== 1 ? 's' : ''} disponible{filteredContents.length !== 1 ? 's' : ''}
                    {selectedCategory && selectedCategory !== "all" && (
                      <span className="ml-2">
                        • {categories.find(c => c.id === selectedCategory)?.description}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Résumé rapide des niveaux disponibles */}
                {filteredContents.length > 0 && (
                  <div className="flex gap-2">
                    {['easy', 'intermediate', 'advanced'].map(level => {
                      const count = filteredContents.filter(c => c.difficulty === level).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={level} className={getDifficultyColor(level)} variant="outline">
                          {level === 'easy' ? 'Facile' : level === 'intermediate' ? 'Inter.' : 'Avancé'} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {filteredContents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">Aucun contenu trouvé</h3>
                    <p className="text-muted-foreground mb-6">
                      {contents.length === 0 
                        ? "Aucun contenu éducatif n'a encore été créé par les administrateurs."
                        : "Essayez de modifier vos filtres pour voir plus de contenus."
                      }
                    </p>
                    {selectedCategory && selectedCategory !== "all" && (
                      <Button onClick={() => setSelectedCategory("all")}>
                        Voir tous les contenus
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Organisation par niveau de difficulté quand une catégorie spécifique est sélectionnée */}
                  {selectedCategory !== "all" && selectedCategory ? (
                    ['easy', 'intermediate', 'advanced'].map(difficulty => {
                      const contentsForDifficulty = filteredContents.filter(c => c.difficulty === difficulty);
                      if (contentsForDifficulty.length === 0) return null;
                      
                      return (
                        <div key={difficulty} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge className={getDifficultyColor(difficulty)}>
                              {difficulty === 'easy' ? 'Niveau Facile' : 
                               difficulty === 'intermediate' ? 'Niveau Intermédiaire' : 'Niveau Avancé'}
                            </Badge>
                            <div className="h-px bg-border flex-1" />
                            <span className="text-sm text-muted-foreground">
                              {contentsForDifficulty.length} contenu{contentsForDifficulty.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className={viewMode === "grid" 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                            : "space-y-4"
                          }>
                            {contentsForDifficulty.map((content) => {
                              const isCompleted = completedContents.includes(content.id);
                              const isLiked = likedContents.includes(content.id);
                              const isBookmarked = bookmarkedContents.includes(content.id);
                              const category = categories.find(c => c.id === content.categoryId);

                              return (
                                <ContentCard 
                                  key={content.id} 
                                  content={content} 
                                  isCompleted={isCompleted}
                                  isLiked={isLiked} 
                                  isBookmarked={isBookmarked}
                                  category={category}
                                  onLike={() => likeMutation.mutate(content.id)}
                                  onBookmark={() => bookmarkMutation.mutate(content.id)}
                                  onComplete={() => completeMutation.mutate(content.id)}
                                  getTypeIcon={getTypeIcon}
                                  getDifficultyColor={getDifficultyColor}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Vue globale sans regroupement par difficulté */
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                      : "space-y-4"
                    }>
                      {filteredContents.map((content) => {
                        const isCompleted = completedContents.includes(content.id);
                        const isLiked = likedContents.includes(content.id);
                        const isBookmarked = bookmarkedContents.includes(content.id);
                        const category = categories.find(c => c.id === content.categoryId);

                        return (
                          <ContentCard 
                            key={content.id} 
                            content={content} 
                            isCompleted={isCompleted}
                            isLiked={isLiked} 
                            isBookmarked={isBookmarked}
                            category={category}
                            onLike={() => likeMutation.mutate(content.id)}
                            onBookmark={() => bookmarkMutation.mutate(content.id)}
                            onComplete={() => completeMutation.mutate(content.id)}
                            getTypeIcon={getTypeIcon}
                            getDifficultyColor={getDifficultyColor}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Onglet Favoris */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Vos Contenus Favoris
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookmarkedContents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun contenu ajouté aux favoris.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("explore")}
                    >
                      Explorer les contenus
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contents
                      .filter(content => bookmarkedContents.includes(content.id))
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{content.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              {content.estimatedReadTime} min
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setActiveTab("explore")}>
                            Lire
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Complétés */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Contenus Complétés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedContents.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun contenu complété pour le moment.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("explore")}
                    >
                      Commencer à apprendre
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contents
                      .filter(content => completedContents.includes(content.id))
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <div className="flex-1">
                            <h5 className="font-medium">{content.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              Complété • {content.estimatedReadTime} min de lecture
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Terminé</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ressources rapides d'urgence */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4 flex items-center gap-2 text-red-700">
                <Shield className="h-6 w-6" />
                Ressources d'Urgence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">En Cas de Craving Intense</h4>
                  <p className="text-sm text-red-700/80">
                    Rappelez-vous : les cravings sont temporaires et diminuent naturellement.
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-orange-600">Technique STOP</h4>
                  <p className="text-sm text-orange-700/80">
                    Stop, Take a breath, Observe, Proceed mindfully.
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">Aide Professionnelle</h4>
                  <p className="text-sm text-red-700/80">
                    En cas de détresse, contactez immédiatement un professionnel de santé.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}