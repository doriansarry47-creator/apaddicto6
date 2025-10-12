import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import type { EducationalContent, ContentCategory } from "@shared/schema";
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
  Share2,
  Download,
  ThumbsUp,
  Calendar
} from "lucide-react";

export default function ContentReader() {
  const { contentId } = useParams<{ contentId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // États pour l'interaction utilisateur
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Récupération du contenu
  const { data: content, isLoading, error } = useQuery<EducationalContent>({
    queryKey: ['educational-content', contentId],
    queryFn: async () => {
      if (!contentId) throw new Error('ID de contenu manquant');
      const response = await apiRequest('GET', `/api/educational-contents/${contentId}`);
      if (!response.ok) throw new Error('Contenu introuvable');
      return response.json();
    },
    enabled: !!contentId,
  });

  // Récupération de la catégorie
  const { data: category } = useQuery<ContentCategory>({
    queryKey: ['content-category', content?.categoryId],
    queryFn: async () => {
      if (!content?.categoryId) return null;
      const response = await apiRequest('GET', `/api/content-categories/${content.categoryId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!content?.categoryId,
  });

  // Mutation pour marquer comme lu automatiquement
  useEffect(() => {
    if (content && contentId) {
      // Marquer la vue
      apiRequest('POST', `/api/educational-contents/${contentId}/view`).catch(console.error);
    }
  }, [content, contentId]);

  // Mutations pour les interactions
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/like`);
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['educational-content', contentId] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/bookmark`);
      return response.json();
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['educational-content', contentId] });
    }
  });

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
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du contenu...</p>
            </div>
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
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Contenu introuvable</h2>
            <p className="text-muted-foreground mb-6">
              Le contenu que vous cherchez n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => navigate('/library')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la bibliothèque
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 max-w-4xl">
        
        {/* Header avec navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Bibliothèque</span>
            <span>/</span>
            {category && <span>{category.name}</span>}
            <span>/</span>
            <span className="font-medium text-foreground">{content.title}</span>
          </div>
        </div>

        {/* Contenu principal */}
        <Card className="mb-6">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                {getTypeIcon(content.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <CardTitle className="text-2xl mb-2 leading-tight">
                      {content.title}
                      {content.isRecommended && (
                        <Star className="inline h-5 w-5 text-yellow-500 ml-2 fill-current" />
                      )}
                    </CardTitle>
                    {content.description && (
                      <p className="text-muted-foreground text-lg">
                        {content.description}
                      </p>
                    )}
                  </div>
                  {content.thumbnailUrl && (
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title}
                      className="w-32 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(content.difficulty)}>
                    {getDifficultyLabel(content.difficulty)}
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
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {content.estimatedReadTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {content.estimatedReadTime} min de lecture
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {content.viewCount || 0} vues
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {content.likeCount || 0} j'aime
                  </div>
                  {content.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(content.publishedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Separator className="mb-6" />
            
            {/* Contenu de l'article */}
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed space-y-4">
                {content.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Ressource supplémentaire */}
            {content.mediaUrl && (
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Ressource supplémentaire</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Accédez à du contenu additionnel pour approfondir vos connaissances.
                </p>
                <Button asChild variant="outline">
                  <a 
                    href={content.mediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Accéder à la ressource
                  </a>
                </Button>
              </div>
            )}

            <Separator className="my-8" />

            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="ml-1">{isLiked ? 'Aimé' : 'J\'aime'}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                  className={isBookmarked ? "text-blue-500" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="ml-1">{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.share?.({ 
                    title: content.title, 
                    text: content.description || content.title,
                    url: window.location.href 
                  })}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="ml-1">Partager</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => completeMutation.mutate()}
                  disabled={isCompleted || completeMutation.isPending}
                  size="sm"
                  className={isCompleted ? "bg-green-600 text-white" : ""}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Terminé
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Marquer comme lu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation vers le contenu suivant */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Contenu terminé !</h3>
                <p className="text-sm text-muted-foreground">
                  Continuez votre parcours d'apprentissage avec d'autres ressources.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/library')}>
                  Bibliothèque
                </Button>
                <Button onClick={() => navigate('/education')}>
                  Espace éducatif
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  );
}