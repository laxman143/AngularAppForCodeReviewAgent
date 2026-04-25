---
name: angular-code-reviewer-agent
description: "Review staged Angular (v17+) code changes. Checks for bugs, security issues, Angular best practices, TypeScript quality, RxJS usage, templates, accessibility, and performance. Reviews git-staged files only and does not require GitHub, GitLab, or PR links."
---

# Angular Code Reviewer Instructions

This file is the single source of truth for Angular PR review guidance in this repository.

## 1. Scope

### 1.1 Changed Lines Only

- Run all review rules only on added or modified lines.
- Each suggestion must directly correspond to a changed line.
- Do not review the entire file.
- Do not suggest improvements outside the diff scope.
- If a change affects nearby logic, you may reference minimal surrounding context, but:
  - Do not review or suggest fixes for unchanged lines.
  - Keep focus on the changed lines only.

### 1.2 File-Type-Specific Review

- For each file, extract and apply only the section or sections of this file that match the file type being reviewed.
- Use the relevant section for the current file type, for example:
  - Components and Services for `*.ts`
  - Templates for `*.html`
  - SCSS for `*.scss`
- Ignore unrelated sections for the current file type.

### 1.3 Line Number Accuracy

- Always use the actual changed line numbers from the diff or review context.
- Report line numbers using the post-change file line numbers for added or modified code.
- Do not guess, estimate, or invent line numbers.
- Do not cite unchanged lines just to anchor a comment.
- If a review tool provides a changed line range, use that exact range.
- If an issue spans multiple adjacent changed lines, report the smallest accurate line range.
- If an exact single line cannot be determined from the available diff context, report the exact changed-line range in the file.
- The only valid fallbacks are:
  - an exact single line number, for example `LINE 128`
  - an exact file line range, for example `LINE 128-133`
- Do not use vague placeholders such as `LINE unknown`, `LINE changed-range`, `LINE around 128`, or `LINE hunk`.
- If the available context does not contain enough information to determine an exact line or exact range, do not invent one. State that exact line mapping is unavailable from the provided diff context.

### 1.4 Diff-Based Line Mapping Workflow

- Before reviewing, read the staged diff for the file and derive line numbers from the diff hunk headers.
- Use unified diff hunk headers in the form `@@ -<oldStart>,<oldCount> +<newStart>,<newCount> @@` as the source of truth for line mapping.
- Track the new-file line number while walking each hunk:
  - a context line (` `) increments both old and new line counters
  - a removed line (`-`) increments only the old line counter
  - an added line (`+`) increments only the new line counter and is the line that may be cited in review output
- For modified code, cite the added or resulting new-file line numbers, not the removed-line numbers.
- If a finding applies to several consecutive added lines in one hunk, report the exact new-file range that covers those added lines.
- Never derive review line numbers from raw file contents alone when diff hunk metadata is available.
- Never use editor selection positions, rendered markdown line positions, or copied snippet offsets as review line numbers.
- If the diff tool and the file view disagree, trust the staged diff line mapping.
- If no staged diff hunk metadata is available, do not claim an exact line number. Use the exact changed file range only if that range is provided by the review context.

## 2. Required Review Output

### 2.1 Default Review Format

When reviewing a file, always generate a line-wise actionable review.

- For every issue, specify the exact file and line number or numbers.
- Do not output any issue without a `LINE` reference.
- Do not combine multiple findings into one block if they point to different lines.
- Repeat the file and line reference for every separate finding.
- Each finding must use either one exact line number or one exact file line range.
- Use this format, with the LINE reference as a clickable markdown link:

```text
[FILE] <relative-path>
[LINE <number>](<relative-path>#L<number>) - [MUST|SHOULD|NICE] Issue description
Suggested Fix:
<exact code change or code snippet>
```

```text
[FILE] <relative-path>
[LINE <start>-<end>](<relative-path>#L<start>-L<end>) - [MUST|SHOULD|NICE] Issue description
Suggested Fix:
<exact code change or code snippet>
```

- For multiple issues in the same file, use separate blocks, for example:

```text
[FILE] src/app/example.component.ts
[LINE 42](src/app/example.component.ts#L42) - [MUST] Missing subscription teardown.
Suggested Fix:
this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);

[FILE] src/app/example.component.ts
[LINE 57](src/app/example.component.ts#L57) - [SHOULD] Variable is never reassigned.
Suggested Fix:
const status = this.getStatus();
```

