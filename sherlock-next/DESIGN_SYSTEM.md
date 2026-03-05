# Agent Sherlock — Design System & Style Guide

> **Purpose:** This document captures the visual language, color theming, typography, component patterns, and UX principles used throughout the Agent Sherlock web application. Any future developer or AI agent modifying the UI should follow these conventions to maintain consistency.

---

## 1. Design Philosophy

| Principle | Description |
|---|---|
| **Dark-first** | The entire app uses a forced dark theme. There is no light mode. All surfaces, text, and accents are designed for dark backgrounds. |
| **Victorian Mystery** | The Sherlock Holmes theme drives the aesthetic — moody navy backgrounds, warm gold accents, serif headings, and atmospheric imagery. |
| **Glassmorphism** | Key panels (sidebar, setup screen, settings) use translucent backgrounds with `backdrop-filter: blur()` to create depth and immersion. |
| **Immersion over chrome** | UI chrome is minimized. Panels collapse, backgrounds bleed through, and the story content takes center stage. |
| **Subtle motion** | Micro-animations (fade-in, slide-up, hover glow, scale) are used sparingly to make the interface feel alive without being distracting. |

---

## 2. Color Palette

### 2.1 Core Navy Palette (Canvas)

These form the background layers. The darkest values are used for primary surfaces, lighter values for text and borders.

| Token | Hex | Usage |
|---|---|---|
| `--color-navy-950` | `#060b14` | Deepest background (rare) |
| `--color-navy-900` | `#0B1120` | **Primary background** (`--bg-primary`) |
| `--color-navy-800` | `#0F172A` | **Secondary surface** (`--bg-secondary`) |
| `--color-navy-700` | `#1E293B` | **Tertiary / card backgrounds** (`--bg-tertiary`) |
| `--color-navy-600` | `#334155` | Borders, dividers |
| `--color-navy-500` | `#475569` | Disabled states |
| `--color-navy-400` | `#64748b` | Tertiary text, meta info |
| `--color-navy-300` | `#94a3b8` | Secondary text |
| `--color-navy-200` | `#cbd5e1` | — |
| `--color-navy-100` | `#e2e8f0` | — |
| `--color-navy-50`  | `#f1f5f9` | **Primary text** (`--text-primary`) |

### 2.2 Accent Blue (Electric Blue)

Used for interactive elements, links, primary buttons, and focus states.

| Token | Hex | Usage |
|---|---|---|
| `--color-blue-600` | `#1d4ed8` | Gradient endpoints |
| `--color-blue-500` | `#2563eb` | **Primary accent**, button backgrounds |
| `--color-blue-400` | `#3b82f6` | Hover states, links |
| `--color-blue-300` | `#60a5fa` | Badge text |
| `--color-blue-200` | `#93c5fd` | — |
| `--color-blue-100` | `#bfdbfe` | — |

### 2.3 Accent Gold (Sherlock Flair)

The signature Sherlock color. Used for thematic headings, selection states, and warm accents.

| Token | Hex | Usage |
|---|---|---|
| `--color-gold-500` | `#d97706` | Darker gold, FAB buttons |
| `--color-gold-400` | `#f59e0b` | Active selection borders, warning |
| `--color-gold-300` | `#fbbf24` | **Section headings**, selected character glow, branded text |

**Gold glow pattern** (used on New Story button, character selection):
```css
background: rgba(245, 158, 11, 0.12);
border: 1px solid rgba(245, 158, 11, 0.3);
box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
```

### 2.4 Accent Teal

Used for tool calls, observations, and secondary interactive elements.

| Token | Hex |
|---|---|
| `--color-teal-600` | `#0f766e` |
| `--color-teal-500` | `#14b8a6` |
| `--color-teal-400` | `#2dd4bf` |

### 2.5 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#10b981` | Success states |
| `--color-warning` | `#f59e0b` | Warning alerts |
| `--color-error`   | `#ef4444` | Error states, delete actions |

---

## 3. Typography

### 3.1 Font Families

| Token | Font Stack | Usage |
|---|---|---|
| `--font-sans` | `'Inter', -apple-system, ...sans-serif` | Body text, UI elements, buttons |
| `--font-serif` | `'Playfair Display', Georgia, serif` | Page titles, branded headings ("Interactive Storytelling", "Agent Sherlock") |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Code blocks, tool output |

