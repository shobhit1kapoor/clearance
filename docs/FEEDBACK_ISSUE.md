# Published feedback issue

https://github.com/hashgraph/hedera-agent-kit-js/issues/947

**Repository:** `hashgraph/hedera-agent-kit-js`

**Title:** Fix v4 Hooks and Policies documentation templates to match the published JavaScript method signatures

## Problem

The rendered JavaScript “Creating New Hooks/Policies” examples show hook and policy overrides with three arguments:

```ts
preToolExecutionHook(context, params, method)
shouldBlockPostParamsNormalization(context, params, method)
```

In `@hashgraph/hedera-agent-kit@4.0.0`, `AbstractHook` and `AbstractPolicy` expose two-argument methods:

```ts
preToolExecutionHook(params, method)
shouldBlockPostParamsNormalization(params, method)
```

The `Context` is available as `params.context`. Copying the rendered template produces a TypeScript override error. The page also shows built-in hooks and policies imported from the package root, while the v4 package exports them from `/hooks` and `/policies` subpaths.

## Suggested change

1. Update the templates to use `(params, method)` and read `params.context`.
2. Update built-in imports to `@hashgraph/hedera-agent-kit/hooks` and `@hashgraph/hedera-agent-kit/policies`.
3. Add a small compile-tested documentation example to CI so public templates remain aligned with published declarations.

## Why this matters

Hooks and Policies are security boundaries. Compile-ready examples reduce the chance that developers bypass `BaseTool` or override the wrong framework methods while attempting to implement runtime enforcement.