- Show the original code or describe the issue at that line.
- Show the exact replacement code or code change needed, in place, as it should appear after the fix.
- Ensure the `LINE` value matches the changed line number in the current diff context.
- If a range is needed, use `LINE <start>-<end>`.
- If the exact single line cannot be resolved confidently, use the exact changed file range instead.
- Never output placeholder text in the `LINE` field.
- Prefer the narrowest exact range that still covers the issue.
- Do not place summary bullets, section bullets, or unlabeled findings before the first `[FILE]` and `LINE` block unless a summary was explicitly requested.
- If a full review summary is explicitly requested, keep summaries separate from findings and still include a `[FILE]` and `LINE` block for every actionable issue.
- Repeat this for every relevant rule, including but not limited to:
  - change detection
  - typing
  - `setTimeout`
  - `track` or `trackBy`
  - code style
  - accessibility
  - security
  - performance
- Do not generate executive summaries or consulting-style reports unless explicitly requested.
- Always provide direct, actionable code fixes for each issue.

### 2.2 If a Full Review Summary Is Explicitly Requested

Return a single review containing these sections:

- Summary - what changed and the high-level risks
- Must-fix - blocking issues such as security, correctness, and broken builds
- Should-fix - quality, performance, accessibility, and maintainability
- Nice-to-have - nits and polish
- Tests and Coverage - what tests are missing or need updates
- Security checklist - quick pass using the security rules below
- Auto-fix suggestions - inline code suggestions where trivial

Use labels `[MUST]`, `[SHOULD]`, and `[NICE]` at the start of bullets, and state whether the PR is ready to merge or blocked.

## 3. General Standards

- Prefer clarity and safety over clever micro-optimizations.
- Call out dead code, large functions, missing documentation, and unclear naming when those issues are introduced by the changed lines.
- Respect the repository's ESLint and Prettier conventions.
- Ensure changes build and test successfully. Suggest running:
  - `npm run build`
  - `npm run lint`
  - `ng test --watch=false --code-coverage`
- Suggest framework migrations only if the repository version supports them.

## 4. Angular-Specific Expectations

### 4.1 Templates (`*.html`)

#### 4.1.1 Control Flow (Angular 17+)

- Prefer `@if`, `@for`, and `@switch` only when the changed code already targets Angular 17+ syntax.
- Require `@for` to include a `track` expression to avoid DOM churn.
- If the repository or changed file still uses structural directives intentionally, do not force migration in unrelated lines.

#### 4.1.2 List Rendering Performance

- Call out missing `track` or `trackBy` on repeated templates.
- Call out repeated method calls, allocations, or expensive pipes inside loops.
- Call out inline object or array literals inside bindings that create unstable identities.

#### 4.1.3 Async Data

- Prefer the `async` pipe in templates instead of manual `.subscribe()` in components where feasible.
- Verify null, loading, error, and empty states are handled when the changed lines affect async rendering.

#### 4.1.4 Accessibility

- Check for missing labels, roles, `aria-*` attributes, alt text, and potential keyboard traps.
- Interactive non-semantic elements must expose keyboard support and an accessible name.
- Form inputs must be associated with a visible label or an equivalent accessible label.

#### 4.1.5 Template Safety

- Call out direct `[innerHTML]` bindings unless the changed lines clearly sanitize trusted content.
- Call out unguarded deep property access in templates when changed lines can evaluate before data arrives.

### 4.2 Components and Services (`*.ts`)

#### 4.2.1 Change Detection

- Encourage `ChangeDetectionStrategy.OnPush` for leaf or mostly input-driven components introduced or modified by the diff.
- Prefer immutable updates and stable list identities.

#### 4.2.2 Variable Declarations

- Prefer `const` for variables that are never reassigned.
- Use `let` only when reassignment is necessary.
- Avoid `var`.

Standard review comment. Use exactly this:

> **Use `const` instead of `let` or `var`**
> This variable is never reassigned. Change `let` or `var` to `const` for immutability and clarity.

#### 4.2.3 Optional Chaining

- Always use optional chaining (`?.`) when accessing nested object properties that may be `null` or `undefined`.

Standard review comment. Use exactly this:

