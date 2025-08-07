# Miracap: UI Style Guide

### Design Philosophy
Our design aims to be **modern, trustworthy, and professional**. The interface should feel clean, uncluttered, and serious, communicating stability and value to inspire confidence in a financial technology context. We prioritize clarity and ease of use through a structured layout, a sophisticated color palette, and clear visual hierarchy.

---

### 1. Color Palette
The palette is built on a professional dark theme, using a gold accent to signify value and trust.

| Role                 | Color Name       | Hex Code  | Usage                                                      |
| -------------------- | ---------------- | --------- | ---------------------------------------------------------- |
| **Primary BG** | Oxford Blue      | `#0A101C` | Main application background.                               |
| **UI BG** | Charcoal         | `#101828` | Background for cards, modals, and primary UI surfaces.     |
| **Primary Accent** | Gold             | `#D4AF37` | Buttons, key metrics, active states, and branding elements.|
| **Primary Text** | Off-White        | `#F0F2F5` | Main text color for body copy and important information.   |
| **Secondary Text** | Light Grey       | `#8A94A6` | Labels, helper text, and less-critical information.        |
| **Border & Lines** | Subtle Border    | `#333F54` | Borders for cards, inputs, and dividers.                   |
| **Success State** | Green            | `#10B981` | Status indicators, success messages.                       |

---

### 2. Layout & Spacing
We use a consistent spacing system to create a clean and predictable rhythm.

* **Page Layout:**
    * `max-width`: `max-w-3xl` (896px)
    * `padding`: `p-4` (16px) on mobile, `p-8` (32px) on desktop.
* **Card Spacing:**
    * `margin-bottom`: `space-y-6` (24px) between cards.
* **Internal Padding:**
    * All cards and main containers should have an internal `padding` of `p-6` (24px).
* **Rounded Corners (Border Radius):**
    * **Cards:** `rounded-xl` (12px)
    * **Buttons & Inputs:** `rounded-lg` (8px)

---

### 3. Typography
We use the "Inter" font for its excellent readability on screens.

* **Font Family:** `Inter`, sans-serif
* **Header (Logo):** `text-2xl` (24px), `font-bold`
* **Card Titles:** `text-lg` (18px), `font-semibold`
* **Body Text / Values:** `text-base` (16px), `font-normal` or `font-mono` for addresses/IDs.
* **Labels / Secondary Text:** `text-sm` (14px), `text-secondary` color.

---

### 4. Component Styles

#### **Cards / Containers**
The foundational element for grouping content.
* **Background:** `bg-card` (`#101828`)
* **Border:** `1px solid` using `border-custom` (`#333F54`)
* **Shadow:** `shadow-lg` (A soft, diffused shadow for elevation)
* **Radius:** `rounded-xl` (12px)

#### **Primary Buttons (`btn-accent`)**
For the most important actions (e.g., "Connect Wallet", "Load").
* **Background:** `bg-accent` (`#D4AF37`)
* **Text Color:** `var(--card-background)` (`#101828`) for high contrast.
* **Font:** `font-semibold`
* **Padding:** `py-3 px-6` (12px vertical, 24px horizontal)
* **Radius:** `rounded-lg` (8px)
* **State:** `hover:opacity-90` for feedback.

#### **Secondary Buttons**
For less critical actions (e.g., "Transfer").
* **Background:** `bg-card` (`#101828`)
* **Border:** `1px solid` using `border-custom` (`#333F54`)
* **Text Color:** `text-primary` (`#F0F2F5`)
* **State:** `hover:border-accent` and `hover:text-accent` on hover.

#### **Input Fields**
For text entry.
* **Background:** `bg-primary` (`#0A101C`)
* **Border:** `1px solid` using `border-custom` (`#333F54`)
* **Padding:** `px-4 py-3` (16px horizontal, 12px vertical)
* **Radius:** `rounded-lg` (8px)
* **Focus State:** Remove default outline. Add `ring-2 ring-accent/50` to show a glowing gold ring when active.