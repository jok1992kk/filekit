const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the real provider against the SDK boundary without creating accounts
// or sending requests/mail. No production environment or credentials are used.
const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, "../lib/auth/supabase.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

const signedIn = {
  data: { user: { id: "fixture-user" }, session: { access_token: "fixture-token" } },
  error: null,
};
const profile = {
  id: "fixture-user", email: "fixture@example.com", full_name: "Fixture",
  plan: "free", billing_cycle: "monthly", tokens_subscription: 25,
  tokens_purchased: 0, renews_on: "2026-11-17", created_at: "2026-10-17",
};

function provider({ authResult = signedIn, profileResult = { data: profile, error: null }, failure } = {}) {
  const logs = [];
  const exports = {};
  const query = {};
  query.select = query.eq = () => query;
  query.maybeSingle = async () => profileResult;
  const call = async () => authResult;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "@/lib/supabase/auth-client") return {
        createAuthClient() {
          if (failure) throw failure;
          return { auth: { signUp: call, signInWithPassword: call } };
        },
      };
      if (name === "@/lib/supabase/admin") return {
        createAdminClient: () => ({ from: () => query }),
      };
      throw new Error(`Unexpected import: ${name}`);
    },
    console: { error: (...args) => logs.push(args) },
  });
  return { auth: exports.supabaseAuth, logs };
}

const input = { email: "fixture@example.com", password: "unused-fixture", fullName: "Fixture" };

test("valid sign-in preserves the existing session and balances", async () => {
  const result = await provider().auth.signIn(input);
  assert.equal(result.ok, true);
  assert.equal(result.token, "fixture-token");
  assert.equal(result.user.tokensSubscription, 25);
});

test("only invalid credentials are reported as an incorrect password", async () => {
  const { auth } = provider({ authResult: { data: {}, error: { code: "invalid_credentials", status: 400 } } });
  assert.equal((await auth.signIn(input)).error, "Email or password is incorrect.");
});

for (const error of [
  { code: "invalid_api_key", status: 401 },
  { name: "AuthRetryableFetchError", status: 0 },
  { code: "unexpected_failure", status: 503 },
]) {
  test(`service failure ${error.code ?? error.name} never becomes a password error`, async () => {
    const { auth } = provider({ authResult: { data: {}, error } });
    assert.match((await auth.signIn(input)).error, /Authentication is temporarily unavailable/);
  });
}

test("unconfirmed email has an actionable message", async () => {
  const { auth } = provider({ authResult: { data: {}, error: { code: "email_not_confirmed", status: 400 } } });
  assert.match((await auth.signIn(input)).error, /Confirm your email/);
});

test("rate limiting tells the customer to wait", async () => {
  const { auth } = provider({ authResult: { data: {}, error: { status: 429 } } });
  assert.match((await auth.signIn(input)).error, /Too many sign-in attempts/);
});

for (const profileResult of [{ data: null, error: null }, { data: null, error: { code: "PGRST205" } }]) {
  test(`profile ${profileResult.error ? "outage" : "missing"} does not accuse the customer of a wrong password`, async () => {
    const { auth } = provider({ profileResult });
    assert.match((await auth.signIn(input)).error, /account could not be loaded/);
  });
}

test("missing session is a service failure", async () => {
  const { auth } = provider({ authResult: { data: {}, error: null } });
  assert.match((await auth.signIn(input)).error, /Authentication is temporarily unavailable/);
});

for (const method of ["signIn", "signUp"]) {
  test(`${method} handles thrown configuration failures without logging secrets`, async () => {
    const { auth, logs } = provider({ failure: new Error("secret-key-and-email@example.com") });
    const result = await auth[method](input);
    assert.equal(result.ok, false);
    assert.match(result.error, /temporarily unavailable/);
    assert.doesNotMatch(JSON.stringify(logs), /secret-key|email@example.com|unused-fixture/);
  });
}

test("sign-up upstream outage returns a safe error", async () => {
  const { auth } = provider({ authResult: { data: {}, error: { status: 503, message: "private upstream details" } } });
  assert.match((await auth.signUp(input)).error, /temporarily unavailable/);
});

test("sign-up still returns validation errors", async () => {
  const { auth } = provider({ authResult: { data: {}, error: { status: 422, message: "Password is too weak." } } });
  assert.equal((await auth.signUp(input)).error, "Password is too weak.");
});

test("valid sign-up preserves the signup bonus", async () => {
  const result = await provider().auth.signUp(input);
  assert.equal(result.ok, true);
  assert.equal(result.user.tokensSubscription, 25);
});
