export interface FormState {
  hotelName: string;
  fullName?: string;
  email: string;
  password: string;
  confirmPassword: string;
  hotelAddress?: string;
  hotelLicenseNumber: string;
}

export class FormValidator {
  private form: FormState;

  constructor(form: FormState) {
    this.form = form;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateField(field: keyof FormState, value: string): string {
    if (field === "email") {
      if (!value.trim()) {
        return "Email is required";
      }
      if (!this.validateEmail(value)) {
        return "Please enter a valid email address";
      }
    }

    if (field === "confirmPassword") {
      if (value !== this.form.password) {
        return "Passwords do not match";
      }
    }

    return "";
  }
}