### 3.2 Size Scale

| Token | Size | Typical usage |
|---|---|---|
| `--text-xs` | `0.75rem` | Meta info, badges, timestamps |
| `--text-sm` | `0.875rem` | Body text, buttons, inputs |
| `--text-base` | `1rem` | Default paragraph |
| `--text-lg` | `1.125rem` | Sub-headings |
| `--text-xl` | `1.25rem` | Section titles |
| `--text-2xl` | `1.5rem` | Page sub-headers |
| `--text-3xl` | `1.875rem` | — |
| `--text-4xl` | `2.25rem` | Hero titles |

### 3.3 Conventions

- **Page titles** (e.g., "Interactive Storytelling") use `font-serif` at large sizes with `color: white` or `color: var(--text-primary)`.
- **Section labels** (e.g., "CHOOSE YOUR CHARACTER") use `font-sans`, uppercase, `letter-spacing: 0.05em`, `color: var(--color-gold-300)`, `font-weight: 700`.
- **Body text** uses `font-sans`, `color: var(--text-secondary)` for subdued content, `var(--text-primary)` for emphasis.

---

## 4. Spacing & Layout

### 4.1 Spacing Tokens

| Token | Size |
|---|---|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |

### 4.2 Border Radius Tokens

| Token | Size | Usage |
|---|---|---|
| `--radius-sm` | `0.375rem` | Small pills, inner elements |
| `--radius-md` | `0.5rem` | Buttons, inputs |
| `--radius-lg` | `0.75rem` | Cards, panels |
| `--radius-xl` | `1rem` | Modals |
| `--radius-2xl` | `1.5rem` | Large floating containers |
| `--radius-full` | `999px` | Avatars, circular badges |

### 4.3 Layout Constants

| Token | Value | Usage |
|---|---|---|
| `--header-height` | `80px` | Top navigation bar |
| `--sidebar-width` | `360px` | Settings panel (right side) |
| Sidebar (collapsed) | `48px` | Left chats panel when collapsed |
| Sidebar (expanded) | `280px` | Left chats panel when expanded |

---

## 5. Glassmorphism Patterns

Glassmorphism is central to the design. Here are the established recipes:

### 5.1 Sidebar Panel
```css
background: rgba(15, 20, 35, 0.4);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border-right: 1px solid rgba(255, 255, 255, 0.08);
```

### 5.2 Setup Screen Content Card
```css
background: rgba(15, 23, 42, 0.85);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
```

### 5.3 Overlay / Backdrop
```css
background: rgba(15, 23, 42, 0.5);
backdrop-filter: blur(4px);
```

### 5.4 General Rule
- **Low translucency** (`rgba(..., 0.3–0.5)`) for panels that sit over atmospheric backgrounds.
- **High translucency** (`rgba(..., 0.8–0.95)`) for content-heavy areas that need readability.
- Always include `-webkit-backdrop-filter` for Safari support.

---

