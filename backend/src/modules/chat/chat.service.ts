import { config } from "../../config/env.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger/logger.js";
import { AI_PROVIDERS } from "../ai/ai.constants.js";
import { aiOrchestrator } from "../ai/ai.orchestrator.js";
import type { AIResponse } from "../ai/ai.types.js";
import { PROMPT_TYPES } from "../prompts/prompt.constants.js";
import type { ConversationPromptMessage } from "../prompts/prompt.types.js";
import type { ChatMessageDto, ChatResponseDto } from "./chat.dto.js";
import {
  chatRepository,
  type ConversationMessageRecord,
} from "./chat.repository.js";

const PROMPT_VERSION = "1.0.0";

function toChatMessageDto(
  message: ConversationMessageRecord,
): ChatMessageDto {
  return {
    id: message.id,
    consultationId: message.consultationId,
    organizationId: message.organizationId,
    senderType: message.senderType,
    message: message.message,
    metadata: message.metadata ?? null,
    createdBy: message.createdBy,
    createdAt: message.createdAt,
  };
}

function toConversationHistory(
  messages: ConversationMessageRecord[],
): ConversationPromptMessage[] {
  return messages.map((message) => ({
    role: message.senderType,
    content: message.message,
  }));
}

function resolveSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  return "AI generation failed";
}

export class ChatService {
  async chat(
    organizationId: string,
    consultationId: string,
    userId: string,
    message: string,
  ): Promise<ChatResponseDto> {
    const consultation =
      await chatRepository.findConsultationByIdAndOrganization(
        consultationId,
        organizationId,
      );

    if (!consultation) {
      throw new AppError("Consultation not found", HTTP_STATUS.NOT_FOUND);
    }

    const organization =
      await chatRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new AppError("Organization not found", HTTP_STATUS.NOT_FOUND);
    }

    const userMessage = await chatRepository.createMessage({
      consultationId,
      organizationId,
      senderType: "user",
      message,
      metadata: null,
      createdBy: userId,
    });

    const historyRecords = await chatRepository.findMessagesByConsultation(
      consultationId,
      organizationId,
    );

    const conversationHistory = toConversationHistory(historyRecords);

    let aiResponse: AIResponse;

    try {
      aiResponse = await aiOrchestrator.generateConversationReply({
        organization: {
          id: organization.id,
          name: organization.name,
        },
        consultation: {
          id: consultation.id,
          title: consultation.title,
          industry: consultation.industry,
          projectType: consultation.projectType,
          budgetRange: consultation.budgetRange,
          timeline: consultation.timeline,
          status: consultation.status,
        },
        conversationHistory,
        userMessage: message,
      });
    } catch (error) {
      await chatRepository.createAiGeneration({
        organizationId,
        consultationId,
        conversationMessageId: userMessage.id,
        provider: AI_PROVIDERS.OPENAI,
        model: config.OPENAI_DEFAULT_MODEL,
        promptType: PROMPT_TYPES.CONSULTATION,
        promptVersion: PROMPT_VERSION,
        requestTokens: 0,
        responseTokens: 0,
        totalTokens: 0,
        latencyMs: 0,
        estimatedCost: "0",
        status: "failed",
        errorMessage: resolveSafeErrorMessage(error),
      });

      logger.error(
        `Chat AI generation failed for consultation=${consultationId}`,
      );

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to generate AI response",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const { assistantMessage } = await chatRepository.runInTransaction(
      async (tx) => {
        const savedAssistantMessage = await chatRepository.createMessage(
          {
            consultationId,
            organizationId,
            senderType: "assistant",
            message: aiResponse.message.content,
            metadata: {
              finishReason: aiResponse.metadata.finishReason ?? null,
              requestId: aiResponse.metadata.requestId ?? null,
            },
            createdBy: null,
          },
          tx,
        );

        await chatRepository.createAiGeneration(
          {
            organizationId,
            consultationId,
            conversationMessageId: savedAssistantMessage.id,
            provider: aiResponse.metadata.provider,
            model: aiResponse.metadata.model,
            promptType: PROMPT_TYPES.CONSULTATION,
            promptVersion: PROMPT_VERSION,
            requestTokens: aiResponse.usage.promptTokens,
            responseTokens: aiResponse.usage.completionTokens,
            totalTokens: aiResponse.usage.totalTokens,
            latencyMs: aiResponse.metadata.latencyMs ?? 0,
            estimatedCost: "0",
            status: "success",
            errorMessage: null,
          },
          tx,
        );

        return { assistantMessage: savedAssistantMessage };
      },
    );

    logger.info(
      `Chat reply generated for consultation=${consultationId} model=${aiResponse.metadata.model}`,
    );

    return {
      userMessage: toChatMessageDto(userMessage),
      assistantMessage: toChatMessageDto(assistantMessage),
      usage: {
        promptTokens: aiResponse.usage.promptTokens,
        completionTokens: aiResponse.usage.completionTokens,
        totalTokens: aiResponse.usage.totalTokens,
      },
      model: aiResponse.metadata.model,
    };
  }
}

export const chatService = new ChatService();
