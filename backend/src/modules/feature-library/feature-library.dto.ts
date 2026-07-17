export type FeatureLibraryDto = {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  description: string;
  defaultComplexity: "LOW" | "MEDIUM" | "HIGH";
  defaultEstimatedHours: number;
  tags: string[];
  technologies: string[];
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginationMetaDto = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedFeatureLibraryDto = {
  items: FeatureLibraryDto[];
  meta: PaginationMetaDto;
};

export type DetectedFeatureMatchDto = {
  id: string;
  featureName: string;
  featureCategory: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  complexity: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
};

export type FeatureMatchSuggestionDto = {
  detectedFeature: DetectedFeatureMatchDto;
  matchedLibraryFeature: FeatureLibraryDto | null;
  confidence: number;
  recommendation: string;
};

export type FeatureMatchResponseDto = {
  consultationId: string;
  matches: FeatureMatchSuggestionDto[];
};