> **Optional chaining missing**
> This property access may fail if any part of the chain is `null` or `undefined`.
> Use optional chaining (`?.`) to safely access nested properties.
> Example: Change `user.address.city` to `user?.address?.city`.

#### 4.2.4 Subscriptions

- Prefer `takeUntilDestroyed()` (Angular 16+) or the `async` pipe.
- If manual `.subscribe()` is used, it must include a teardown operator.
- Valid teardown patterns:
  - `pipe(takeUntil(this.onDestroy$))`
  - `pipe(takeUntilDestroyed(this.destroyRef))`
  - `pipe(takeUntilDestroyed())` when an injection context is valid

Standard review comment. Use exactly this:

> **Subscription teardown missing**
> This `.subscribe()` is not using a teardown pattern. Add one of the following:
> - `pipe(takeUntilDestroyed(this.destroyRef))`
> - `pipe(takeUntil(this.onDestroy$))`
> Or remove manual `.subscribe()` and use the `async` pipe.

#### 4.2.5 Avoid `setTimeout`

- Do not use `setTimeout` for component or service timing logic.
- Prefer `asyncScheduler.schedule`, `timer`, `delay`, or lifecycle-safe Angular and RxJS primitives.

#### 4.2.6 Signals and Angular 17+ Reactivity

- Prefer `signal`, `computed`, and `effect` for local component state introduced in Angular 17+ code paths, especially when the state is synchronous and UI-local.
- Call out writable state spread across multiple mutable class properties when the changed lines would be clearer as a single signal model.
- Ensure `effect` usage does not introduce hidden writes or circular updates.
- Do not recommend signals when the existing file consistently uses RxJS for async orchestration unless the changed lines already begin that migration.

#### 4.2.7 Angular 17+ Inputs and Outputs

- Prefer the functional `input()` and `output()` APIs in newly introduced Angular 17+ standalone-style code if that style is already present in the file.
- Call out `@Input()` setters with side effects when a `computed` or explicit method would be clearer.
- Call out event emitters that expose `any` payloads or ambiguous names.

#### 4.2.8 Dependency Injection

- Prefer `inject()` in Angular 17+ code when the file already uses it or when adding new dependencies to a class with little constructor logic.
- Avoid injecting unused services.
- Call out constructor work that performs data fetching, imperative subscriptions, or complex branching.

#### 4.2.9 TypeScript Quality

- Call out `any`, broad type assertions, non-null assertions (`!`) used without an obvious invariant, and unsafe casts in changed lines.
- Prefer explicit interfaces or type aliases for non-trivial object shapes created in the diff.
- Call out unions that are not narrowed before use.

### 4.3 Angular 17+ Feature Guidance

#### 4.3.1 Deferrable Views

- Consider `@defer` for newly introduced heavy or below-the-fold UI sections when that suggestion directly relates to the changed lines.
- Review `@placeholder`, `@loading`, and `@error` branches for user-visible fallbacks.
- Do not suggest `@defer` for trivial fragments or critical above-the-fold content.

#### 4.3.2 Standalone and Feature Boundaries

- If the changed code introduces a new Angular 17+ component, verify whether the local pattern uses standalone components and imports.
- Do not force standalone migration for unrelated existing NgModule code.

#### 4.3.3 Hydration and SSR Safety

- Check whether the changed lines directly access `window`, `document`, `localStorage`, `sessionStorage`, or browser-only globals without environment guards.
- Prefer Angular platform checks for code that may run during prerender or hydration.

### 4.4 Code Style and Hygiene

- Call out use of `any`.
- Call out `// @ts-ignore`.
- Call out stray `console.log` in production code.
- Call out `alert` or `window.alert` usage.
- Prefer small, pure methods.
- Prefer minimal work in constructors.
- Avoid tight coupling and unused injections.

### 4.5 SCSS (`*.scss`)

- Avoid `::ng-deep` or `ng-deep`.
- Prefer component scoping, global styles, CSS variables, or `:host` and `:host-context`.

### 4.6 Angular Naming and Structure Standards

- Prefer hyphen-separated file names.
- Match file names to the main TypeScript identifier or feature in the file.
- Use the same base name for a component's TypeScript, template, and style files.
- Use `.spec.ts` for unit test files.
- Organize code by feature area rather than by technical type.
- Keep related files in the same directory.
- Prefer one primary concept per file.
- Keep unit tests close to the code under test.

