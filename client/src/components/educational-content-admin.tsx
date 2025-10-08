import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Video, 
  Headphones, 
  FileText, 
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Bookmark,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Calendar,
  Clock,
  Tag,
  Folder,
  Settings,
  Download,
  Upload,
  Link,
  Youtube,
  ExternalLink
} from "lucide-react";

interface EducationalContent {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'video' | 'audio' | 'pdf' | 'image';
  categoryId?: string;
  tags: string[];
  mediaUrl?: string;
  mediaType?: string;
  content: string;
  difficulty: 'easy' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  status: 'draft' | 'published' | 'archived';
  isRecommended: boolean;
  viewCount: number;
  likeCount: number;
  thumbnailUrl?: string;
  authorId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

interface ContentTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  usageCount: number;
}

export default function EducationalContentAdmin() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<EducationalContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for creating/editing content
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "text" as EducationalContent['type'],
    categoryId: "",
    tags: [] as string[],
    mediaUrl: "",
    mediaType: "external_link" as string,
    content: "",
    difficulty: "easy" as EducationalContent['difficulty'],
    estimatedReadTime: "",
    status: "draft" as EducationalContent['status'],
    isRecommended: false,
    thumbnailUrl: ""
  });

  // Category and Tag form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "blue",
    icon: ""
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    description: ""
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contentsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/educational-contents', { credentials: 'include' }),
        fetch('/api/content-categories', { credentials: 'include' }),
        fetch('/api/content-tags', { credentials: 'include' })
      ]);

      if (contentsRes.ok) {
        const contentsData = await contentsRes.json();
        setContents(contentsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contentData = {
        ...form,
        estimatedReadTime: form.estimatedReadTime ? parseInt(form.estimatedReadTime) : null
      };

      const url = editingContent 
        ? `/api/educational-contents/${editingContent.id}`
        : '/api/educational-contents';
      
      const method = editingContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contentData)
      });

      if (response.ok) {
        await loadData();
        resetForm();
        alert(editingContent ? 'Contenu mis à jour avec succès!' : 'Contenu créé avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const handleEdit = (content: EducationalContent) => {
    setEditingContent(content);
    setForm({
      title: content.title,
      description: content.description || "",
      type: content.type,
      categoryId: content.categoryId || "",
      tags: content.tags || [],
      mediaUrl: content.mediaUrl || "",
      mediaType: content.mediaType || "",
      content: content.content,
      difficulty: content.difficulty,
      estimatedReadTime: content.estimatedReadTime?.toString() || "",
      status: content.status,
      isRecommended: content.isRecommended,
      thumbnailUrl: content.thumbnailUrl || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

    try {
      const response = await fetch(`/api/educational-contents/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadData();
        alert('Contenu supprimé avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "text",
      categoryId: "",
      tags: [],
      mediaUrl: "",
      mediaType: "external_link",
      content: "",
      difficulty: "easy",
      estimatedReadTime: "",
      status: "draft",
      isRecommended: false,
      thumbnailUrl: ""
    });
    setEditingContent(null);
    setShowForm(false);
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      const response = await fetch('/api/content-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setCategoryForm({ name: "", description: "", color: "blue", icon: "" });
        await loadData();
        alert('Catégorie créée avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`/api/content-categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadData();
        alert('Catégorie supprimée avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  // Tag management functions
  const handleCreateTag = async () => {
    if (!tagForm.name.trim()) return;

    try {
      const response = await fetch('/api/content-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tagForm)
      });

      if (response.ok) {
        setTagForm({ name: "", description: "" });
        await loadData();
        alert('Tag créé avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Erreur lors de la création du tag');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter contents based on search and filters
  const filteredContents = contents.filter(content => {
    if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !content.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType && filterType !== "all" && content.type !== filterType) return false;
    if (filterCategory && filterCategory !== "all" && content.categoryId !== filterCategory) return false;
    if (filterStatus && filterStatus !== "all" && content.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Contenus Éducatifs</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Contenu
        </Button>
      </div>

      <Tabs defaultValue="contents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contents">Contenus ({contents.length})</TabsTrigger>
          <TabsTrigger value="categories">Catégories ({categories.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contents">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Card key={content.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(content.type)}
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                        {content.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {content.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {content.isRecommended && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusBadgeColor(content.status)}>
                        {content.status}
                      </Badge>
                      <Badge className={getDifficultyColor(content.difficulty)}>
                        {content.difficulty}
                      </Badge>
                      {content.categoryId && (
                        <Badge variant="outline">
                          {categories.find(c => c.id === content.categoryId)?.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {content.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {content.likeCount}
                      </div>
                      {content.estimatedReadTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {content.estimatedReadTime}min
                        </div>
                      )}
                    </div>

                    {content.tags.length > 0 && (
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

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-xs text-gray-400">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(content)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(content.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun contenu trouvé</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-6">
            {/* New Category Form */}
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input 
                    placeholder="Nom de la catégorie" 
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Description" 
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                  <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm({...categoryForm, color: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Bleu</SelectItem>
                      <SelectItem value="green">Vert</SelectItem>
                      <SelectItem value="red">Rouge</SelectItem>
                      <SelectItem value="purple">Violet</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="yellow">Jaune</SelectItem>
                      <SelectItem value="pink">Rose</SelectItem>
                      <SelectItem value="gray">Gris</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateCategory} disabled={!categoryForm.name.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`bg-${category.color}-100 text-${category.color}-800`}>
                        {category.color}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Ordre: {category.order}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {categories.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune catégorie créée</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tags">
          <div className="space-y-6">
            {/* New Tag Form */}
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    placeholder="Nom du tag" 
                    value={tagForm.name}
                    onChange={(e) => setTagForm({...tagForm, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Description (optionnelle)" 
                    value={tagForm.description}
                    onChange={(e) => setTagForm({...tagForm, description: e.target.value})}
                  />
                  <Button onClick={handleCreateTag} disabled={!tagForm.name.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags List */}
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="group relative bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                    <span className="text-xs text-gray-500">({tag.usageCount})</span>
                  </div>
                  {tag.description && (
                    <p className="text-xs text-gray-600 mb-2">{tag.description}</p>
                  )}
                  <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                      <Edit className="h-2 w-2" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0 hover:bg-red-50">
                      <Trash2 className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {tags.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun tag créé</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <Card className="w-full max-h-[calc(100vh-4rem)] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white border-b z-10">
                <CardTitle>
                  {editingContent ? 'Modifier le contenu' : 'Nouveau contenu éducatif'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      placeholder="Titre du contenu"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type de contenu *</Label>
                    <Select value={form.type} onValueChange={(value) => setForm({...form, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texte</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Description courte du contenu"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Select value={form.difficulty} onValueChange={(value) => setForm({...form, difficulty: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Facile</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Catégorie</Label>
                    <Select value={form.categoryId} onValueChange={(value) => setForm({...form, categoryId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedReadTime">Temps de lecture (min)</Label>
                    <Input
                      id="estimatedReadTime"
                      type="number"
                      value={form.estimatedReadTime}
                      onChange={(e) => setForm({...form, estimatedReadTime: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mediaUrl">URL du média</Label>
                    <Input
                      id="mediaUrl"
                      value={form.mediaUrl}
                      onChange={(e) => setForm({...form, mediaUrl: e.target.value})}
                      placeholder="https://example.com/media.mp4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mediaType">Type de média</Label>
                    <Select value={form.mediaType} onValueChange={(value) => setForm({...form, mediaType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de média" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="external_link">Lien externe</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="upload">Fichier uploadé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="thumbnailUrl">URL de la miniature</Label>
                    <Input
                      id="thumbnailUrl"
                      value={form.thumbnailUrl}
                      onChange={(e) => setForm({...form, thumbnailUrl: e.target.value})}
                      placeholder="https://example.com/thumb.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={form.tags.join(', ')}
                    onChange={(e) => {
                      const tagList = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setForm({...form, tags: tagList});
                    }}
                    placeholder="addiction, motivation, relaxation"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tags disponibles: {tags.slice(0, 5).map(tag => tag.name).join(', ')}
                    {tags.length > 5 && ` et ${tags.length - 5} autres...`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    placeholder="Contenu détaillé (markdown supporté)"
                    rows={10}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({...form, status: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isRecommended"
                      checked={form.isRecommended}
                      onCheckedChange={(checked) => setForm({...form, isRecommended: checked})}
                    />
                    <Label htmlFor="isRecommended">Contenu recommandé</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingContent ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}