import { AI_ROLES } from "../ai/ai.constants.js";
import type { AIMessage, AIRequest } from "../ai/ai.types.js";
import {
  PROMPT_DEFAULTS,
  PROMPT_TYPES,
  RESERVED_TEMPLATE_VARIABLES,
  type PromptType,
} from "./prompt.constants.js";
import type {
  BuiltPrompt,
  ConsultationPromptContext,
  ConversationPromptMessage,
  OrganizationPromptContext,
  PromptBuildInput,
  TemplateVariables,
} from "./prompt.types.js";

const SYSTEM_PROMPT_TEMPLATES: Record<PromptType, string> = {
  [PROMPT_TYPES.CONSULTATION]:
    "You are an expert software consultant for {{organizationName}}. Guide the discovery conversation for project \"{{consultationTitle}}\". Industry: {{industry}}. Project type: {{projectType}}. Budget range: {{budgetRange}}. Timeline: {{timeline}}. Ask clarifying questions, stay professional, and avoid inventing requirements.",
  [PROMPT_TYPES.FEATURE_DETECTION]:
    "You are a product analyst for {{organizationName}}. Identify candidate software features from the consultation context. Project: {{consultationTitle}}. Industry: {{industry}}. Project type: {{projectType}}. Return structured feature suggestions only.",
  [PROMPT_TYPES.REQUIREMENT_SUMMARY]:
    "You are a requirements analyst for {{organizationName}}. Summarize clear, testable requirements for \"{{consultationTitle}}\". Include goals, constraints, stakeholders, and open questions. Industry: {{industry}}.",
  [PROMPT_TYPES.ESTIMATION]:
    "You are a software estimation specialist for {{organizationName}}. Produce effort and cost estimates for \"{{consultationTitle}}\". Consider complexity, risks, and timeline {{timeline}}. Do not invent unavailable details.",
  [PROMPT_TYPES.PROPOSAL]:
    "You are a proposal writer for {{organizationName}}. Draft a client-ready proposal for \"{{consultationTitle}}\". Cover scope, approach, timeline {{timeline}}, and budget considerations {{budgetRange}}.",
  [PROMPT_TYPES.EMAIL]:
    "You are a professional communications assistant for {{organizationName}}. Draft a clear, concise email related to consultation \"{{consultationTitle}}\". Keep tone professional and actionable.",
  [PROMPT_TYPES.MEETING_SUMMARY]:
    "You are a meeting summarizer for {{organizationName}}. Produce a structured summary for consultation \"{{consultationTitle}}\" with decisions, action items, and next steps.",
};

const USER_PROMPT_TEMPLATES: Record<PromptType, string> = {
  [PROMPT_TYPES.CONSULTATION]: "{{userMessage}}",
  [PROMPT_TYPES.FEATURE_DETECTION]:
    "Analyze the following input and detect features:\n\n{{userMessage}}",
  [PROMPT_TYPES.REQUIREMENT_SUMMARY]:
    "Create a requirement summary from:\n\n{{userMessage}}",
  [PROMPT_TYPES.ESTIMATION]:
    "Create an estimation based on:\n\n{{userMessage}}",
  [PROMPT_TYPES.PROPOSAL]:
    "Draft a proposal based on:\n\n{{userMessage}}",
  [PROMPT_TYPES.EMAIL]:
    "Draft an email based on:\n\n{{userMessage}}",
  [PROMPT_TYPES.MEETING_SUMMARY]:
    "Summarize the meeting notes:\n\n{{userMessage}}",
};

export class PromptBuilder {
  buildSystemPrompt(
    promptType: PromptType,
    variables: TemplateVariables = {},
  ): string {
    return this.applyTemplate(SYSTEM_PROMPT_TEMPLATES[promptType], variables);
  }

  buildUserPrompt(
    promptType: PromptType,
    variables: TemplateVariables = {},
  ): string {
    return this.applyTemplate(USER_PROMPT_TEMPLATES[promptType], variables);
  }

  injectOrganizationContext(
    organization: OrganizationPromptContext | undefined,
    variables: TemplateVariables = {},
  ): TemplateVariables {
    if (!organization) {
      return { ...variables };
    }

    return {
      ...variables,
      [RESERVED_TEMPLATE_VARIABLES.ORGANIZATION_ID]: organization.id,
      [RESERVED_TEMPLATE_VARIABLES.ORGANIZATION_NAME]: organization.name,
    };
  }