## 5. Security Standards

Apply these only when the changed lines are relevant.

- Keep this section limited to Angular templates, TypeScript component or service code, HTML bindings, CSS or SCSS-related bindings, and API consumption patterns used by the frontend.
- Do not apply generic backend, infrastructure, or non-frontend security rules here.

### 5.1 DOM and Content Safety

- Call out raw `innerHTML`, `outerHTML`, dynamic HTML string concatenation, direct DOM writes, or `nativeElement` DOM mutation writes in changed Angular component or directive code.
- Call out use of `DomSanitizer.bypassSecurityTrustHtml`, `bypassSecurityTrustStyle`, `bypassSecurityTrustUrl`, and `bypassSecurityTrustResourceUrl` unless the changed code documents a narrow, validated trust boundary.
- Check whether template bindings push untrusted values into HTML, style, URL, or resource URL contexts.
- Prefer Angular-safe bindings, escaping, validated server content, or a narrowly scoped trusted-content abstraction.

Bad example: direct DOM write via `nativeElement`

```typescript
@ViewChild('container') container!: ElementRef;

ngOnInit() {
  // user.bio comes from an API and may contain untrusted HTML
  this.container.nativeElement.innerHTML = this.user.bio;
}
```

Bad example: bypassing `DomSanitizer` without a documented trust boundary

```typescript
constructor(private sanitizer: DomSanitizer) {}

getSafeHtml(raw: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(raw);
}
```

Bad example: untrusted value pushed into an HTML binding

```html
<div [innerHTML]="userSuppliedHtml"></div>
```

Good example: let Angular sanitize plain interpolation

```html
<div>{{ userComment }}</div>
```

Good example: `bypassSecurityTrustHtml` only after narrow validation

```typescript
// Only content already validated and allowlisted server-side is trusted here.
getSafeHtml(serverRenderedHtml: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(serverRenderedHtml);
}
```

### 5.2 Router and Client Input Handling

- Check whether the changed lines consume route params, query params, form values, local storage, or session storage without validation or normalization.
- Call out direct propagation of untrusted input into router navigation targets, template HTML, style bindings, URLs, or API payloads.
- Prefer explicit parsing and validation for ids, enums, booleans, dates, and numbers.

Bad example: query param passed directly into router navigation

```typescript
const returnUrl = this.route.snapshot.queryParams['returnUrl'];
this.router.navigateByUrl(returnUrl);
```

Good example: parse and validate before use

```typescript
ngOnInit() {
  const raw = this.route.snapshot.paramMap.get('id');
  const id = parseInt(raw ?? '', 10);

  if (isNaN(id) || id <= 0) {
    this.router.navigate(['/not-found']);
    return;
  }

  this.userService.getUser(id).subscribe(...);
}
```

Good example: allowlist-based return URL validation

```typescript
const raw = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
const returnUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
this.router.navigateByUrl(returnUrl);
```

### 5.3 HTTP and API Safety

- Call out `HttpClient` calls that build URLs, query strings, headers, or request bodies via unsafe string concatenation with untrusted input.
- Check whether the changed lines skip error handling, status handling, or response-shape validation for security-sensitive or permission-sensitive API flows.
- Verify mutation requests rely on the repository's existing auth and XSRF protections where applicable.
- Call out secrets, tokens, API keys, or sensitive identifiers committed in changed lines.
- Call out open redirect patterns such as passing unvalidated return URLs, redirect targets, or external URLs from query params directly into Angular router navigation.
- Check whether the changed lines trust client-controlled identifiers for authorization-sensitive requests without clear server-side validation assumptions.

Bad example: URL built with string concatenation and untrusted input

```typescript
const url = `/api/products?search=` + this.searchTerm;
this.http.get(url).subscribe(...);
```

Bad example: secret committed directly in source

```typescript
private readonly apiKey = 'sk-prod-abc123XYZ';
```

Bad example: permission-sensitive call with no error or status handling

```typescript
this.http.post('/api/admin/promote', { userId }).subscribe(res => {
  this.showSuccess();
});
```

Good example: use `HttpParams` for safe query construction

```typescript
const params = new HttpParams().set('search', this.searchTerm);
this.http.get('/api/products', { params }).subscribe(...);
```

