import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPsychoEducationContentSchema } from "../../../../shared/schema";
import type { PsychoEducationContent, InsertPsychoEducationContent, EducationalContent, InsertEducationalContent, QuickResource, InsertQuickResource } from "../../../../shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Clock, BookOpen, Video, Headphones, Gamepad2, Zap, Pin, Settings, Filter } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type FormData = Omit<InsertEducationalContent, 'authorId' | 'publishedAt'>;

// Catégories prédéfinies pour le contenu éducatif
const EDUCATION_CATEGORIES = [
  { value: "addiction", label: "Addiction et Dépendance" },
  { value: "motivation", label: "Motivation et Objectifs" },
  { value: "coping", label: "Stratégies d'Adaptation" },
  { value: "relapse_prevention", label: "Prévention des Rechutes" },
  { value: "stress_management", label: "Gestion du Stress" },
  { value: "emotional_regulation", label: "Régulation Émotionnelle" },
  { value: "mindfulness", label: "Pleine Conscience" },
  { value: "cognitive_therapy", label: "Thérapie Cognitive" },
  { value: "social_support", label: "Soutien Social" },
  { value: "lifestyle", label: "Mode de Vie Sain" },
];

// Types de contenu
const CONTENT_TYPES = [
  { value: "text", label: "Texte" },
  { value: "video", label: "Vidéo" },
  { value: "audio", label: "Audio" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
];

// Niveaux de difficulté
const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Facile" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function ManageContent() {
  const { toast: showToast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Utiliser les nouveaux contenus éducatifs plutôt que l'ancienne table psycho-education
  const { data: content, isLoading, refetch } = useQuery<EducationalContent[]>({
    queryKey: ["admin", "educational-contents"],
    queryFn: async () => apiRequest("GET", "/api/educational-contents").then(res => res.json()),
    initialData: [],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
  });

  const mutation = useMutation({
    mutationFn: async (newContent: InsertEducationalContent) => {
      // Si une image est sélectionnée, l'uploader d'abord
      let thumbnailUrl = newContent.thumbnailUrl;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        try {
          const uploadResponse = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            thumbnailUrl = uploadResult.url;
          }
        } catch (error) {
          console.warn('Image upload failed, proceeding without image');
        }
      }
      
      return apiRequest("POST", "/api/educational-contents", { ...newContent, thumbnailUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "educational-contents"] });
      showToast({ title: "Succès", description: "Contenu créé avec succès." });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error) => {
      showToast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ contentId, data }: { contentId: string, data: Partial<InsertEducationalContent> }) => {
      return apiRequest("PUT", `/api/educational-contents/${contentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "educational-contents"] });
      showToast({ title: "Succès", description: "Contenu mis à jour avec succès." });
    },
    onError: (error) => {
      showToast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (contentId: string) => apiRequest("DELETE", `/api/educational-contents/${contentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "educational-contents"] });
      showToast({ title: "Succès", description: "Contenu supprimé avec succès." });
    },
    onError: (error) => {
      showToast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredContent = content?.filter(item => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesCategory && matchesType;
  }) || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    // Nous devons créer un schéma personnalisé car nous n'incluons pas authorId et publishedAt
    // resolver: zodResolver(insertEducationalContentSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion du Contenu Psycho-Éducationnel</h1>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Contenu Éducatif</span>
          </TabsTrigger>
          <TabsTrigger value="quick-resources" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Ressources Rapides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion du Contenu</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
                <span>Actualiser</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nouveau Contenu</span>
              </Button>
            </div>
          </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-filter">Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {EDUCATION_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type de contenu</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{filteredContent.length}</div>
            <div className="text-sm text-muted-foreground">Contenus affichés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {content?.filter(c => c.type === 'text').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Textes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {content?.filter(c => c.type === 'video').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Vidéos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {content?.filter(c => c.type === 'pdf').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">PDFs</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de création */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Créer du Contenu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" {...register("title")} placeholder="Titre du contenu" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="categoryId">Catégorie</Label>
                  <Select onValueChange={(value) => setValue("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <Label htmlFor="type">Type de contenu</Label>
                  <Select onValueChange={(value) => setValue("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select onValueChange={(value) => setValue("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
                </div>

                <div>
                  <Label htmlFor="estimatedReadTime">Temps de lecture estimé (minutes)</Label>
                  <Input 
                    id="estimatedReadTime" 
                    type="number" 
                    {...register("estimatedReadTime", { valueAsNumber: true })} 
                    placeholder="10"
                  />
                  {errors.estimatedReadTime && <p className="text-red-500 text-xs mt-1">{errors.estimatedReadTime.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Textarea 
                    id="description" 
                    {...register("description")} 
                    placeholder="Description courte du contenu..."
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div>
                  <Label htmlFor="content">Contenu (Markdown)</Label>
                  <Textarea 
                    id="content" 
                    {...register("content")} 
                    placeholder="Rédigez votre contenu en Markdown..."
                    rows={8}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>

                <div>
                  <Label htmlFor="mediaUrl">URL Média (optionnel)</Label>
                  <Input 
                    id="mediaUrl" 
                    {...register("mediaUrl")} 
                    placeholder="https://example.com/media.mp4"
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnailUrl">URL Miniature (optionnel)</Label>
                  <Input 
                    id="thumbnailUrl" 
                    {...register("thumbnailUrl")} 
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select onValueChange={(value) => setValue("status", value)} defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue placeholder="Statut du contenu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecommended"
                    {...register("isRecommended")}
                    className="rounded"
                  />
                  <Label htmlFor="isRecommended">Contenu recommandé</Label>
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? "Création..." : "Créer le Contenu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Liste des contenus */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contenus Existants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement des contenus...</p>
              ) : (
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <Badge variant="outline">
                              {EDUCATION_CATEGORIES.find(c => c.value === (item as any).categoryId || (item as any).category)?.label || (item as any).category || 'Sans catégorie'}
                            </Badge>
                            <Badge variant="secondary">
                              {CONTENT_TYPES.find(t => t.value === item.type)?.label || item.type}
                            </Badge>
                            <Badge variant={
                              item.difficulty === 'easy' ? 'default' :
                              item.difficulty === 'intermediate' ? 'secondary' :
                              'destructive'
                            }>
                              {DIFFICULTY_LEVELS.find(d => d.value === item.difficulty)?.label || item.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{item.estimatedReadTime} min</span>
                            </div>
                            {item.type === 'video' && (
                              <div className="flex items-center space-x-1">
                                <Video className="h-4 w-4" />
                                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir la vidéo</a>
                              </div>
                            )}
                            {item.type === 'audio' && (
                              <div className="flex items-center space-x-1">
                                <Headphones className="h-4 w-4" />
                                <a href={item.audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Écouter l'audio</a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Modifier le contenu</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Cela modifiera
                                  définitivement le contenu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <form
                                onSubmit={handleSubmit((data) => {
                                  // Logic for updating content
                                  console.log("Update data:", data);
                                })}
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="edit-title">Titre</Label>
                                  <Input
                                    id="edit-title"
                                    defaultValue={item.title}
                                    {...register("title")}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Catégorie</Label>
                                  <Select
                                    defaultValue={(item as any).categoryId || (item as any).category}
                                    onValueChange={(value) => setValue("categoryId", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {EDUCATION_CATEGORIES.map((category) => (
                                        <SelectItem
                                          key={category.value}
                                          value={category.value}
                                        >
                                          {category.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-type">Type de contenu</Label>
                                  <Select
                                    defaultValue={item.type}
                                    onValueChange={(value) => setValue("type", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CONTENT_TYPES.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-difficulty">Difficulté</Label>
                                  <Select
                                    defaultValue={item.difficulty}
                                    onValueChange={(value) => setValue("difficulty", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DIFFICULTY_LEVELS.map((level) => (
                                        <SelectItem
                                          key={level.value}
                                          value={level.value}
                                        >
                                          {level.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-estimatedReadTime">Temps de lecture estimé (minutes)</Label>
                                  <Input
                                    id="edit-estimatedReadTime"
                                    type="number"
                                    defaultValue={item.estimatedReadTime}
                                    {...register("estimatedReadTime", { valueAsNumber: true })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-content">Contenu (Markdown)</Label>
                                  <Textarea
                                    id="edit-content"
                                    defaultValue={item.content}
                                    {...register("content")}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-mediaUrl">URL Média (optionnel)</Label>
                                  <Input
                                    id="edit-mediaUrl"
                                    defaultValue={(item as any).mediaUrl}
                                    {...register("mediaUrl")}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-thumbnailUrl">URL Miniature (optionnel)</Label>
                                  <Input
                                    id="edit-thumbnailUrl"
                                    defaultValue={(item as any).thumbnailUrl}
                                    {...register("thumbnailUrl")}
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <Button type="submit">Sauvegarder</Button>
                                </AlertDialogFooter>
                              </form>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Cela supprimera
                                  définitivement ce contenu de nos serveurs.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteContentMutation.mutate(item.id)}
                                >
                                  Continuer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </TabsContent>

      {/* Onglet routines d'urgence */}
      <TabsContent value="quick-resources" className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Gestion des Ressources Rapides</h2>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouvelle Ressource</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ressources Rapides Existantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fonctionnalité à venir...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
  )
}


