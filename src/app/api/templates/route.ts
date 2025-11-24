import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { templateSchema } from "@/lib/validations/template";
import {
  withErrorHandling,
  successResponse,
  withValidation,
} from "@/lib/api/apiHandler";
import { z } from "zod";

type TemplateBody = z.infer<typeof templateSchema>;

export const GET = withErrorHandling(async () => {
  const templates = await prisma.shiftTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return successResponse(templates);
});

export const POST = withValidation<TemplateBody>(
  templateSchema,
  async (request: NextRequest, validatedData: TemplateBody) => {
    const template = await prisma.shiftTemplate.create({
      data: validatedData,
    });
    return successResponse(template, 201);
  }
);
