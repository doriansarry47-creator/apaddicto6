import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest } from "@/lib/queryClient";
import type { EducationalContent, PsychoEducationContent as APIPsychoEducationContent } from "../../../../shared/schema";

interface EducationModule {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    sections: {
      title: string;
      content: string;
      keyPoints?: string[];
    }[];
  };
  // Nouveaux champs pour le contenu enrichi
  thumbnailUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  tags?: string[];
  isRecommended?: boolean;
  viewCount?: number;
  likeCount?: number;
}

// Interface pour les catégories de contenu
interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

// Fonction pour convertir le contenu API en format frontend
const convertAPIContentToFrontend = (apiContent: APIPsychoEducationContent, categories: ContentCategory[]): EducationModule => {
  // Parse le contenu markdown pour extraire les sections
  const sections = parseContentSections(apiContent.content);
  
  return {
    id: apiContent.id,
    title: apiContent.title,
    description: apiContent.content.substring(0, 200) + '...', // Première partie comme description
    categoryId: undefined,
    categoryName: apiContent.category,
    duration: apiContent.estimatedReadTime || 10,
    difficulty: (apiContent.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    content: {
      sections: sections
    }
  };
};

// Fonction pour parser le contenu markdown et extraire les sections
function parseContentSections(content: string): { title: string; content: string; keyPoints?: string[] }[] {
  const sections: { title: string; content: string; keyPoints?: string[] }[] = [];
  const lines = content.split('\n');
  
  let currentSection: { title: string; content: string; keyPoints?: string[] } | null = null;
  let inKeyPoints = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Détection des titres de section (## Titre)
    if (trimmedLine.startsWith('## ')) {
      // Sauvegarder la section précédente
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Créer une nouvelle section
      currentSection = {
        title: trimmedLine.substring(3),
        content: '',
        keyPoints: []
      };
      inKeyPoints = false;
    }
    // Détection des listes à puces (points clés)
    else if (trimmedLine.startsWith('- ') && currentSection) {
      if (!currentSection.keyPoints) {
        currentSection.keyPoints = [];
      }
      currentSection.keyPoints.push(trimmedLine.substring(2));
      inKeyPoints = true;
    }
    // Contenu normal
    else if (trimmedLine && currentSection && !inKeyPoints) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
    // Ligne vide réinitialise les points clés
    else if (!trimmedLine) {
      inKeyPoints = false;
    }
  }
  
  // Ajouter la dernière section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // Si aucune section n'a été trouvée, créer une section par défaut
  if (sections.length === 0) {
    sections.push({
      title: 'Contenu',
      content: content
    });
  }
  
  return sections;
}

// Données statiques de fallback en cas de problème avec l'API
const fallbackEducationModules: EducationModule[] = [
  {
    id: 'addiction-cycle',
    title: 'Comprendre le Cycle de l\'Addiction',
    description: 'Découvrez comment fonctionnent les mécanismes de l\'addiction et le rôle des cravings.',
    category: 'addiction',
    duration: 10,
    difficulty: 'beginner',
    content: {
      sections: [
        {
          title: 'Le Cerveau et l\'Addiction',
          content: 'L\'addiction modifie les circuits de récompense du cerveau, notamment le système dopaminergique. Ces changements expliquent pourquoi les cravings peuvent être si intenses et difficiles à résister.',
          keyPoints: [
            'La dopamine crée un sentiment de plaisir et de motivation',
            'L\'addiction diminue la production naturelle de dopamine',
            'Le cerveau associe la substance à la survie'
          ]
        },
        {
          title: 'Le Cycle Craving → Action → Soulagement',
          content: 'Comprendre ce cycle est essentiel pour le briser. Le craving déclenche une envie irrésistible, qui mène à l\'action (consommation), suivie d\'un soulagement temporaire, puis d\'un retour du craving souvent plus fort.',
          keyPoints: [
            'Les cravings sont temporaires et diminuent naturellement',
            'Chaque résistance renforce votre capacité de contrôle',
            'L\'activité physique peut interrompre ce cycle'
          ]
        }
      ]
    }
  },
  {
    id: 'exercise-neuroscience',
    title: 'Comment l\'Activité Physique Agit sur le Craving',
    description: 'Les bases scientifiques expliquant pourquoi l\'exercice est efficace contre les cravings.',
    category: 'exercise',
    duration: 15,
    difficulty: 'intermediate',
    content: {
      sections: [
        {
          title: 'Liberation d\'Endorphines',
          content: 'L\'exercice stimule la production d\'endorphines, les "hormones du bonheur" naturelles du corps. Ces neurotransmetteurs agissent sur les mêmes récepteurs que certaines substances addictives.',
          keyPoints: [
            'Les endorphines procurent une sensation de bien-être naturelle',
            'Elles réduisent la perception de la douleur et du stress',
            'L\'effet peut durer plusieurs heures après l\'exercice'
          ]
        },
        {
          title: 'Régulation du Stress',
          content: 'L\'activité physique régule l\'axe hypothalamo-hypophyso-surrénalien, réduisant la production de cortisol, l\'hormone du stress souvent impliquée dans les rechutes.',
          keyPoints: [
            'Le stress est un déclencheur majeur de cravings',
            'L\'exercice réduit les niveaux de cortisol',
            'Une meilleure gestion du stress prévient les rechutes'
          ]
        },
        {
          title: 'Neuroplasticité et Récupération',
          content: 'L\'exercice favorise la neurogenèse et la plasticité cérébrale, aidant le cerveau à se "réparer" des dommages causés par l\'addiction.',
          keyPoints: [
            'L\'exercice stimule la croissance de nouveaux neurones',
            'Il améliore les connexions entre les zones cérébrales',
            'La récupération cognitive est accélérée'
          ]
        }
      ]
    }
  },
  {
    id: 'cognitive-strategies',
    title: 'Stratégies Cognitives et Émotionnelles',
    description: 'Techniques psychologiques pour mieux gérer les pensées et émotions difficiles.',
    category: 'psychology',
    duration: 12,
    difficulty: 'intermediate',
    content: {
      sections: [
        {
          title: 'Restructuration Cognitive',
          content: 'Apprenez à identifier et modifier les pensées négatives automatiques qui peuvent déclencher des cravings.',
          keyPoints: [
            'Les pensées influencent nos émotions et comportements',
            'Questionnez la validité de vos pensées automatiques',
            'Remplacez les pensées négatives par des alternatives réalistes'
          ]
        },
        {
          title: 'Tolérance à la Détresse',
          content: 'Développez votre capacité à supporter les émotions difficiles sans recourir à des comportements d\'évitement.',
          keyPoints: [
            'Les émotions sont temporaires et naturelles',
            'Accepter l\'inconfort sans le combattre',
            'Utiliser des techniques de respiration et de mindfulness'
          ]
        }
      ]
    }
  },
  {
    id: 'breathing-techniques',
    title: 'Techniques de Respiration Avancées',
    description: 'Maîtrisez différentes méthodes de respiration pour gérer l\'anxiété et les cravings.',
    category: 'techniques',
    duration: 8,
    difficulty: 'beginner',
    content: {
      sections: [
        {
          title: 'Respiration Diaphragmatique',
          content: 'La respiration profonde active le système nerveux parasympathique, induisant une réponse de relaxation naturelle.',
          keyPoints: [
            'Placez une main sur la poitrine, une sur le ventre',
            'Seule la main sur le ventre doit bouger',
            'Inspirez lentement par le nez, expirez par la bouche'
          ]
        },
        {
          title: 'Technique 4-7-8',
          content: 'Cette méthode, développée par le Dr. Andrew Weil, est particulièrement efficace pour l\'anxiété et l\'insomnie.',
          keyPoints: [
            'Inspirez par le nez pendant 4 temps',
            'Retenez votre souffle pendant 7 temps',
            'Expirez par la bouche pendant 8 temps'
          ]
        }
      ]
    }
  }
];

// Catégories par défaut pour le fallback
const fallbackCategories = {
  addiction: 'Comprendre l\'Addiction',
  exercise: 'Science de l\'Exercice',
  psychology: 'Psychologie Cognitive',
  techniques: 'Techniques Pratiques'
};

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  // Récupération des catégories de contenu en priorité
  const { data: contentCategories = [], isLoading: isLoadingCategories } = useQuery<ContentCategory[]>({
    queryKey: ['content-categories'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/content-categories');
        const categories = await response.json();
        return Array.isArray(categories) ? categories.filter(cat => cat.isActive) : [];
      } catch (error) {
        console.log('Categories not available, using fallback');
        return [];
      }
    },
    initialData: []
  });

  // Récupération du contenu éducationnel depuis l'API (nouvelle version) - PRIORITAIRE
  const { data: newApiContent, isLoading: isLoadingNew } = useQuery<EducationalContent[]>({
    queryKey: ['educational-contents'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/educational-contents?status=published');
        return response.json();
      } catch (error) {
        console.log('New educational contents not available, using fallback');
        return [];
      }
    },
    initialData: [],
    enabled: contentCategories.length > 0, // Attendre les catégories d'abord
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Actualisation automatique toutes les minutes
  });

  // Récupération du contenu psychoéducationnel depuis l'ancienne API (fallback uniquement)
  const { data: apiContent, isLoading: isLoadingOld, error } = useQuery<APIPsychoEducationContent[]>({
    queryKey: ['psycho-education'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/psycho-education');
      return response.json();
    },
    initialData: [],
    enabled: newApiContent.length === 0 && !isLoadingNew // Seulement si pas de nouveau contenu
  });

  // Sélectionner la première catégorie par défaut une fois qu'elles sont chargées
  React.useEffect(() => {
    if (contentCategories.length > 0 && !selectedCategory) {
      const firstCategory = contentCategories.sort((a, b) => a.order - b.order)[0];
      setSelectedCategory(firstCategory.id);
    }
  }, [contentCategories, selectedCategory]);

  const isLoading = isLoadingCategories || isLoadingNew || (newApiContent.length === 0 && isLoadingOld);

  // Fonction pour convertir le nouveau contenu éducatif en format frontend
  const convertNewAPIContentToFrontend = (content: EducationalContent): EducationModule => {
    // Parser le contenu markdown
    const sections = parseContentSections(content.content);
    
    // Trouver la catégorie associée
    const category = contentCategories.find(cat => cat.id === content.categoryId);
    
    return {
      id: content.id,
      title: content.title,
      description: content.description || (content.content.substring(0, 200) + '...'),
      categoryId: content.categoryId,
      categoryName: category?.name,
      duration: content.estimatedReadTime || 10,
      difficulty: (content.difficulty === 'easy' ? 'beginner' : content.difficulty) as 'beginner' | 'intermediate' | 'advanced',
      content: {
        sections: sections
      },
      // Nouveaux champs
      thumbnailUrl: content.thumbnailUrl,
      mediaUrl: content.mediaUrl,
      mediaType: content.mediaType,
      tags: content.tags,
      isRecommended: content.isRecommended,
      viewCount: content.viewCount,
      likeCount: content.likeCount
    };
  };

  // Conversion du contenu API vers le format frontend - NOUVEAU SYSTEME PRIORITAIRE
  let educationModules: EducationModule[];
  let contentSource = '';
  
  if (newApiContent.length > 0) {
    // Utiliser le nouveau contenu éducatif (système principal)
    educationModules = newApiContent.map(convertNewAPIContentToFrontend);
    contentSource = 'new-system';
  } else if (apiContent.length > 0) {
    // Fallback vers l'ancienne API
    educationModules = apiContent.map(content => convertAPIContentToFrontend(content, contentCategories));
    contentSource = 'legacy-system';
  } else {
    // Fallback vers le contenu statique uniquement si aucune donnée disponible
    const fallbackWithCategories = fallbackEducationModules.map(module => {
      const category = contentCategories.find(cat => {
        const catName = cat.name.toLowerCase();
        const moduleCategory = module.category;
        if (moduleCategory === 'addiction' && (catName.includes('addiction') || catName.includes('dépendance'))) return true;
        if (moduleCategory === 'exercise' && (catName.includes('exercice') || catName.includes('activité'))) return true;
        if (moduleCategory === 'psychology' && (catName.includes('psycholog') || catName.includes('cognitif'))) return true;
        if (moduleCategory === 'techniques' && (catName.includes('technique') || catName.includes('méthode'))) return true;
        return false;
      });
      return {
        ...module,
        categoryId: category?.id,
        categoryName: category?.name
      };
    });
    educationModules = fallbackWithCategories;
    contentSource = 'fallback-static';
  }

  const filteredModules = educationModules.filter(module => 
    selectedCategory ? module.categoryId === selectedCategory : true
  );

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du contenu éducatif...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Erreur lors du chargement du contenu éducatif.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
      </>
    );
  }

  const markAsCompleted = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Psychoéducation</h1>
          <p className="text-muted-foreground">
            Approfondissez vos connaissances sur l'addiction et les stratégies de récupération.
          </p>
        </section>

        {/* Progress Overview */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-progress-overview">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">school</span>
                Votre Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {contentCategories.sort((a, b) => a.order - b.order).map((category) => {
                  const categoryModules = educationModules.filter(m => m.categoryId === category.id);
                  const completed = categoryModules.filter(m => completedModules.includes(m.id)).length;
                  const progress = categoryModules.length > 0 ? (completed / categoryModules.length) * 100 : 0;
                  
                  return (
                    <div key={category.id} className="text-center" data-testid={`progress-${category.id}`}>
                      <div className="mb-2">
                        <span className="material-icons text-2xl text-primary">
                          {category.icon || 'school'}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-foreground mb-1">{category.name}</h4>
                      <div className="text-xs text-muted-foreground mb-2">
                        {completed}/{categoryModules.length} modules
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Category Selection */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-category-selection">
            <CardHeader>
              <CardTitle>Choisissez une Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {contentCategories.sort((a, b) => a.order - b.order).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                  >
                    <span className="material-icons text-2xl">
                      {category.icon || 'school'}
                    </span>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modules List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-foreground">
              {selectedCategory ? contentCategories.find(cat => cat.id === selectedCategory)?.name || 'Tous les contenus' : 'Tous les contenus'}
            </h2>
            <span className="text-sm text-muted-foreground" data-testid="text-module-count">
              {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
              {contentSource === 'new-system' ? ' (système éducatif principal)' : 
               contentSource === 'legacy-system' ? ' (système psychoéducatif legacy)' : 
               ' (contenu de démonstration)'}
            </span>
          </div>

          <div className="space-y-6" data-testid="modules-list">
            {filteredModules.length > 0 ? filteredModules.map((module) => {
              const isCompleted = completedModules.includes(module.id);
              
              return (
                <Card key={module.id} className="shadow-material" data-testid={`card-module-${module.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          {module.isRecommended && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <span className="material-icons text-sm mr-1">star</span>
                              Recommandé
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-success text-success-foreground">
                              <span className="material-icons text-sm mr-1">check_circle</span>
                              Complété
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{module.description}</p>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty === 'beginner' ? 'Débutant' : 
                             module.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <span className="material-icons text-base mr-1">schedule</span>
                            {module.duration} min
                          </span>
                          {module.viewCount !== undefined && (
                            <span className="text-sm text-muted-foreground flex items-center">
                              <span className="material-icons text-base mr-1">visibility</span>
                              {module.viewCount}
                            </span>
                          )}
                          {module.likeCount !== undefined && (
                            <span className="text-sm text-muted-foreground flex items-center">
                              <span className="material-icons text-base mr-1">favorite</span>
                              {module.likeCount}
                            </span>
                          )}
                        </div>
                        {module.tags && module.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {module.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {module.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{module.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {module.thumbnailUrl && (
                        <div className="ml-4">
                          <img 
                            src={module.thumbnailUrl} 
                            alt={module.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {module.content.sections.map((section, index) => (
                        <AccordionItem key={index} value={`section-${index}`}>
                          <AccordionTrigger className="text-left">
                            {section.title}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <p className="text-foreground leading-relaxed">
                              {section.content}
                            </p>
                            {section.keyPoints && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Points clés :</h4>
                                <ul className="space-y-1">
                                  {section.keyPoints.map((point, pointIndex) => (
                                    <li key={pointIndex} className="flex items-start text-sm text-muted-foreground">
                                      <span className="material-icons text-success mr-2 mt-0.5 text-base">
                                        check_circle
                                      </span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => markAsCompleted(module.id)}
                        disabled={isCompleted}
                        className={isCompleted ? "bg-success text-success-foreground" : ""}
                        data-testid={`button-complete-${module.id}`}
                      >
                        {isCompleted ? (
                          <>
                            <span className="material-icons mr-2 text-sm">check_circle</span>
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
            }) : (
              <Card className="shadow-material">
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-6xl text-muted-foreground mb-4">school</span>
                  <h3 className="text-xl font-medium text-foreground mb-2">Aucun contenu disponible</h3>
                  <p className="text-muted-foreground mb-4">
                    {contentSource === 'fallback-static' ? 
                      "Aucun contenu éducatif créé par les administrateurs. Le contenu sera disponible une fois ajouté via l'interface d'administration." :
                      "Aucun contenu disponible pour cette catégorie sélectionnée."}
                  </p>
                  <Button
                    onClick={() => {
                      const firstCategory = contentCategories.find(cat => cat.name.includes('Addiction'));
                      if (firstCategory) {
                        setSelectedCategory(firstCategory.id);
                      }
                    }}
                  >
                    Voir la catégorie Addiction
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Quick Resources */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-primary to-blue-600 shadow-material text-white" data-testid="card-quick-resources">
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <span className="material-icons mr-2">tips_and_updates</span>
                Ressources Rapides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">En Cas de Craving Intense</h4>
                  <p className="text-sm opacity-90">
                    Rappelez-vous : les cravings sont temporaires et atteignent un pic avant de diminuer naturellement.
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Technique RAIN</h4>
                  <p className="text-sm opacity-90">
                    Reconnaître, Accepter, Investiguer avec bienveillance, Non-identification.
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Signal d'Alarme</h4>
                  <p className="text-sm opacity-90">
                    Si vous ressentez des pensées suicidaires, contactez immédiatement un professionnel de santé.
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