
"use server";

import { JobSchema, type JobFormState } from "./schema";

export async function createJob(
  prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const validatedFields = JobSchema.safeParse({
    title: formData.get("title"),
    email: formData.get("email"),
    salary: formData.get("salary"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يرجى تصحيح الأخطاء الموجودة في النموذج.",
    };
  }

  const { title, email, salary } = validatedFields.data;

  console.log({ title, email, salary });
  

  return {
    errors: {},
    message: "تم التحقق من البيانات بنجاح.",
  };
}
