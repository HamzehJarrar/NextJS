
import { z } from "zod";

export const JobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "اسم الوظيفة يجب أن يكون 3 أحرف على الأقل"),

  email: z
    .string()
    .trim()
    .email("أدخل بريدًا إلكترونيًا صحيحًا"),

  salary: z.coerce
    .number()
    .finite("الراتب غير صحيح")
    .positive("الراتب يجب أن يكون أكبر من صفر"),
});

export type JobFormState = {
  errors?: {
    title?: string[];
    email?: string[];
    salary?: string[];
  };
  message?: string | null;
};
