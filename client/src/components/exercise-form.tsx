import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Upload, 
  X,
  Settings,
  Tag,
  Image,
  Video,
  FileText,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  instructions: string;
  benefits: string;
  imageUrl: string;
  videoUrl?: string;
  mediaUrl?: string;
  tags: string[];
  variable1?: string;
  variable2?: string;
  variable3?: string;
  isActive: boolean;
}

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ExerciseForm({ exercise, onSave, onCancel, isEditing = false }: ExerciseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Exercise, 'id'>>({
    title: '',
    description: '',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 15,
    instructions: '',
    benefits: '',
    imageUrl: '',
    videoUrl: '',
    mediaUrl: '',
    tags: [],
    variable1: '',
    variable2: '',
    variable3: '',
    isActive: true
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    { value: 'cardio', label: 'Cardio & Endurance' },
    { value: 'strength', label: 'Renforcement Musculaire' },
    { value: 'flexibility', label: 'Flexibilité & Mobilité' },
    { value: 'mindfulness', label: 'Pleine Conscience' },
    { value: 'breathing', label: 'Exercices de Respiration' },
    { value: 'relaxation', label: 'Relaxation & Détente' },
    { value: 'emergency', label: 'Gestion de Crise' }
  ];

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || '',
        description: exercise.description || '',
        category: exercise.category || 'mindfulness',
        difficulty: exercise.difficulty || 'beginner',
        duration: exercise.duration || 15,
        instructions: exercise.instructions || '',
        benefits: exercise.benefits || '',
        imageUrl: exercise.imageUrl || '',
        videoUrl: exercise.videoUrl || '',
        mediaUrl: exercise.mediaUrl || '',
        tags: exercise.tags || [],
        variable1: exercise.variable1 || '',
        variable2: exercise.variable2 || '',
        variable3: exercise.variable3 || '',
        isActive: exercise.isActive !== undefined ? exercise.isActive : true
      });
    }
  }, [exercise]);

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      updateFormData('tags', [...formData.tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "La description est requise",
        variant: "destructive"
      });
      return;
    }

    if (formData.duration <= 0) {
      toast({
        title: "Erreur",
        description: "La durée doit être supérieure à 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      toast({
        title: isEditing ? "Exercice modifié" : "Exercice créé",
        description: `L'exercice "${formData.title}" a été sauvegardé avec succès`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de l'exercice",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio': return '🏃';
      case 'strength': return '💪';
      case 'flexibility': return '🤸';
      case 'mindfulness': return '🧘';
      case 'breathing': return '🌬️';
      case 'relaxation': return '😌';
      case 'emergency': return '🚨';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              {isEditing ? 'Modifier l\'Exercice' : 'Créer un Nouvel Exercice'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Éditer' : 'Aperçu'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            // Mode aperçu
            <div className="space-y-6">
              <div className="text-center">
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{formData.title || 'Titre de l\'exercice'}</h2>
                <p className="text-muted-foreground mb-4">{formData.description || 'Description de l\'exercice'}</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  <Badge className={getDifficultyColor(formData.difficulty)}>
                    {formData.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {getCategoryIcon(formData.category)} {categories.find(c => c.value === formData.category)?.label}
                  </Badge>
                  <Badge variant="outline">
                    {formData.duration} minutes
                  </Badge>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-6">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">
                      {formData.instructions || 'Instructions détaillées...'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bénéfices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">
                      {formData.benefits || 'Bénéfices de l\'exercice...'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(formData.variable1 || formData.variable2 || formData.variable3) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Variables Dynamiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.variable1 && (
                        <div>
                          <span className="font-medium">Variable 1:</span> {formData.variable1}
                        </div>
                      )}
                      {formData.variable2 && (
                        <div>
                          <span className="font-medium">Variable 2:</span> {formData.variable2}
                        </div>
                      )}
                      {formData.variable3 && (
                        <div>
                          <span className="font-medium">Variable 3:</span> {formData.variable3}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Mode édition
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informations de Base</TabsTrigger>
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="media">Médias</TabsTrigger>
                <TabsTrigger value="advanced">Avancé</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="Nom de l'exercice"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {getCategoryIcon(cat.value)} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulté</Label>
                      <Select value={formData.difficulty} onValueChange={(value: any) => updateFormData('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Durée (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="180"
                        value={formData.duration}
                        onChange={(e) => updateFormData('duration', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Description courte et engageante de l'exercice"
                        rows={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div>
                  <Label htmlFor="instructions">Instructions Détaillées *</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => updateFormData('instructions', e.target.value)}
                    placeholder="Instructions étape par étape pour réaliser l'exercice..."
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Bénéfices *</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => updateFormData('benefits', e.target.value)}
                    placeholder="Bénéfices physiques et mentaux de cet exercice..."
                    rows={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="imageUrl">Image Principale</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => updateFormData('imageUrl', e.target.value)}
                        placeholder="URL de l'image (https://...)"
                      />
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={formData.imageUrl} 
                            alt="Aperçu"
                            className="w-full h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="videoUrl">Vidéo YouTube (optionnel)</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => updateFormData('videoUrl', e.target.value)}
                        placeholder="URL YouTube (https://youtube.com/...)"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mediaUrl">Média Supplémentaire</Label>
                      <Input
                        id="mediaUrl"
                        value={formData.mediaUrl}
                        onChange={(e) => updateFormData('mediaUrl', e.target.value)}
                        placeholder="URL d'un média complémentaire"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Image, vidéo ou document supplémentaire pour enrichir l'exercice
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center mb-2">
                        <Upload className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Conseils pour les médias</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Utilisez des images de haute qualité (min 400x200px)</li>
                        <li>• Préférez les vidéos courtes et explicatives</li>
                        <li>• Assurez-vous que les URLs sont accessibles publiquement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Variables Dynamiques
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Utilisez ces variables pour personnaliser l'exercice selon les besoins spécifiques du patient.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="variable1">Variable 1</Label>
                      <Input
                        id="variable1"
                        value={formData.variable1}
                        onChange={(e) => updateFormData('variable1', e.target.value)}
                        placeholder="Ex: Nombre de répétitions, intensité, fréquence..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="variable2">Variable 2</Label>
                      <Input
                        id="variable2"
                        value={formData.variable2}
                        onChange={(e) => updateFormData('variable2', e.target.value)}
                        placeholder="Ex: Durée des intervalles, niveau de résistance..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="variable3">Variable 3</Label>
                      <Input
                        id="variable3"
                        value={formData.variable3}
                        onChange={(e) => updateFormData('variable3', e.target.value)}
                        placeholder="Ex: Matériel spécifique, conditions particulières..."
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Paramètres</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => updateFormData('isActive', e.target.checked)}
                    />
                    <Label htmlFor="isActive">Exercice actif (visible pour les patients)</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Mettre à jour' : 'Créer l\'exercice'}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}