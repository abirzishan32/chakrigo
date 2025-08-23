"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Trash2, 
  MapPin,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from "lucide-react";
import { getUserRoadmaps, deleteRoadmap } from "@/lib/actions/roadmap.action";
import { toast } from "sonner";

interface SavedRoadmap {
  id: string;
  title: string;
  careerPath: string;
  analysis: any;
  roadmapStructure: {
    nodes: any[];
    edges: any[];
    phases: any[];
  };
  detailedDescription: string;
  metadata: any;
  createdAt: number;
  updatedAt: number;
}

interface SavedRoadmapsProps {
  onLoadRoadmap: (roadmap: SavedRoadmap) => void;
  onNewRoadmap: () => void;
}

export function SavedRoadmaps({ onLoadRoadmap, onNewRoadmap }: SavedRoadmapsProps) {
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "duration" | "difficulty">("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    setIsLoading(true);
    try {
      const result = await getUserRoadmaps();
      if (result.success) {
        setRoadmaps(result.roadmaps);
      } else {
        toast.error(result.message || "Failed to load roadmaps");
      }
    } catch (error) {
      console.error("Error loading roadmaps:", error);
      toast.error("Failed to load roadmaps");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeletingId(roadmapId);
    
    try {
      const result = await deleteRoadmap(roadmapId);
      if (result.success) {
        setRoadmaps(roadmaps.filter(r => r.id !== roadmapId));
        toast.success("Roadmap deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete roadmap");
      }
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      toast.error("Failed to delete roadmap");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort roadmaps
  const filteredAndSortedRoadmaps = useMemo(() => {
    let filtered = roadmaps.filter(roadmap => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        roadmap.title.toLowerCase().includes(searchLower) ||
        roadmap.careerPath.toLowerCase().includes(searchLower);
      
      // Difficulty filter
      const matchesDifficulty = filterBy === "all" || 
        roadmap.metadata?.difficulty?.toLowerCase() === filterBy;
      
      return matchesSearch && matchesDifficulty;
    });

    // Sort roadmaps
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "recent":
          comparison = b.updatedAt - a.updatedAt;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "duration":
          const aDuration = a.metadata?.total_duration || "";
          const bDuration = b.metadata?.total_duration || "";
          comparison = aDuration.localeCompare(bDuration);
          break;
        case "difficulty":
          const difficulties = { "beginner": 1, "intermediate": 2, "advanced": 3 };
          const aDiff = difficulties[a.metadata?.difficulty?.toLowerCase() as keyof typeof difficulties] || 0;
          const bDiff = difficulties[b.metadata?.difficulty?.toLowerCase() as keyof typeof difficulties] || 0;
          comparison = aDiff - bDiff;
          break;
        default:
          comparison = b.updatedAt - a.updatedAt;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [roadmaps, searchQuery, sortBy, sortOrder, filterBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-80 mx-auto mb-2" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          {/* Controls Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <Skeleton className="h-10 w-80" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-400" />
            My Learning Roadmaps
          </h1>
          <p className="text-gray-400 text-lg">
            {filteredAndSortedRoadmaps.length > 0 
              ? `${filteredAndSortedRoadmaps.length} of ${roadmaps.length} roadmap${roadmaps.length !== 1 ? 's' : ''}`
              : roadmaps.length > 0 
                ? "No roadmaps match your search criteria"
                : "Start building your personalized learning journey"
            }
          </p>
        </div>

        {roadmaps.length === 0 ? (
          /* Empty State */
          <Card className="bg-gray-800/50 border-gray-700 border-dashed max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <div className="max-w-md mx-auto">
                <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No roadmaps yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Create your first personalized learning roadmap to get started on your career journey.
                </p>
                <Button 
                  onClick={onNewRoadmap}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create First Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search roadmaps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Filter by Difficulty */}
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Options */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-700 rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`border-0 rounded-none ${viewMode === "grid" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`border-0 rounded-none ${viewMode === "list" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* New Roadmap Button */}
                  <Button 
                    onClick={onNewRoadmap}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Roadmap
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-400">
                {filteredAndSortedRoadmaps.length} result{filteredAndSortedRoadmaps.length !== 1 ? 's' : ''} found
              </div>
            )}

            {filteredAndSortedRoadmaps.length === 0 ? (
              /* No Results */
              <Card className="bg-gray-800/50 border-gray-700 border-dashed max-w-2xl mx-auto">
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No roadmaps found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBy("all");
                    }}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Roadmaps Display */
              <div className={
                viewMode === "grid" 
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  : "space-y-4"
              }>
                {filteredAndSortedRoadmaps.map((roadmap) => (
                  viewMode === "grid" ? (
                    /* Grid View Card */
                    <Card 
                      key={roadmap.id}
                      className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer group hover:border-blue-500/50"
                      onClick={() => onLoadRoadmap(roadmap)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-base line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {roadmap.title}
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-1 text-sm line-clamp-1">
                              {roadmap.careerPath}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                            onClick={(e) => handleDeleteRoadmap(roadmap.id, e)}
                            disabled={deletingId === roadmap.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate">{roadmap.roadmapStructure.nodes?.length || 0} steps</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate">{roadmap.metadata?.total_duration || "N/A"}</span>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        {roadmap.metadata?.difficulty && (
                          <Badge 
                            variant="outline" 
                            className="bg-gray-700 text-gray-200 border-gray-600 capitalize text-xs"
                          >
                            {roadmap.metadata.difficulty}
                          </Badge>
                        )}

                        {/* Created Date */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(roadmap.createdAt)}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* List View Card */
                    <Card 
                      key={roadmap.id}
                      className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer group hover:border-blue-500/50"
                      onClick={() => onLoadRoadmap(roadmap)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white text-lg font-semibold group-hover:text-blue-400 transition-colors line-clamp-1">
                                  {roadmap.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                                  {roadmap.careerPath}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-gray-300 shrink-0">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{roadmap.roadmapStructure.nodes?.length || 0} steps</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{roadmap.metadata?.total_duration || "N/A"}</span>
                                </div>
                                {roadmap.metadata?.difficulty && (
                                  <Badge 
                                    variant="outline" 
                                    className="bg-gray-700 text-gray-200 border-gray-600 capitalize"
                                  >
                                    {roadmap.metadata.difficulty}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(roadmap.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteRoadmap(roadmap.id, e)}
                              disabled={deletingId === roadmap.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
