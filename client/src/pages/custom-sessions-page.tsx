import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Trash2, Plus, Clock, Dumbbell, TrendingUp } from 'lucide-react';
import { PatientSessionEditor } from '@/components/patient-session-editor';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  intensity: number;
  duration: number;
  repetitions?: number;
  isCustom?: boolean;
}

interface UserSession {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
  totalDuration: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  averageDifficulty: string;
  favoriteCategory: string;
}

export default function CustomSessionsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalDuration: 0,
    averageDifficulty: 'Beginner',
    favoriteCategory: 'Cardio'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingSession, setEditingSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [sessions]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/user-sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load sessions');
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (sessions.length === 0) return;

    const totalDuration = sessions.reduce((sum, session) => sum + session.totalDuration, 0);
    const categories = sessions.flatMap(session => 
      session.exercises.map(ex => ex.category)
    );
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Cardio';

    const difficulties = sessions.map(s => s.difficulty);
    const difficultyMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    const avgDifficultyNum = difficulties.reduce((sum, diff) => 
      sum + (difficultyMap[diff as keyof typeof difficultyMap] || 1), 0) / difficulties.length;
    
    const averageDifficulty = avgDifficultyNum <= 1.5 ? 'Beginner' : 
                             avgDifficultyNum <= 2.5 ? 'Intermediate' : 'Advanced';

    setStats({
      totalSessions: sessions.length,
      totalDuration: Math.round(totalDuration),
      averageDifficulty,
      favoriteCategory
    });
  };

  const handleCreateSession = () => {
    setEditingSession(null);
    setIsCreating(true);
  };

  const handleEditSession = (session: UserSession) => {
    setEditingSession(session);
    setIsCreating(true);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`/api/user-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete session');

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: 'Success',
        description: 'Session deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive'
      });
    }
  };

  const handleStartSession = (session: UserSession) => {
    // Store session data for workout execution
    localStorage.setItem('currentWorkout', JSON.stringify({
      id: session.id,
      name: session.name,
      exercises: session.exercises,
      isCustom: true
    }));
    
    // Navigate to workout page
    window.location.href = '/workout';
  };

  const handleSessionSaved = (savedSession: UserSession) => {
    if (editingSession) {
      // Update existing session
      setSessions(prev => prev.map(s => s.id === savedSession.id ? savedSession : s));
    } else {
      // Add new session
      setSessions(prev => [savedSession, ...prev]);
    }
    setIsCreating(false);
    setEditingSession(null);
    
    toast({
      title: 'Success',
      description: editingSession ? 'Session updated successfully' : 'Session created successfully'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isCreating) {
    return (
      <PatientSessionEditor
        session={editingSession}
        onSave={handleSessionSaved}
        onCancel={() => {
          setIsCreating(false);
          setEditingSession(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600 mt-2">Create and manage your personalized workout sessions</p>
          </div>
          <Button 
            onClick={handleCreateSession}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Dumbbell className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Level</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageDifficulty}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">★</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Favorite Category</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.favoriteCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-500 mb-6">Create your first personalized workout session to get started</p>
              <Button 
                onClick={handleCreateSession}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {session.description}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(session.difficulty)}>
                      {session.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Session Info */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(session.totalDuration)}
                      </span>
                      <span className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-1" />
                        {session.exercises.length} exercises
                      </span>
                    </div>

                    {/* Exercise Categories */}
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(session.exercises.map(ex => ex.category))).slice(0, 3).map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {Array.from(new Set(session.exercises.map(ex => ex.category))).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{Array.from(new Set(session.exercises.map(ex => ex.category))).length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleStartSession(session)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                      <Button 
                        onClick={() => handleEditSession(session)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDeleteSession(session.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}