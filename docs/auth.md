Use **Better Auth** for this project.

Why:

- It is TypeScript-native.
- It works well with your Next.js/NestJS/Prisma stack.
- It supports email/password, social login, 2FA, passkeys, and organization-style plugins. ([Better Auth][1])
- It keeps the project easier to self-host than Auth0/Clerk.
- It is lighter than Keycloak for an early open-source marketplace.

## Recommended auth model

```txt
User
  ├── CustomerProfile
  ├── ProviderProfile
  └── AdminRole
```

Do **not** create separate login systems for customers, providers, and admins.

Use one `User` table, then assign roles:

```txt
customer
provider
admin
super_admin
```

A provider is just a user with an attached provider profile.

## Good first version

For Milestone 1:

```txt
email + password
session cookies
basic roles
```

Skip OAuth, passkeys, 2FA, organizations, and SSO until later.

## When to use Keycloak instead

Use **Keycloak** only if your main goal is enterprise IAM, SSO, realms, LDAP/Active Directory, or large-company deployments. It is powerful and open source, but heavier operationally. Keycloak provides SSO, identity brokering, social login, user federation, and fine-grained authorization. ([Keycloak][2])

## My recommendation

For MetaMarket:

```txt
Milestone 1: no auth or simple Better Auth
Milestone 2: customer/provider login
Milestone 3: role-based access control
Milestone 4: provider onboarding
Milestone 5: admin permissions
```

Add this to your Codex prompt:

```text
Use Better Auth for authentication. Implement a single User identity model with role-based access for customer, provider, admin, and super_admin. For Milestone 1, only wire email/password login and session-based auth. Do not create separate auth systems for customer and provider.
```

[1]: https://better-auth.com/?utm_source=chatgpt.com "Better Auth"
[2]: https://www.keycloak.org/index.html?utm_source=chatgpt.com "Keycloak"
