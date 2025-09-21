import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  description?: string;
}

interface ExerciseVariation {
  id?: number;
  exerciseId: number;
  name: string;
  type: 'simplification' | 'complexification';
  difficulty: string;
  instructions: string;
  benefits: string;
  equipment?: string;
  createdAt?: string;
}

interface ExerciseWithVariations extends Exercise {
  variations: ExerciseVariation[];
}

export function ExerciseVariationsManager() {
  const [exercises, setExercises] = useState<ExerciseWithVariations[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseWithVariations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showVariationDialog, setShowVariationDialog] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ExerciseVariation | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const { toast } = useToast();

  const [variationForm, setVariationForm] = useState<Partial<ExerciseVariation>>({
    name: '',
    type: 'simplification',
    difficulty: 'Beginner',
    instructions: '',
    benefits: '',
    equipment: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises-with-variations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load exercises');
      
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exercises and variations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const handleCreateVariation = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingVariation(null);
    setVariationForm({
      exerciseId: exercise.id,
      name: '',
      type: 'simplification',
      difficulty: 'Beginner',
      instructions: '',
      benefits: '',
      equipment: ''
    });
    setShowVariationDialog(true);
  };

  const handleEditVariation = (variation: ExerciseVariation, exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingVariation(variation);
    setVariationForm(variation);
    setShowVariationDialog(true);
  };

  const handleSaveVariation = async () => {
    if (!selectedExercise || !variationForm.name || !variationForm.instructions) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const url = editingVariation 
        ? `/api/exercise-variations/${editingVariation.id}`
        : '/api/exercise-variations';
      
      const method = editingVariation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(variationForm)
      });

      if (!response.ok) throw new Error('Failed to save variation');

      const savedVariation = await response.json();
      
      // Update local state
      setExercises(prev => prev.map(exercise => {
        if (exercise.id === selectedExercise.id) {
          const variations = editingVariation
            ? exercise.variations.map(v => v.id === editingVariation.id ? savedVariation : v)
            : [...exercise.variations, savedVariation];
          
          return { ...exercise, variations };
        }
        return exercise;
      }));

      setShowVariationDialog(false);
      setVariationForm({});
      setEditingVariation(null);
      setSelectedExercise(null);

      toast({
        title: 'Success',
        description: `Variation ${editingVariation ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save variation',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVariation = async (variationId: number, exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this variation?')) return;

    try {
      const response = await fetch(`/api/exercise-variations/${variationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete variation');

      // Update local state
      setExercises(prev => prev.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            variations: exercise.variations.filter(v => v.id !== variationId)
          };
        }
        return exercise;
      }));

      toast({
        title: 'Success',
        description: 'Variation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete variation',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'simplification' ? 
      <TrendingDown className="w-4 h-4 text-blue-600" /> : 
      <TrendingUp className="w-4 h-4 text-purple-600" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'simplification' ? 
      'bg-blue-100 text-blue-800' : 
      'bg-purple-100 text-purple-800';
  };

  const categories = Array.from(new Set(exercises.map(e => e.category)));
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Exercise Variations</h2>
        <p className="text-gray-600 mt-1">
          Manage exercise variations to provide simplifications and complexifications for different fitness levels
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises List */}
      <div className="space-y-4">
        {filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedExercise(
                  expandedExercise === exercise.id ? null : exercise.id
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <Badge variant="outline">{exercise.category}</Badge>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                      {exercise.variations.length > 0 && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          {exercise.variations.length} variation{exercise.variations.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    {exercise.description && (
                      <CardDescription className="mt-1">
                        {exercise.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateVariation(exercise);
                      }}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variation
                    </Button>
                    {expandedExercise === exercise.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedExercise === exercise.id && (
                <CardContent className="pt-0">
                  {exercise.variations.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No variations created yet</p>
                      <Button
                        onClick={() => handleCreateVariation(exercise)}
                        size="sm"
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create First Variation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exercise.variations.map((variation) => (
                        <div
                          key={variation.id}
                          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(variation.type)}
                              <h4 className="font-medium">{variation.name}</h4>
                              <Badge className={getTypeColor(variation.type)}>
                                {variation.type}
                              </Badge>
                              <Badge className={getDifficultyColor(variation.difficulty)}>
                                {variation.difficulty}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditVariation(variation, exercise)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteVariation(variation.id!, exercise.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-2">
                            <div>
                              <span className="font-medium">Instructions:</span>
                              <p className="mt-1">{variation.instructions}</p>
                            </div>
                            <div>
                              <span className="font-medium">Benefits:</span>
                              <p className="mt-1">{variation.benefits}</p>
                            </div>
                            {variation.equipment && (
                              <div>
                                <span className="font-medium">Equipment:</span>
                                <p className="mt-1">{variation.equipment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Variation Dialog */}
      <Dialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVariation ? 'Edit Variation' : 'Create New Variation'}
            </DialogTitle>
            <DialogDescription>
              {selectedExercise && (
                <>Create a variation for <strong>{selectedExercise.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variation-name">Name *</Label>
                <Input
                  id="variation-name"
                  value={variationForm.name || ''}
                  onChange={(e) => setVariationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Wall Push-ups, One-arm Push-ups"
                />
              </div>
              
              <div>
                <Label htmlFor="variation-type">Type *</Label>
                <Select
                  value={variationForm.type}
                  onValueChange={(value: 'simplification' | 'complexification') => 
                    setVariationForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplification">Simplification</SelectItem>
                    <SelectItem value="complexification">Complexification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="variation-difficulty">Difficulty *</Label>
              <Select
                value={variationForm.difficulty}
                onValueChange={(value) => setVariationForm(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variation-instructions">Instructions *</Label>
              <Textarea
                id="variation-instructions"
                value={variationForm.instructions || ''}
                onChange={(e) => setVariationForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Detailed instructions on how to perform this variation..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="variation-benefits">Benefits *</Label>
              <Textarea
                id="variation-benefits"
                value={variationForm.benefits || ''}
                onChange={(e) => setVariationForm(prev => ({ ...prev, benefits: e.target.value }))}
                placeholder="What are the specific benefits of this variation?"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="variation-equipment">Equipment (Optional)</Label>
              <Input
                id="variation-equipment"
                value={variationForm.equipment || ''}
                onChange={(e) => setVariationForm(prev => ({ ...prev, equipment: e.target.value }))}
                placeholder="e.g., Wall, Medicine ball, Resistance band"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVariationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariation}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editingVariation ? 'Update' : 'Create'} Variation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}