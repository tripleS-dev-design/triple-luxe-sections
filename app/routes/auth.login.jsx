// app/routes/auth.login.jsx
export const loader = async ({ request }) => {
  const { login } = await import("../shopify.server");
  return login(request);
};

export default function AuthLogin() {
  return null;
}
