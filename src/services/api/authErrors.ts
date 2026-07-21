import { ApiError } from "./client";


export type FieldKey =
  | "identifier"
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "roleId";

export type FieldErrors = Partial<Record<FieldKey, string>>;

export interface ParsedApiErrors {
  fieldErrors: FieldErrors;
  generalError: string | null;
}


function firstMessage(value: unknown): string | null {
  if (Array.isArray(value)) {
    const msg = value.map((item) => String(item ?? "")).find((item) => item.trim());
    return msg || null;
  }
  if (typeof value === "string" && value.trim()) return value;
  return null;
}


function normalizeFieldKey(rawKey: string): FieldKey | null {
  const cleaned = rawKey
    .trim()
    .replace(/^\$\./, "")
    .replace(/\[(\d+)\]/g, "")
    .replace(/[^a-zA-Z0-9_.]/g, "");

  const segments = cleaned.split(".").filter(Boolean);
  const key = (segments[segments.length - 1] || cleaned).toLowerCase();

  if (
    key === "identifier" ||
    key === "username" ||
    key === "login" ||
    key === "userlogin" ||
    key === "loginidentifier"
  ) {
    return "identifier";
  }
  if (key === "fullname" || key === "name" || key === "fullnamename" || key === "displayname") {
    return "fullName";
  }
  if (key === "email" || key === "useremail" || key === "emailaddress") {
    return "email";
  }
  if (
    key === "phone" ||
    key === "phonenumber" ||
    key === "mobile" ||
    key === "mobilephone" ||
    key === "telephone"
  ) {
    return "phone";
  }
  if (key === "password" || key === "newpassword" || key === "userpassword") {
    return "password";
  }
  if (
    key === "confirmpassword" ||
    key === "passwordconfirm" ||
    key === "passwordconfirmation" ||
    key === "confirmpwd" ||
    key === "repassword"
  ) {
    return "confirmPassword";
  }
  if (key === "roleid" || key === "role" || key === "userrole") {
    return "roleId";
  }
  return null;
}


function classifyMessageToField(message: string): FieldKey | null {
  const text = message.trim().toLowerCase();
  if (!text) return null;

  
  if (
    text.includes("đã được sử dụng") ||
    text.includes("đã tồn tại") ||
    text.includes("already exists") ||
    text.includes("already in use") ||
    text.includes("duplicate") ||
    text.includes("mất kết nối") ||
    text.includes("network") ||
    text.includes("timeout") ||
    text.includes("hết hạn") ||
    text.includes("unauthorized") ||
    text.includes("tài khoản hoặc mật khẩu") ||
    text.includes("sai mật khẩu") ||
    (text.includes("không đúng") &&
      (text.includes("tài khoản") || text.includes("mật khẩu") || text.includes("đăng nhập")))
  ) {
    return null;
  }

  
  if (
    text.includes("xác nhận mật khẩu") ||
    text.includes("mật khẩu xác nhận") ||
    text.includes("confirm password") ||
    text.includes("mật khẩu không khớp") ||
    text.includes("password does not match") ||
    text.includes("passwords do not match")
  ) {
    return "confirmPassword";
  }

  if (
    text.includes("mật khẩu") ||
    text.includes("password") ||
    text.includes("ít nhất 6") ||
    text.includes("tối thiểu 6")
  ) {
    return "password";
  }

  if (
    text.includes("họ và tên") ||
    text.includes("họ tên") ||
    text.includes("full name") ||
    text.includes("fullname")
  ) {
    return "fullName";
  }

  if (text.includes("số điện thoại") || text.includes("phone") || text.includes("mobile")) {
    return "phone";
  }

  if (text.includes("email")) {
    return "email";
  }

  if (text.includes("vai trò") || text.includes("role")) {
    return "roleId";
  }

  if (
    text.includes("identifier") ||
    text.includes("tên đăng nhập") ||
    text.includes("email hoặc số điện thoại")
  ) {
    return "identifier";
  }

  return null;
}

