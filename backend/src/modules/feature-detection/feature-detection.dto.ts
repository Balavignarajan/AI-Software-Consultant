export type DetectedFeatureDto = {
  id: string;
  organizationId: string;
  consultationId: string;
  requirementSummaryId: string;
  featureName: string;
  featureCategory: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  complexity: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  aiReasoning: string;
  manuallyVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FeaturesByCategoryDto = {
  category: string;
  features: DetectedFeatureDto[];
};

export type DetectedFeaturesResponseDto = {
  consultationId: string;
  total: number;
  groups: FeaturesByCategoryDto[];
};
