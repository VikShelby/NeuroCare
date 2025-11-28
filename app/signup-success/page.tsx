export default function SignupSuccessPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
  return null;
}