## 6. Shadows & Elevation

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle card elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Buttons, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, floating panels |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.6)` | Full-screen overlays |
| `--shadow-glow-blue` | `0 0 20px rgba(37,99,235,0.4)` | Primary button hover glow |

**Gold glow shadow** (custom, used on character selection & New Story CTA):
```css
box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
/* On hover: */
box-shadow: 0 0 25px rgba(245, 158, 11, 0.3);
```

---

## 7. Transitions & Animation

### 7.1 Timing Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `--transition-fast` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus, small toggles |
| `--transition-base` | `250ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Panel open/close, fade |
| `--transition-slow` | `350ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Slide-up, modal entry |

### 7.2 Common Keyframes

| Name | Purpose |
|---|---|
| `fadeIn` | Opacity 0→1 + translateY(8px→0). Used for content appearing. |
| `slideUp` | Opacity 0→1 + translateY(16px→0). Used for modals and cards. |
| `pulse` | Opacity 0.4→1→0.4. Used for loading indicators. |
| `spin` | `rotate(0→360deg)`. Used for spinners. |
| `shimmer` | Background position sweep. Used for skeleton loading. |
| `thoughtPulse` | Border-color pulsing in gold. Used for AI "thinking" state. |

### 7.3 Hover Conventions

- **Buttons:** `transform: translateY(-1px)` + glow shadow on hover.
- **Cards:** `background` lightens slightly (add ~5% white). No scale transforms on cards.
- **Interactive items:** Transition `all 0.2s` for snappy feedback.

---

## 8. Component Patterns

### 8.1 Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| **Primary** | Blue gradient `(blue-500 → blue-600)` | White | None | Blue glow shadow + lift |
| **Secondary** | `--bg-secondary` | `--text-primary` | `--border-light` | Darken bg + thicken border |
| **Ghost** | Transparent | `--text-secondary` | None | Light bg fill |
| **Danger** | `--color-error` | White | None | Slight opacity reduction |
| **Teal** | Teal gradient | White | None | Teal glow shadow + lift |
| **Gold CTA** | `rgba(245,158,11, 0.12)` | Gold-300 | Gold border | Intensify glow + lift |

### 8.2 Cards

- Background: `--bg-secondary` or glassmorphism.
- Border: `1px solid var(--border-light)` (= `rgba(255,255,255,0.08)`).
- Border-radius: `--radius-lg` (0.75rem) to `--radius-xl` (1rem).
- Hover: Slightly brighter background, never scale transforms.

### 8.3 Character Selection Cards

- Portrait image fills the card with `object-fit: cover`.
- Dark gradient overlay from bottom: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 60%)`.
- Name in `color: var(--color-gold-300)` on selection, white otherwise.
- Selected state: Golden border glow `box-shadow: 0 0 15px rgba(245,158,11,0.3)`.

### 8.4 Modals

- Overlay: Semi-transparent navy + blur.
- Modal card: `--bg-secondary`, `--radius-xl`, `--shadow-xl`.
- Entry animation: `slideUp 300ms`.

### 8.5 Sidebar

- Style: Glassmorphism slide-over.
- Default state: Collapsed (48px wide, icon-only toggle).
- Expanded: 280px, branded header ("Agent Sherlock / Interactive Story Mode"), glowing gold "New Story" CTA.
- Toggle icons: `PanelLeft` / `PanelLeftClose` from `lucide-react`.

---

## 9. Iconography

| Library | Usage |
|---|---|
| **Lucide React** | All UI icons (sidebar toggle, settings, search, etc.) |
| **Emoji fallback** | Only where Lucide doesn't have an appropriate icon |

- Default icon size: `18–20px` for UI chrome, `16px` for inline/meta.
- Icon color: `rgba(255, 255, 255, 0.5)` default, `white` on hover.
- Never use raw SVG inline — always use the `lucide-react` component.

---

## 10. Image & Avatar Conventions

| Element | Style |
|---|---|
| **Character avatars** | "Nano banana pro" style cinematic portraits. Dark, moody, Victorian-era aesthetic. |
| **Background images** | Full-bleed with dark overlays (`bg-black/75`) and subtle color tints (amber/blue gradients). |
| **Avatar framing** | `object-fit: cover` with bottom-fade gradient. No circular cropping for character cards. |
| **User avatars** | Circular (`border-radius: 50%`), 36px in sidebar, from predefined SVG set. |

---

## 11. Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| **Desktop** (> 768px) | Full layout: sidebar + main content + optional settings panel. |
| **Mobile** (≤ 768px) | Sidebar becomes a fixed overlay with backdrop. Collapsed to zero-width by default. Settings panel stacks below. |

---

## 12. Quick Reference: Do's and Don'ts

### ✅ Do

- Use CSS custom properties from `globals.css` — never hardcode colors.
- Use `var(--font-serif)` for thematic headings.
- Use gold accents (`--color-gold-*`) for Sherlock-themed elements.
- Use glassmorphism (blur + translucent bg) for floating panels.
- Use `lucide-react` for all icons.
- Keep surfaces dark — primary backgrounds under `#0F172A`.

### ❌ Don't

- Don't introduce a light mode or white backgrounds.
- Don't use TailwindCSS utility classes (this project uses CSS Modules).
- Don't use bright saturated colors as large surface fills.
- Don't add heavy animations (scale > 1.05, bounce, etc.).
- Don't use inline `<svg>` — use the Lucide component library.
- Don't crop character avatars into circles — use rectangular portrait cards with gradient overlays.
