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

  getPasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return Math.min(strength, 5);
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

  validateForm(): { global?: string } {
    if (!this.form.password || !this.form.confirmPassword) {
      return { global: "Please fill in all fields" };
    }

    if (this.form.password !== this.form.confirmPassword) {
      return { global: "Passwords do not match" };
    }

    if (this.getPasswordStrength(this.form.password) < 4) {
      return { global: "Password is not strong enough" };
    }

    return {};
  }
}