  injectConsultationContext(
    consultation: ConsultationPromptContext | undefined,
    variables: TemplateVariables = {},
  ): TemplateVariables {
    if (!consultation) {
      return { ...variables };
    }

    return {
      ...variables,
      [RESERVED_TEMPLATE_VARIABLES.CONSULTATION_ID]: consultation.id,
      [RESERVED_TEMPLATE_VARIABLES.CONSULTATION_TITLE]: consultation.title,
      [RESERVED_TEMPLATE_VARIABLES.INDUSTRY]: consultation.industry ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.PROJECT_TYPE]:
        consultation.projectType ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.BUDGET_RANGE]:
        consultation.budgetRange ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.TIMELINE]: consultation.timeline ?? "unspecified",
    };
  }

  injectConversationHistory(
    history: ConversationPromptMessage[] | undefined,
    maxHistory: number = PROMPT_DEFAULTS.MAX_CONVERSATION_HISTORY,
  ): AIMessage[] {
    if (!history || history.length === 0) {
      return [];
    }

    const trimmed = history.slice(-maxHistory);

    return trimmed.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  buildMessages(input: {
    systemPrompt: string;
    userPrompt: string;
    conversationHistory?: ConversationPromptMessage[];
    maxHistory?: number;
  }): AIMessage[] {
    const historyMessages = this.injectConversationHistory(
      input.conversationHistory,
      input.maxHistory ?? PROMPT_DEFAULTS.MAX_CONVERSATION_HISTORY,
    );

    const messages: AIMessage[] = [
      {
        role: AI_ROLES.SYSTEM,
        content: input.systemPrompt,
      },
      ...historyMessages,
      {
        role: AI_ROLES.USER,
        content: input.userPrompt,
      },
    ];

    return messages;
  }

  build(input: PromptBuildInput): BuiltPrompt {
    let variables = this.injectOrganizationContext(
      input.organization,
      input.variables ?? {},
    );
    variables = this.injectConsultationContext(input.consultation, variables);
    variables = {
      ...variables,
      [RESERVED_TEMPLATE_VARIABLES.ORGANIZATION_NAME]:
        variables[RESERVED_TEMPLATE_VARIABLES.ORGANIZATION_NAME] ??
        "the organization",
      [RESERVED_TEMPLATE_VARIABLES.CONSULTATION_TITLE]:
        variables[RESERVED_TEMPLATE_VARIABLES.CONSULTATION_TITLE] ??
        "the consultation",
      [RESERVED_TEMPLATE_VARIABLES.INDUSTRY]:
        variables[RESERVED_TEMPLATE_VARIABLES.INDUSTRY] ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.PROJECT_TYPE]:
        variables[RESERVED_TEMPLATE_VARIABLES.PROJECT_TYPE] ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.BUDGET_RANGE]:
        variables[RESERVED_TEMPLATE_VARIABLES.BUDGET_RANGE] ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.TIMELINE]:
        variables[RESERVED_TEMPLATE_VARIABLES.TIMELINE] ?? "unspecified",
      [RESERVED_TEMPLATE_VARIABLES.USER_MESSAGE]: input.userMessage,
    };

    const systemPrompt = this.buildSystemPrompt(input.promptType, variables);
    const userPrompt = this.buildUserPrompt(input.promptType, variables);
    const messages = this.buildMessages({
      systemPrompt,
      userPrompt,
      conversationHistory: input.conversationHistory,
    });

    const request: AIRequest = {
      model: input.model,
      messages,
      systemPrompt,
      maxTokens: input.maxTokens ?? input.model.maxTokens,
      temperature: input.temperature ?? input.model.temperature,
      metadata: {
        promptType: input.promptType,
        ...input.metadata,
      },
    };

    return {
      systemPrompt,
      userPrompt,
      messages,
      request,
    };
  }

  applyTemplate(template: string, variables: TemplateVariables): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
      const value = variables[key];

      if (value === null || value === undefined) {
        return "";
      }

      return String(value);
    });
  }
}

export const promptBuilder = new PromptBuilder();
