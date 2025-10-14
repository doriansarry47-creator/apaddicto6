import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import type { EducationalContent, ContentCategory } from "@shared/schema";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { 
  BookOpen, 
  Play, 
  Volume2, 
  FileText, 
  Image as ImageIcon,
  Heart,
  Eye,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Download,
  Timer,
  Lightbulb,
  Award,
  ThumbsUp,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentReaderPage() {
  const [, params] = useRoute("/content/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const contentId = params?.id;

  // Récupérer le contenu éducatif
  const { data: content, isLoading: contentLoading, error } = useQuery<EducationalContent>({
    queryKey: ["/api/educational-contents", contentId],
    queryFn: async () => {
      if (!contentId) throw new Error("ID de contenu manquant");
      const response = await apiRequest("GET", `/api/educational-contents/${contentId}`);
      return response.json();
    },
    enabled: !!contentId,
  });

  // Récupérer les catégories pour afficher la catégorie du contenu
  const { data: categories = [] } = useQuery<ContentCategory[]>({
    queryKey: ["/api/content-categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/content-categories");
      return response.json();
    },
  });

  // Mutation pour liker un contenu
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/educational-contents/${contentId}/like`);
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(true);
      toast({
        title: "👍 Contenu liké !",
        description: "Merci pour votre retour positif.",
      });
    },
  });

  // Mutation pour marquer comme favori
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/educational-contents/${contentId}/bookmark`);
      return response.json();
    },
    onSuccess: () => {
      setIsBookmarked(true);
      toast({
        title: "🔖 Ajouté aux favoris !",
        description: "Ce contenu a été sauvegardé dans vos favoris.",
      });
    },
  });

  // Mutation pour marquer comme terminé
  const completeMutation = useMutation({
    mutationFn: async (data: { duration?: number; progress?: number }) => {
      const response = await apiRequest("POST", `/api/educational-contents/${contentId}/complete`, data);
      return response.json();
    },
    onSuccess: () => {
      setIsCompleted(true);
      toast({
        title: "🎉 Lecture terminée !",
        description: "Félicitations ! Vous avez terminé ce contenu éducatif.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-content-interactions"] });
    },
  });

  // Initialisation du temps de lecture
  useEffect(() => {
    if (content && !startTime) {
      setStartTime(new Date());
    }
  }, [content, startTime]);

  // Simulation de progression de lecture basée sur le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = Math.min((scrolled / scrollHeight) * 100, 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Marquer automatiquement comme terminé quand la progression atteint 90%
  useEffect(() => {
    if (readingProgress >= 90 && !isCompleted && startTime) {
      const duration = Math.round((Date.now() - startTime.getTime()) / 1000 / 60); // en minutes
      completeMutation.mutate({ duration, progress: 100 });
    }
  }, [readingProgress, isCompleted, startTime, completeMutation]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'image': return <ImageIcon className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatReadingTime = () => {
    if (!startTime) return "0 min";
    const minutes = Math.round((Date.now() - startTime.getTime()) / 1000 / 60);
    return `${minutes} min`;
  };

  if (contentLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </>
    );
  }

  if (error || !content) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Contenu non trouvé</h2>
            <p className="text-muted-foreground mb-4">Le contenu demandé n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => setLocation("/education")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'éducation
            </Button>
          </div>
        </main>
      </>
    );
  }

  const category = categories.find(c => c.id === content.categoryId);

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 max-w-4xl">
        {/* Fixed Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <Progress value={readingProgress} className="h-1" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/education")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'éducation
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>Temps de lecture : {formatReadingTime()}</span>
          </div>
        </div>

        {/* Content Header */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getTypeIcon(content.type)}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800 leading-tight">
                    {content.title}
                  </CardTitle>
                </div>
                
                {content.description && (
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    {content.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(content.difficulty)}>
                    {content.difficulty === 'easy' ? '🟢 Facile' : 
                     content.difficulty === 'intermediate' ? '🟡 Intermédiaire' : 
                     '🔴 Avancé'}
                  </Badge>
                  
                  {category && (
                    <Badge variant="outline" className="bg-white">
                      📁 {category.name}
                    </Badge>
                  )}
                  
                  {content.estimatedReadTime && (
                    <Badge variant="outline" className="bg-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {content.estimatedReadTime} min
                    </Badge>
                  )}
                  
                  {content.isRecommended && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Star className="h-3 w-3 mr-1" />
                      Recommandé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Mots-clés :</h3>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <MarkdownRenderer 
              content={content.content} 
              className="prose max-w-none"
            />
          </CardContent>
        </Card>

        {/* Media Resource */}
        {content.mediaUrl && (
          <Card className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-teal-800">Ressource complémentaire</h3>
              </div>
              <a 
                href={content.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Accéder à la ressource
              </a>
            </CardContent>
          </Card>
        )}

        {/* Reading Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Progression de lecture
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{Math.round(readingProgress)}%</span>
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </div>
            <Progress value={readingProgress} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {isCompleted ? "✅ Lecture terminée !" : 
               readingProgress < 10 ? "Commencez votre lecture..." :
               readingProgress < 50 ? "Vous progressez bien !" :
               readingProgress < 90 ? "Presque fini !" :
               "Encore quelques lignes !"}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-blue-500" />
              Actions et feedback
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={() => !isLiked && likeMutation.mutate()}
                disabled={isLiked || likeMutation.isPending}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? "👍 Aimé" : "👍 J'aime"}
              </Button>

              <Button
                variant={isBookmarked ? "default" : "outline"}
                onClick={() => !isBookmarked && bookmarkMutation.mutate()}
                disabled={isBookmarked || bookmarkMutation.isPending}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? "🔖 Favoris" : "🔖 Ajouter aux favoris"}
              </Button>

              {!isCompleted && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000 / 60) : 0;
                    completeMutation.mutate({ duration, progress: 100 });
                  }}
                  disabled={completeMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marquer comme terminé
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: content.title,
                      text: content.description,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>

            {isCompleted && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">Félicitations ! Vous avez terminé ce contenu éducatif.</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Temps de lecture : {formatReadingTime()} • Progression : 100%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}