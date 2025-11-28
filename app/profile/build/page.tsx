export default function LegacyProfileBuildRedirect() {
  if (typeof window !== "undefined") {
    window.location.replace("/onboarding/role");
  }
  return null;
}
