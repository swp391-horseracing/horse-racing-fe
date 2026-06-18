import { z } from "zod";

export const tournamentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Tournament name must be at least 3 characters"),

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),

    description: z.string().trim().min(1, "Description is required"),
    rules: z.string().trim().min(1, "Rules are required"),
    location: z.string().trim().min(1, "Location is required"),

    registrationOpenDate: z
      .string()
      .min(1, "Registration open date is required"),
    registrationCloseDate: z
      .string()
      .min(1, "Registration close date is required"),

    prizePool: z.coerce.number().positive("Prize pool must be greater than 0"),
    maximumParticipants: z.coerce
      .number()
      .int("Maximum participants must be an integer")
      .positive("Maximum participants must be greater than 0"),
    minimumParticipants: z.coerce
      .number()
      .int("Minimum participants must be an integer")
      .positive("Minimum participants must be greater than 0"),
  })
  .superRefine((data, ctx) => {
    const regOpen = new Date(data.registrationOpenDate);
    const regClose = new Date(data.registrationCloseDate);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (Number.isNaN(regOpen.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationOpenDate"],
        message: "Registration open date is invalid",
      });
    }

    if (Number.isNaN(regClose.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationCloseDate"],
        message: "Registration close date is invalid",
      });
    }

    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date is invalid",
      });
    }

    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date is invalid",
      });
    }

    if (!Number.isNaN(regOpen.getTime()) && !Number.isNaN(regClose.getTime())) {
      if (regClose <= regOpen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationCloseDate"],
          message:
            "Registration close date must be after registration open date",
        });
      }
    }

    if (!Number.isNaN(regClose.getTime()) && !Number.isNaN(start.getTime())) {
      if (start <= regClose) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "Start date must be after registration close date",
        });
      }
    }

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be after start date",
        });
      }
    }

    if (data.maximumParticipants < data.minimumParticipants) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maximumParticipants"],
        message:
          "Maximum participants must be greater than or equal to minimum participants",
      });
    }
  });

export type TournamentFormValues = z.infer<typeof tournamentSchema>;
