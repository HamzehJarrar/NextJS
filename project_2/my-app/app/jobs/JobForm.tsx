
"use client";

import { useActionState } from "react";
import { createJob } from "./actions";
import type { JobFormState } from "./schema";

const initialState: JobFormState = {
  errors: {},
  message: null,
};

export default function JobForm() {
  const [state, formAction, isPending] = useActionState(
    createJob,
    initialState,
  );

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">اسم الوظيفة</label>
        <input
          id="title"
          name="title"
          type="text"
          aria-describedby="title-error"
        />

        <div id="title-error" aria-live="polite">
          {state.errors?.title?.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="email">البريد الإلكتروني</label>
        <input
          id="email"
          name="email"
          type="text"
          aria-describedby="email-error"
        />

        <div id="email-error" aria-live="polite">
          {state.errors?.email?.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="salary">الراتب</label>
        <input
          id="salary"
          name="salary"
          type="number"
          step="any"
          aria-describedby="salary-error"
        />

        <div id="salary-error" aria-live="polite">
          {state.errors?.salary?.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "جارٍ التحقق..." : "إضافة الوظيفة"}
      </button>

      <p aria-live="polite">{state.message}</p>
    </form>
  );
}
