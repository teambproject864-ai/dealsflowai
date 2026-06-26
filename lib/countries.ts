export interface Country {
  name: string;
  code: string;
  prefix: string;
  mask: string;
  placeholder: string;
}

export const COUNTRIES: Country[] = [
  { name: "United States", code: "US", prefix: "+1", mask: "(999) 999-9999", placeholder: "(555) 000-0000" },
  { name: "United Kingdom", code: "GB", prefix: "+44", mask: "9999 999999", placeholder: "7911 123456" },
  { name: "India", code: "IN", prefix: "+91", mask: "99999-99999", placeholder: "98765-43210" },
  { name: "Canada", code: "CA", prefix: "+1", mask: "(999) 999-9999", placeholder: "(555) 000-0000" },
  { name: "Australia", code: "AU", prefix: "+61", mask: "9 9999 9999", placeholder: "4 1234 5678" },
  { name: "Germany", code: "DE", prefix: "+49", mask: "9999 999999", placeholder: "170 1234567" },
  { name: "France", code: "FR", prefix: "+33", mask: "9 99 99 99 99", placeholder: "6 12 34 56 78" },
  { name: "Singapore", code: "SG", prefix: "+65", mask: "9999-9999", placeholder: "8123-4567" },
  { name: "United Arab Emirates", code: "AE", prefix: "+971", mask: "99 999 9999", placeholder: "50 123 4567" },
  { name: "Brazil", code: "BR", prefix: "+55", mask: "99 99999-9999", placeholder: "11 98765-4321" },
  { name: "Japan", code: "JP", prefix: "+81", mask: "99-9999-9999", placeholder: "90-1234-5678" },
  { name: "South Africa", code: "ZA", prefix: "+27", mask: "99 999 9999", placeholder: "82 123 4567" }
];

/**
  * Formats a raw input string based on a mask format.
  * Only '9' characters in the mask are replaced with digits from the input.
  */
export function formatPhoneNumber(value: string, mask: string): string {
  const digits = value.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === "9") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
}

/**
  * Validates that the formatted phone number has the correct number of digits as defined by the country mask.
  */
export function isPhoneValid(value: string, mask: string): boolean {
  const requiredDigits = (mask.match(/9/g) || []).length;
  const actualDigits = value.replace(/\D/g, "").length;
  return actualDigits === requiredDigits;
}