function setFieldErrorIfEmpty(fieldErrors: FieldErrors, field: FieldKey, message: string) {
  if (!fieldErrors[field]) {
    fieldErrors[field] = message;
  }
}


export function parseApiErrors(err: unknown): ParsedApiErrors {
  const fieldErrors: FieldErrors = {};
  const generalMessages: string[] = [];

  const pushMessage = (msg: unknown) => {
    const text = firstMessage(msg);
    if (!text) return;

    const field = classifyMessageToField(text);
    if (field) {
      setFieldErrorIfEmpty(fieldErrors, field, text);
    } else {
      generalMessages.push(text);
    }
  };

  try {
    if (err instanceof ApiError) {
      const data = err.data as Record<string, unknown> | null | undefined;
      const errors = data?.errors;

      
      
      if (errors && typeof errors === "object" && !Array.isArray(errors)) {
        Object.entries(errors as Record<string, unknown>).forEach(([rawKey, value]) => {
          const message = firstMessage(value);
          if (!message) return;

          const fieldFromKey = normalizeFieldKey(rawKey);
          if (fieldFromKey) {
            setFieldErrorIfEmpty(fieldErrors, fieldFromKey, message);
            return;
          }

          
          const fieldFromMessage = classifyMessageToField(message);
          if (fieldFromMessage) {
            setFieldErrorIfEmpty(fieldErrors, fieldFromMessage, message);
            return;
          }

          generalMessages.push(message);
        });
      } else if (Array.isArray(errors)) {
        
        errors.forEach((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            const obj = item as Record<string, unknown>;
            const message =
              firstMessage(obj.message) ||
              firstMessage(obj.errorMessage) ||
              firstMessage(obj.error) ||
              firstMessage(obj.description);

            if (!message) return;

            const rawKey = String(
              obj.propertyName ?? obj.field ?? obj.key ?? obj.name ?? obj.code ?? "",
            );
            const fieldFromKey = rawKey ? normalizeFieldKey(rawKey) : null;
            if (fieldFromKey) {
              setFieldErrorIfEmpty(fieldErrors, fieldFromKey, message);
              return;
            }

            pushMessage(message);
            return;
          }

          pushMessage(item);
        });
      }

      
      
      if (Object.keys(fieldErrors).length === 0) {
        if (typeof data?.message === "string" && data.message.trim()) {
          pushMessage(data.message);
        } else if (typeof data?.title === "string" && data.title.trim()) {
          
          const detail =
            typeof data?.detail === "string" && data.detail.trim() ? data.detail : data.title;
          pushMessage(detail);
        } else if (typeof err.message === "string" && err.message.trim()) {
          
          
          err.message
            .split(/\.\s+/)
            .map((part) => part.trim())
            .filter(Boolean)
            .forEach((part) => pushMessage(part));
        }
      }

      
      const fieldValues = new Set(Object.values(fieldErrors).filter(Boolean));
      const uniqueGeneral = generalMessages.filter((msg) => !fieldValues.has(msg));

      return {
        fieldErrors,
        generalError: uniqueGeneral[0] || null,
      };
    }

    if (err instanceof Error && err.message.trim()) {
      const text = err.message.trim();
      const field = classifyMessageToField(text);
      if (field) {
        return { fieldErrors: { [field]: text }, generalError: null };
      }
      return { fieldErrors: {}, generalError: text };
    }

    const anyErr = err as {
      response?: { data?: { message?: string; title?: string } };
      data?: { message?: string };
      message?: string;
    };

    const nested =
      anyErr?.response?.data?.message ||
      anyErr?.response?.data?.title ||
      anyErr?.data?.message ||
      anyErr?.message;

    if (typeof nested === "string" && nested.trim()) {
      const field = classifyMessageToField(nested);
      if (field) {
        return { fieldErrors: { [field]: nested }, generalError: null };
      }
      return { fieldErrors: {}, generalError: nested };
    }

    return {
      fieldErrors: {},
      generalError: "Đã có lỗi xảy ra",
    };
  } catch {
    return { fieldErrors: {}, generalError: "Đã có lỗi xảy ra" };
  }
}
