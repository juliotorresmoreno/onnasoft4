
import Joi from "joi";

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required(),
  subject: Joi.string().trim().min(5).max(100).required(),
  message: Joi.string().trim().min(10).max(1000).required(),
});

type FieldName = "name" | "email" | "subject" | "message";

interface FormTranslations {
  name: string;
  email: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  errors: {
    name: string;
    email: string;
    subject: string;
    message: string;
    form: string;
    validation: string;
    server: string;
    emailFailed: string;
  };
}

interface ApiResult {
  error?: string;
  details?: string[];
}

const fieldNames: FieldName[] = [
  "name",
  "email",
  "subject",
  "message",
];

document.querySelectorAll<HTMLFormElement>("[data-contact-form]").forEach((form) => {
  const translationsAttribute = form.dataset.translations;

  if (!translationsAttribute) return;

  const t = JSON.parse(translationsAttribute) as FormTranslations;

  const submitButton = form.querySelector<HTMLButtonElement>("[data-submit]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const sendingLabel = form.querySelector<HTMLElement>("[data-sending-label]");
  const spinner = form.querySelector<HTMLElement>("[data-spinner]");
  const successBox = form.querySelector<HTMLElement>("[data-success]");
  const apiErrorBox = form.querySelector<HTMLElement>("[data-api-error]");
  const apiErrorMessage = form.querySelector<HTMLElement>(
    "[data-api-error-message]",
  );
  const serverErrorsList = form.querySelector<HTMLUListElement>(
    "[data-server-errors]",
  );

  function clearErrors() {
    fieldNames.forEach((field) => {
      const input = form.elements.namedItem(field);
      const errorElement = form.querySelector<HTMLElement>(
        `[data-field-error="${field}"]`,
      );

      if (input instanceof HTMLElement) {
        input.classList.remove("border-red-500");
        input.classList.add("border-gray-300");
        input.removeAttribute("aria-invalid");
      }

      if (errorElement) {
        errorElement.textContent = "";
        errorElement.classList.add("hidden");
      }
    });
  }

  function showFieldError(field: FieldName, message: string) {
    const input = form.elements.namedItem(field);
    const errorElement = form.querySelector<HTMLElement>(
      `[data-field-error="${field}"]`,
    );

    if (input instanceof HTMLElement) {
      input.classList.remove("border-gray-300");
      input.classList.add("border-red-500");
      input.setAttribute("aria-invalid", "true");
    }

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }
  }

  function hideApiError() {
    apiErrorBox?.classList.add("hidden");

    if (apiErrorMessage) apiErrorMessage.textContent = "";
    if (serverErrorsList) serverErrorsList.replaceChildren();
  }

  function showApiError(message: string, details: string[] = []) {
    if (apiErrorMessage) apiErrorMessage.textContent = message;

    if (serverErrorsList) {
      serverErrorsList.replaceChildren();

      details.forEach((detail) => {
        const item = document.createElement("li");
        item.textContent = detail;
        serverErrorsList.appendChild(item);
      });
    }

    apiErrorBox?.classList.remove("hidden");
  }

  function setSubmitting(isSubmitting: boolean) {
    if (submitButton) submitButton.disabled = isSubmitting;
    if (submitLabel) submitLabel.classList.toggle("hidden", isSubmitting);
    if (spinner) spinner.classList.toggle("hidden", !isSubmitting);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearErrors();
    hideApiError();
    successBox?.classList.add("hidden");

    const formData = new FormData(form);

    const data = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const { error } = contactSchema.validate(data, {
      abortEarly: false,
    });

    if (error) {
      const displayedFields = new Set<FieldName>();

      error.details.forEach((detail) => {
        const field = detail.path[0] as FieldName;

        if (!fieldNames.includes(field) || displayedFields.has(field)) {
          return;
        }

        displayedFields.add(field);

        let message = t.errors[field];

        if (field === "email" && detail.type !== "string.empty") {
          message = t.errors.email;
        }

        showFieldError(field, message);
      });

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        if (response.status === 400 && result.details) {
          showApiError(t.errors.validation, result.details);
        } else {
          showApiError(result.error || t.errors.server);
        }

        return;
      }

      if (result.error) {
        showApiError(result.error || t.errors.emailFailed);
        return;
      }

      if (successBox) {
        successBox.textContent = t.success;
        successBox.classList.remove("hidden");
      }

      form.reset();
    } catch {
      showApiError(t.errors.server);
    } finally {
      setSubmitting(false);
    }
  });

  fieldNames.forEach((field) => {
    const input = form.elements.namedItem(field);

    if (!(input instanceof HTMLElement)) return;

    input?.addEventListener("input", () => {
      const errorElement = form.querySelector<HTMLElement>(
        `[data-field-error="${field}"]`,
      );

      input.classList.remove("border-red-500");
      input.classList.add("border-gray-300");
      input.removeAttribute("aria-invalid");

      if (errorElement) {
        errorElement.textContent = "";
        errorElement.classList.add("hidden");
      }
    });
  });
});
