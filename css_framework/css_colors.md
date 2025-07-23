# The Simple Handbook for UI Color Palettes

This guide follows a simple principle: for most UI design, you don't need complex color theory. You need a reliable system. This handbook will walk you through creating a versatile, neutral-based color palette that works for both dark and light modes, and then adding accent and semantic colors.


### Chapter 1: The Foundation - Your Neutral Palette

Neutrals are the most important colors in your UI. They are used for backgrounds, text, and borders, making up over 90% of what the user sees.


#### **The Best Color Format: HSL**


Forget HEX or RGB for creating palettes. Use **HSL (Hue, Saturation, Lightness)**. It's intuitive because you can create shades of any color simply by changing the Lightness value.


*   **Hue (H):** The color itself (e.g., 0 is red, 120 is green, 240 is blue).
*   **Saturation (S):** The intensity of the color (0% is grey, 100% is vibrant).
*   **Lightness (L):** The amount of black or white (0% is black, 100% is white).

#### **Step 1: Create the Dark Mode Palette**


We start with dark mode. To create neutral greys, set **Saturation to 0%**. When saturation is 0, the Hue value doesn't matter, so you can leave it at 0.


**Background Colors:** Create depth by using lighter shades for elements that are "closer" to the user.


*   `--bg-dark` (Farthest back): `hsl(0 0% 0%)`
*   `--bg` (Mid-level, like cards): `hsl(0 0% 5%)`
*   `--bg-light` (Top-level, interactive elements): `hsl(0 0% 10%)`


**Text Colors:** Use high contrast for primary text and a muted shade for secondary information. Avoid pure white (`100%` lightness) as it can be harsh on the eyes.


*   `--text` (Headings, important text): `hsl(0 0% 95%)`
*   `--text-muted` (Body copy, secondary labels): `hsl(0 0% 70%)`

#### **Step 2: Create the Light Mode Palette**

To create the light mode palette, we'll invert and adjust the dark mode values.

**Background Colors:** In light mode, darker surfaces appear closer. The lightest color is the farthest back.

*   `--bg-dark` (Closest element): `hsl(0 0% 90%)`
*   `--bg` (Mid-level): `hsl(0 0% 95%)`
*   `--bg-light` (Farthest back): `hsl(0 0% 100%)`


**Text Colors:**


*   `--text` (Headings): `hsl(0 0% 5%)`
*   `--text-muted` (Body copy): `hsl(0 0% 30%)`


### Chapter 2: Adding Character & Meaning

With your neutral foundation, you can now add colors for actions and states.

*   **Primary/Action Color:** This is your brand color. Use it for primary buttons and key actions. Create a slightly darker shade for the `:hover` state.
*   **Semantic Colors:** These communicate system states to the user.
    *   **Danger:** A red for destructive actions or errors.
    *   **Warning:** A yellow or orange for things that need attention.
    *   **Success:** A green to confirm a successful action.
    *   **Info:** A blue for informational messages.

### Chapter 3: Adding Polish & Depth

Use these properties, derived from your neutral palette, to make your UI feel more refined.

*   **Borders:** Use a subtle border to define elements.

    *   **Dark Mode:** `hsl(0 0% 30%)`
    *   **Light Mode:** `hsl(0 0% 80%)`

*   **Highlights:** Simulate a light source from above by making the top border of an element lighter.

    *   **Dark Mode:** `hsl(0 0% 60%)`
    *   **Light Mode:** `hsl(0 0% 100%)`

*   **Shadows:** For realistic depth, combine two shadows. Use HSLA to add transparency.

    *   **Shadow 1:** Darker and closer to the element.
    *   **Shadow 2:** Lighter, longer, and softer (more blur).



    **Example (Dark Mode):**

    `box-shadow: 0px 2px 4px hsla(0, 0%, 0%, 0.07), 0px 4px 4px hsla(0, 0%, 0%, 0.15);`



### Appendix: Quick Reference & Tools

#### **CSS Implementation**

Define your colors as CSS Custom Properties. Set your default theme in `:root`, and use a class or media query for the alternate theme.

```css

/* Default Dark Theme */

:root {
&nbsp; --bg-dark: hsl(0 0% 0%);
&nbsp; --bg: hsl(0 0% 5%);
&nbsp; --bg-light: hsl(0 0% 10%);
&nbsp; --text: hsl(0 0% 95%);
&nbsp; --text-muted: hsl(0 0% 70%);
&nbsp; --border: hsl(0 0% 30%);
}

/* Light Theme */

.light {

&nbsp; --bg-dark: hsl(0 0% 90%);
&nbsp; --bg: hsl(0 0% 95%);
&nbsp; --bg-light: hsl(0 0% 100%);
&nbsp; --text: hsl(0 0% 5%);
&nbsp; --text-muted: hsl(0 0% 30%);
&nbsp; --border: hsl(0 0% 80%);

}

```
