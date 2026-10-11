---
title: "Why Regex Serialization Changed in Elixir 1.19/OTP 28"
date: 2026-01-02T03:13Z
---

When upgrading to Elixir 1.19 with Erlang/OTP 28, the deployment failed with a cryptic error:

```
** (Mix) Could not write configuration file because it has invalid terms

Application: :cors_plug
Key: :origin
Invalid value: ~r/.*\.jumpcomedy\.com$/
Reason: you must use the /E modifier to store regexes
```

The fix was simple - just add one characters:

```
config :cors_plug,
-  origin: ~r/.*\.jumpcomedy\.com$/
+  origin: ~r/.*\.jumpcomedy\.com$/E
```

But why did this break? And what does that /E actually do?

When you deploy an Elixir application, the build process creates a _release_, which is a packaged version of your app that includes all your code and configuration pre-compiled and ready to run (like a JAR in Java).

For this to work, Elixir needs to serialize your configuration into a format that can be stored on disk and loaded later. Erlang/OTP 28 has introduced runtime optimizations but to benefit from them, regexes need to be stored differently on disk than how they're represented in code.

The /E modifier tells Elixir: "Convert this regex to a format that can be stored in releases."

Without /E:

-   Your regex works fine in development (running with `mix phx.server`)
-   Your regex works fine when running tests
-   Your regex fails when building a production release

With /E:

-   Your regex works everywhere, including in releases

/E stands for "external term format" and ensures the regex can be packaged for deployment. In our case, we were using a regex in our CORS configuration:

```
config :cors_plug,
  origin: ~r/.*\.jumpcomedy\.com$/E
```

This lives in `config/runtime.exs`, which gets evaluated when the release starts up. For that to work, the regex needs to be in a format that can be saved to the release bundle, hence the need for /E.

You need the /E modifier when:

1.  Using regexes in application configuration (like we did with CORS)
2.  Storing regexes in struct defaults (though Elixir 1.19 now prevents this entirely - see the [release notes](https://hexdocs.pm/elixir/changelog.html#v1-19-0-2025-10-16))
3.  Any place where the regex will be serialized into a release

You don't need /E when:

-   Using regexes in your runtime code (pattern matching, validations, etc.)
-   Using regexes in tests
-   Using regexes that are created dynamically at runtime

Elixir 1.19's stricter handling of regexes reflects Erlang/OTP 28's more sophisticated internal representation. While it requires updating configuration files, it's a small price to pay for the performance improvements.
