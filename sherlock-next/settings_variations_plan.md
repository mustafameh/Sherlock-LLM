# Plan: 10 Variations of "Elevated Cards" Settings UI

The user has selected the **Elevated Cards** design aesthetic (darker background, lighter floating sections) as the foundation. To provide 10 distinct choices within this aesthetic matching the dark blue theme, we will vary the internal layout, button styles, borders, sliders, and interaction patterns.

## The Core Foundation (Shared Across All 10)
- **Background**: Deep dark blue/almost black (`#040914` or similar).
- **Cards**: Elevated sections in a slightly lighter dark blue/slate (`#0F172A` or `#1E293B`).
- **Text**: White/Slate text (`#F8FAFC`, `#94A3B8`).
- **Accent**: Sherlock-themed blue (`#38BDF8`).

## 10 distinct variations to implement:

### Variation 1: The Classic Refined
- **Theme**: A highly polished version of the original V3.
- **Borders/Corners**: Standard `8px` corner radius for everything.
- **Controls**: Standard radio buttons for model source.
- **Slider**: Thin track, standard circular thumb.
- **Buttons**: Solid blue primary button, subdued secondary button.

### Variation 2: Soft Pill UI
- **Theme**: Friendly and approachable while remaining dark and professional.
- **Borders/Corners**: Cards remain `12px` rounded, but **all inputs, selects, and buttons** are fully pill-shaped (`border-radius: 99px`).
- **Controls**: Radio buttons inside pill-shaped selection cards.
- **Slider**: Thick track with a large pill-shaped thumb.

### Variation 3: Inline Compact (Horizontal Layout)
- **Theme**: Space-saving layout for advanced users.
- **Layout**: Instead of labels above inputs, labels are placed **to the left** of the inputs (flex-row).
- **Borders/Corners**: Distinct sharp borders (`4px` radius).
- **Controls**: Side-by-side layout saves vertical height.

### Variation 4: Segmented Toggles
- **Theme**: App-like modern interface.
- **Controls**: Replaces the large model source radio cards with a modern **segmented control / toggle switch** at the top (e.g., [ OpenRouter | Local ] in a single pill).
- **Buttons**: Block-level buttons (spanning full width).

### Variation 5: Neon Edge Accents
- **Theme**: Cyber/Hacker vibe but subtle.
- **Borders/Corners**: Cards have no visible borders except for a glowing **left accent border** on the active card.
- **Slider**: The slider track glows when hovered.
- **Buttons**: Outlined glowing buttons instead of solid fills.

### Variation 6: Minimalist Flat Lines
- **Theme**: Extreme simplicity.
- **Inputs**: Inputs and selects have **no background**, just a solid bottom underline that expands on focus.
- **Controls**: Checkmarks instead of circle radio buttons.
- **Buttons**: Text-only buttons with subtle hover backgrounds (Ghost buttons).

### Variation 7: Sunken Inputs (Neumorphic Inset)
- **Theme**: Depth and tactile feel.
- **Layout**: High contrast between the elevated card surface and the inputs. The inputs (textarea, select, text fields) have dark, inset inner-shadows making them look "sunken" into the card.
- **Buttons**: Subtle bevel effects for a clicky feel.

### Variation 8: Split-Pane Cards
- **Theme**: Structural and highly categorized.
- **Layout**: The card is divided right down the middle with a subtle vertical line. Labels on the left pane, inputs/controls on the right pane.
- **Slider**: Square slider thumb.

### Variation 9: Translucent Frosted Glass
- **Theme**: High-end premium feel.
- **Borders/Corners**: Cards use a heavier backdrop blur and extremely low opacity backgrounds (`rgba(255,255,255,0.02)`), heavily relying on the app's deep background.
- **Controls**: Extremely subtle 1px white/glass borders.

### Variation 10: Dynamic Flow (No Cards)
- **Theme**: Breaking the box model.
- **Layout**: Instead of strict cards defining sections, the sections flow into one another separated by glowing divider lines, with the "card" effect only appearing as a hover state over the specific setting being interacted with.