Good example: secrets via environment configuration, not source

```typescript
export const environment = {
  apiBase: 'https://api.example.com'
};
```

Good example: explicit error handling for sensitive flows

```typescript
this.http.post('/api/admin/promote', { userId }).subscribe({
  next: () => this.showSuccess(),
  error: (err) => {
    if (err.status === 403) {
      this.showUnauthorized();
    } else {
      this.showGenericError();
    }
  }
});
```

### 5.4 Sensitive Data Exposure

- Call out logging of tokens, passwords, user profile data, PII, or full backend error payloads via `console.log`, `console.error`, or similar.
- Check whether the changed lines store secrets or sensitive payloads in `localStorage` or `sessionStorage` when a safer existing frontend pattern is available.
- Prefer redaction and least-privilege payload handling.
- Call out plaintext persistence of auth tokens, refresh tokens, or impersonation context in browser storage when the changed lines introduce or expand that behavior.
- Check whether templates render raw backend error details or sensitive API response fields directly to the UI without filtering.

Bad example: logging a token or PII

```typescript
this.authService.login(credentials).subscribe(res => {
  console.log('Login response:', res);
  this.tokenService.store(res.access_token);
});
```

Bad example: storing an auth token in `localStorage`

```typescript
localStorage.setItem('auth_token', response.access_token);
```

Bad example: rendering raw backend error details in the template

```html
<div>{{ err.message }}</div>
```

Good example: log only a safe, redacted signal

```typescript
this.authService.login(credentials).subscribe({
  next: () => console.log('Login succeeded'),
  error: (err) => console.warn('Login failed, status:', err.status)
});
```

Good example: use the repository's existing token storage abstraction

```typescript
this.tokenService.store(response.access_token);
```

Good example: show only a safe, user-facing message

```html
<div>{{ userFacingErrorMessage }}</div>
```

### 5.5 Authorization and UI Guards

- Check whether the changed lines gate sensitive UI only in Angular templates, CSS visibility, or client-side flags without corresponding route guard or backend enforcement assumptions.
- Call out privilege checks implemented purely with mutable client-side flags when the change claims to enforce security.

Bad example: hiding UI with `*ngIf` as the only enforcement

```typescript
this.isAdmin = this.tokenService.decode().role === 'admin';
```

```html
<button *ngIf="isAdmin" (click)="deleteUser()">Delete User</button>
```

Bad example: CSS-only visibility as a security gate

```html
<button [style.display]="isAdmin ? 'block' : 'none'" (click)="deleteUser()">
  Delete User
</button>
```

Good example: UI gating for UX only, with real server-side enforcement

```typescript
// auth.guard.ts enforces the route at the Angular level.
// The API independently checks authorization server-side.
```

```html
<button *ngIf="isAdmin" (click)="deleteUser()">Delete User</button>
```

> Note: Client-side guards such as `*ngIf` and `CanActivate` are UX conveniences. Security depends on the backend rejecting unauthorized API requests. Document this assumption in the code review when raising or dismissing this rule.

## 6. Performance Standards

Apply these only when the changed lines are relevant.

### 6.1 Template Performance

- Call out methods, getters with work, object creation, array creation, or JSON serialization in bindings.
- Call out repeated pipes inside large loops when results could be precomputed.
- Require `track` for signals-based `@for`, or `trackBy` for `*ngFor`, on repeated UI.
- Suggest `NgOptimizedImage` for changed image-heavy views when the repository already supports it.
- Call out `async` pipe used multiple times on the same observable in a template, because each use creates an independent subscription.

Bad example: method call in a binding

```html
<div>{{ getFullName(user) }}</div>
<div>{{ items.filter(i => i.active).length }} active</div>
```

Good example: derive once in the component and bind to a field

```typescript
fullName = `${this.user.firstName} ${this.user.lastName}`;
activeCount = this.items.filter(i => i.active).length;
```

```html
<div>{{ fullName }}</div>
<div>{{ activeCount }} active</div>
```

Bad example: repeated pipe inside a large loop

```html
@for (row of rows; track row.id) {
  <div>{{ row.status | translate }}</div>
}
```

Good example: precompute translated values in the component

```typescript
rows = rawRows.map(row => ({
  ...row,
  statusLabel: this.translate.instant(row.status)
}));
```

