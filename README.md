# NutriPulse 🔥 - Vanilla Calorie & Macro Tracker

A lightweight, responsive, and fully featured daily calorie and macronutrient tracker built with **100% vanilla Web standards** — no frameworks, no CSS variables, no Tailwind, and no backend. All data is persisted directly in your browser using `localStorage`.

---

## 🌟 Features

- **Daily Calorie Tracking**: Real-time breakdown of **Consumed**, **Daily Target**, and **Remaining** / **Over Budget** calories with visual progress indicators.
- **Macronutrient Breakdown**: Live tracking and progress meters for **Protein**, **Carbs**, and **Fat** (in grams, kcal contributions, and percentage shares).
- **Date Navigation**: Seamlessly navigate between days (`‹`, `›`, calendar date picker, or jump back to `Today`) to log and inspect past and future nutrition.
- **Categorized Meal Logs**: Food entries are organized into **Breakfast**, **Lunch**, **Dinner**, and **Snacks**, complete with individual macros, kcal badges, and quick deletion.
- **⚡ Quick-Add Healthy Staples**: One-click shortcuts for frequent foods (Bananas, Boiled Eggs, Oatmeal, Grilled Chicken, Avocado Toast, Whey Shake, Salmon, etc.).
- **Customizable Goals**: Click **🎯 Set Goals** to customize your personal daily calorie and macronutrient targets.
- **100% Persistent Local Storage**:
  - Automatically saves all entries and settings to the browser's `localStorage`.
  - **📥 Export JSON**: Download a complete backup of your logs and goals.
  - **📤 Import JSON**: Restore or transfer data across devices.
  - **🗑️ Clear / Wipe**: Clear entries for a single day or perform a full factory reset.

---

## 🛠️ Tech Stack & Constraints

- **HTML5**: Clean, semantic markup.
- **CSS3**: Hand-crafted, responsive layout (Flexbox & CSS Grid) written **without CSS custom properties / variables** (`var()`, `--*`) and **no Tailwind/external CSS frameworks**.
- **JavaScript (ES6+)**: Pure vanilla JS with no external libraries or runtime dependencies.
- **Data Persistence**: Browser `localStorage` API.

---

## 🚀 Getting Started

No build steps, package managers, or server installations required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Montechris44/Product-Deisgn-bootcamp.git
   cd Product-Deisgn-bootcamp
   ```

2. **Open in browser**:
   - Simply double-click `index.html` in your file explorer, or
   - Open it using any local development server (e.g. VS Code Live Server, `python -m http.server 8000`, etc.).

---

## 📂 Project Structure

```
.
├── index.html       # Semantic HTML layout and UI components
├── style.css        # Vanilla CSS stylesheets (no CSS variables, responsive design)
├── app.js           # Core state management, calculation logic, and localStorage handler
└── README.md        # Project documentation
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