```html
@for (row of rows; track row.id) {
  <div>{{ row.statusLabel }}</div>
}
```

Bad example: missing `trackBy` or `track` on a list that mutates

```html
<li *ngFor="let item of items">{{ item.name }}</li>

@for (item of items();) {
  <div>{{ item.name }}</div>
}
```

Good example: stable identity with `trackBy` or `track`

```typescript
trackById(_index: number, item: Item) {
  return item.id;
}
```

```html
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

Bad example: same observable subscribed multiple times with `async`

```html
<div>{{ (user$ | async)?.name }}</div>
<div>{{ (user$ | async)?.email }}</div>
```

Good example: subscribe once with `as`, or share in the service

```html
@if (user$ | async; as user) {
  <div>{{ user.name }}</div>
  <div>{{ user.email }}</div>
}
```

### 6.2 Change Detection and Rendering

- Call out mutable array and object updates that break stable identity assumptions with `OnPush`.
- Call out synchronous work in lifecycle hooks that can block first render.
- Call out unnecessary manual `ChangeDetectorRef.detectChanges()` or `markForCheck()` calls introduced without a clear cause.
- Call out `setInterval`, `setTimeout`, and DOM `addEventListener` registered inside Angular's zone when `NgZone.runOutsideAngular` would avoid unnecessary change detection cycles.
- Call out components with `OnPush` that subscribe to observables imperatively without marking the view dirty.

Bad example: mutating an array reference with `OnPush`

```typescript
addItem(item: Item) {
  this.items.push(item);
}
```

Good example: replace the reference so `OnPush` detects the change

```typescript
addItem(item: Item) {
  this.items = [...this.items, item];
}
```

Bad example: heavy synchronous work in `ngOnInit`

```typescript
ngOnInit() {
  this.tableData = this.csvService.parseHuge(this.rawCsv);
}
```

Good example: defer expensive work until after initial render

```typescript
ngOnInit() {
  requestAnimationFrame(() => {
    this.tableData = this.csvService.parseHuge(this.rawCsv);
    this.cdr.markForCheck();
  });
}
```

Bad example: high-frequency event registered inside Angular's zone

```typescript
ngOnInit() {
  window.addEventListener('mousemove', this.onMouseMove);
}
```

Good example: run outside Angular's zone and re-enter only when needed

```typescript
constructor(private ngZone: NgZone) {}

ngOnInit() {
  this.ngZone.runOutsideAngular(() => {
    window.addEventListener('mousemove', this.onMouseMove);
  });
}

onMouseMove = (event: MouseEvent) => {
  if (this.shouldUpdate(event)) {
    this.ngZone.run(() => {
      this.position = { x: event.clientX, y: event.clientY };
    });
  }
};
```

Bad example: `OnPush` with imperative subscription and no `markForCheck`

```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class StatusComponent implements OnInit {
  status = '';

  ngOnInit() {
    this.statusService.current$.subscribe(status => {
      this.status = status;
    });
  }
}
```

Good example: use `async` or call `markForCheck`

```html
<div>{{ status$ | async }}</div>
```

```typescript
this.statusService.current$.subscribe(status => {
  this.status = status;
  this.cdr.markForCheck();
});
```

### 6.3 RxJS and Async Work

- Call out nested subscriptions in changed lines.
- Prefer flattening operators such as `switchMap`, `concatMap`, or `exhaustMap` based on intent.
- Check whether streams are missing `shareReplay` or caching when the changed lines clearly create duplicated cold subscriptions to the same expensive source.
- Call out manual subscription side effects that could be expressed as a template `async` pipe or signal bridge.
- Call out subscriptions that are never unsubscribed. Components without `takeUntilDestroyed` or an equivalent teardown leak memory and may continue triggering change detection after destruction.

Bad example: nested subscriptions

```typescript
this.route.params.subscribe(params => {
  this.userService.getUser(params['id']).subscribe(user => {
    this.user = user;
  });
});
```

Good example: flatten with the right operator

```typescript
this.route.params
  .pipe(switchMap(params => this.userService.getUser(params['id'])))
  .subscribe(user => {
    this.user = user;
  });
```

Bad example: cold observable subscribed multiple times with no caching

```typescript
get user$() {
  return this.http.get('/api/me');
}
```

```html
<div>{{ (user$ | async)?.name }}</div>
<div>{{ (user$ | async)?.email }}</div>
```

Good example: cache with `shareReplay`

```typescript
user$ = this.http.get('/api/me').pipe(shareReplay(1));
```

Bad example: subscription never unsubscribed

```typescript
export class DashboardComponent implements OnInit {
  ngOnInit() {
    this.dataService.poll$.subscribe(data => {
      this.data = data;
    });
  }
}
```

Good example: use `takeUntilDestroyed` in Angular 16+

```typescript
export class DashboardComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.dataService.poll$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.data = data;
      });
  }
}
```

### 6.4 Bundle and Resource Cost

- Call out newly introduced large third-party imports when a smaller existing utility already exists in the repository.
- Prefer lazy loading for newly introduced heavy feature modules or routes.
- Call out eagerly loaded code paths for admin-only, rarely used, or below-the-fold features.
- Call out missing `@defer` blocks for heavy components that are below the fold, conditionally shown, or interaction-driven.

Bad example: full library imported for one utility function

```typescript
import _ from 'lodash';

const sorted = _.sortBy(this.items, 'name');
```

Good example: import only what is needed, or use a native equivalent

```typescript
import sortBy from 'lodash-es/sortBy';

const sorted = sortBy(this.items, 'name');
const nativeSorted = [...this.items].sort((a, b) => a.name.localeCompare(b.name));
```

Bad example: admin feature eagerly loaded for all users

```typescript
{ path: 'admin', component: AdminDashboardComponent }
```

Good example: lazy load the route

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
}

{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(c => c.AdminComponent)
}
```

Bad example: heavy component rendered eagerly below the fold

```html
<app-report-builder></app-report-builder>
```

Good example: defer loading until needed

```html
@defer (on viewport) {
  <app-report-builder></app-report-builder>
} @placeholder {
  <app-report-builder-skeleton></app-report-builder-skeleton>
}
```

### 6.5 Lists, Tables, and Large Data Sets

- Check whether the changed lines render large collections without pagination, virtualization, or incremental rendering when collection size is likely unbounded.
- Call out in-memory sorting and filtering inside template-driven change detection paths.
- Call out `keyvalue` pipe used on large maps or objects inside loops, because it re-sorts entries on every change detection cycle.

Bad example: unbounded list rendered in full

```html
@for (order of orders; track order.id) {
  <div>{{ order.id }}</div>
  <div>{{ order.total }}</div>
}
```

Good example: paginate or virtualize large collections

```html
<cdk-virtual-scroll-viewport itemSize="48">
  <div *cdkVirtualFor="let order of orders; trackBy: trackById">
    {{ order.id }}
    {{ order.total }}
  </div>
</cdk-virtual-scroll-viewport>
```

Bad example: sorting and filtering on every change detection pass

```typescript
get filteredOrders() {
  return this.orders
    .filter(order => order.status === this.selectedStatus)
    .sort((left, right) => right.total - left.total);
}
```

Good example: recompute only when inputs change

```typescript
onStatusChange(status: string) {
  this.selectedStatus = status;
  this.filteredOrders = this.computeFiltered();
}

private computeFiltered() {
  return this.orders
    .filter(order => order.status === this.selectedStatus)
    .sort((left, right) => right.total - left.total);
}

filteredOrders = computed(() =>
  this.orders()
    .filter(order => order.status === this.selectedStatus())
    .sort((left, right) => right.total - left.total)
);
```

Bad example: `keyvalue` pipe inside a loop over large metadata objects

```html
@for (entry of item.metadata | keyvalue; track entry.key) {
  <div>{{ entry.key }}: {{ entry.value }}</div>
}
```

Good example: flatten metadata once in the component

```typescript
items = rawItems.map(item => ({
  ...item,
  metadataEntries: Object.entries(item.metadata).map(([key, value]) => ({ key, value }))
}));
```

```html
@for (entry of item.metadataEntries; track entry.key) {
  <div>{{ entry.key }}: {{ entry.value }}</div>
}
```

## 7. Testing and Quality Bar

- For components, services, and pipes, expect meaningful unit tests with Angular TestBed or the repository's chosen runner.
- Recommend test coverage for:
  - branching logic
  - error paths
  - observable behavior, including teardown
  - signal updates and computed state when introduced
  - template control-flow branches such as `@if`, `@for`, and `@defer` when introduced

### 7.1 Karma and Jasmine Unit Test Standards

- For changed `.spec.ts` files, review only the modified test lines and ensure assertions match the changed production behavior.
- Prefer focused, deterministic unit tests over broad integration-style specs when the changed lines affect isolated logic.
- Call out specs that only assert truthiness or component creation when the production diff adds meaningful logic branches.
- Prefer explicit Arrange, Act, Assert structure when changed test lines are difficult to follow.

### 7.2 TestBed and Fixture Usage

- Ensure changed tests configure only the dependencies they need.
- Call out over-mocked or under-configured TestBed setups that hide real template, dependency injection, or lifecycle issues introduced by the diff.
- Prefer `fixture.detectChanges()` only when the changed test actually depends on template binding or lifecycle execution.
- Call out repeated setup in changed test lines that should move into `beforeEach` when that duplication was introduced by the diff.

### 7.3 Jasmine Assertions and Spies

- Prefer specific matchers such as `toEqual`, `toHaveBeenCalledOnceWith`, `toBeFalse`, or `toContain` over vague assertions when the changed lines allow stronger verification.
- Call out spy assertions that only check whether a method was called when the changed behavior depends on arguments, call count, or call order.
- Call out `spyOn` usage on private implementation details when the changed test could verify public behavior instead.
- Prefer resetting or recreating spies in changed setup lines to avoid state leakage between specs.

### 7.4 Async Test Safety

- Call out use of `done` callbacks when `fakeAsync`, `tick`, `flush`, `waitForAsync`, or promise-based expectations would be clearer for the changed lines.
- Check whether changed async specs flush timers, microtasks, or pending HTTP requests.
- Ensure observable-based tests added in the diff assert completion, error paths, or teardown when relevant.
- Call out changed tests that rely on arbitrary timing values without controlling the scheduler or clock.

### 7.5 Karma-Specific Expectations

- Check whether changed tests depend on execution order, shared global state, or browser-specific behavior without clear setup.
- Prefer stable DOM assertions that work consistently in Karma's browser environment.
- Call out focused tests such as `fit` and `fdescribe`, and disabled tests such as `xit` and `xdescribe`, in changed lines.
- Ensure changed tests do not leave unresolved timers, subscriptions, or pending async work that can make Karma runs flaky.

## 8. Auto-Fix Suggestion Patterns

Use short, in-place fixes when the issue is trivial and directly tied to a changed line. Prefer suggestions like:

- Replace `let` with `const`.
- Add optional chaining.
- Add `track` to `@for` or `trackBy` to `*ngFor`.
- Add `takeUntilDestroyed(this.destroyRef)` to a changed subscription.
- Replace `setTimeout` with an RxJS scheduling primitive or a lifecycle-safe alternative.
- Replace `any` with an explicit interface or union.
- Replace unsafe DOM or sanitizer bypass usage with validated data flow.

## 9. Non-Functional Requirements (NFR) Standards

Apply these only when the changed lines are relevant.

### 9.1 Accessibility (a11y)

- Call out interactive `div` or `span` elements used as buttons or links without `role`, `tabindex`, or keyboard handlers.
- Call out form fields without an associated `<label>`, `aria-label`, or `aria-labelledby`.
- Call out images missing `alt` text, or missing `alt=""` for decorative images.
- Call out dynamic content such as errors, toasts, or loaders not wrapped in an `aria-live` region.
- Call out modals or dialogs opened without focus trapping — prefer `cdkTrapFocus` from Angular CDK.

### 9.2 Error Handling

- Call out `HttpClient` calls with no error handling or user-facing feedback on failure.
- Call out `catchError` blocks that silently return `EMPTY` or `of([])` without logging or notifying the user.
- Call out templates that have no loading, empty, or error state when consuming async data.

### 9.3 Logging

- Call out `console.log`, `console.warn`, or `console.error` left in production code — prefer the repo's logging service.
- Call out error handlers that log tokens, passwords, PII, or full API response payloads.
- Call out error paths that log no useful context such as status code, endpoint, or relevant ID.


## 10. Notes for Copilot

- This file is the single source of truth for PR review guidance.
- Code review behavior is non-deterministic. Follow these rules as closely as possible and keep replies focused.

