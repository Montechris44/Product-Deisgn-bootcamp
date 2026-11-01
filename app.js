/**
 * NutriPulse - Vanilla Calorie & Macro Tracker
 * Strictly Vanilla JS - No external libraries, persistent in localStorage.
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY_MEALS = 'nutripulse_meals_v1';
  const STORAGE_KEY_GOALS = 'nutripulse_goals_v1';

  // Default User Nutritional Goals
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65
  };

  // Quick-Add Staples
  const PRESET_FOODS = [
    { name: '🍌 Banana', category: 'snack', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { name: '🥚 Boiled Egg (x2)', category: 'breakfast', calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6 },
    { name: '🥣 Oatmeal Bowl', category: 'breakfast', calories: 220, protein: 7, carbs: 38, fat: 4 },
    { name: '🍗 Chicken Breast (150g)', category: 'lunch', calories: 247, protein: 46, carbs: 0, fat: 5 },
    { name: '🥑 Avocado Toast', category: 'breakfast', calories: 280, protein: 6, carbs: 24, fat: 18 },
    { name: '🥤 Whey Protein Shake', category: 'snack', calories: 150, protein: 30, carbs: 3, fat: 1.5 },
    { name: '🥗 Mixed Greens & Olive Oil', category: 'lunch', calories: 140, protein: 2, carbs: 7, fat: 12 },
    { name: '🥩 Grilled Salmon Fillet', category: 'dinner', calories: 340, protein: 34, carbs: 0, fat: 22 },
    { name: '🍎 Honeycrisp Apple', category: 'snack', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: '☕ Latte with Oat Milk', category: 'breakfast', calories: 130, protein: 3, carbs: 16, fat: 5 }
  ];

  // --- Application State ---
  let currentDate = getTodayDateString();
  let mealsData = loadMealsFromStorage();
  let goalsData = loadGoalsFromStorage();

  // --- DOM Elements ---
  const datePicker = document.getElementById('datePicker');
  const dateDisplayLabel = document.getElementById('dateDisplayLabel');
  const prevDateBtn = document.getElementById('prevDateBtn');
  const nextDateBtn = document.getElementById('nextDateBtn');
  const todayBtn = document.getElementById('todayBtn');

  // Summary Card
  const caloriesConsumedEl = document.getElementById('caloriesConsumed');
  const calorieTargetEl = document.getElementById('calorieTarget');
  const caloriesRemainingEl = document.getElementById('caloriesRemaining');
  const calorieProgressBar = document.getElementById('calorieProgressBar');
  const progressPercentageText = document.getElementById('progressPercentageText');
  const progressDeltaText = document.getElementById('progressDeltaText');
  const calorieStatusBadge = document.getElementById('calorieStatusBadge');
  const highlightBlock = document.querySelector('.metric-block.highlight');

  // Macros Card
  const proteinTotalEl = document.getElementById('proteinTotal');
  const proteinGoalLabel = document.getElementById('proteinGoalLabel');
  const proteinBar = document.getElementById('proteinBar');
  const proteinKcalEl = document.getElementById('proteinKcal');

  const carbsTotalEl = document.getElementById('carbsTotal');
  const carbsGoalLabel = document.getElementById('carbsGoalLabel');
  const carbsBar = document.getElementById('carbsBar');
  const carbsKcalEl = document.getElementById('carbsKcal');

  const fatTotalEl = document.getElementById('fatTotal');
  const fatGoalLabel = document.getElementById('fatGoalLabel');
  const fatBar = document.getElementById('fatBar');
  const fatKcalEl = document.getElementById('fatKcal');

  // Presets Container
  const presetsContainer = document.getElementById('presetsContainer');

  // Add Food Form
  const foodEntryForm = document.getElementById('foodEntryForm');
  const foodNameInput = document.getElementById('foodName');
  const mealCategorySelect = document.getElementById('mealCategory');
  const foodCaloriesInput = document.getElementById('foodCalories');
  const foodProteinInput = document.getElementById('foodProtein');
  const foodCarbsInput = document.getElementById('foodCarbs');
  const foodFatInput = document.getElementById('foodFat');

  // Meal Lists
  const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Goals Modal
  const openGoalsModalBtn = document.getElementById('openGoalsModalBtn');
  const closeGoalsModalBtn = document.getElementById('closeGoalsModalBtn');
  const cancelGoalsModalBtn = document.getElementById('cancelGoalsModalBtn');
  const goalsModal = document.getElementById('goalsModal');
  const goalsForm = document.getElementById('goalsForm');
  const goalCaloriesInput = document.getElementById('goalCalories');
  const goalProteinInput = document.getElementById('goalProtein');
  const goalCarbsInput = document.getElementById('goalCarbs');
  const goalFatInput = document.getElementById('goalFat');

  // Storage Tools
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearTodayBtn = document.getElementById('clearTodayBtn');
  const resetAllBtn = document.getElementById('resetAllBtn');

  // Toast
  const toastNotification = document.getElementById('toastNotification');
  let toastTimer = null;

  // --- Initialization ---
  function init() {
    seedInitialDataIfEmpty();
    renderPresets();
    setupEventListeners();
    updateDateDisplay();
    renderAll();
  }

  // --- Date Helpers ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(keyStr) {
    const [year, month, day] = keyStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function shiftDate(days) {
    const current = parseDateKey(currentDate);
    current.setDate(current.getDate() + days);
    currentDate = formatDateKey(current);
    updateDateDisplay();
    renderAll();
  }

  function updateDateDisplay() {
    datePicker.value = currentDate;
    const todayStr = getTodayDateString();
    
    // Label formatting
    const current = parseDateKey(currentDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (currentDate === todayStr) {
      dateDisplayLabel.textContent = 'Today';
    } else if (currentDate === formatDateKey(yesterday)) {
      dateDisplayLabel.textContent = 'Yesterday';
    } else if (currentDate === formatDateKey(tomorrow)) {
      dateDisplayLabel.textContent = 'Tomorrow';
    } else {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      dateDisplayLabel.textContent = current.toLocaleDateString(undefined, options);
    }
  }

  // --- LocalStorage Logic ---
  function loadMealsFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEALS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading meals from localStorage:', e);
      return {};
    }
  }

  function saveMealsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(mealsData));
    } catch (e) {
      console.error('Error saving meals to localStorage:', e);
      showToast('⚠️ Storage limit reached or localStorage unavailable!');
    }
  }

  function loadGoalsFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GOALS);
      return stored ? Object.assign({}, DEFAULT_GOALS, JSON.parse(stored)) : Object.assign({}, DEFAULT_GOALS);
    } catch (e) {
      console.error('Error loading goals:', e);
      return Object.assign({}, DEFAULT_GOALS);
    }
  }

  function saveGoalsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goalsData));
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  }

  // Seed sample initial data if new user
  function seedInitialDataIfEmpty() {
    if (Object.keys(mealsData).length === 0) {
      const today = getTodayDateString();
      mealsData[today] = [
        {
          id: 'init_1',
          name: '🥣 Oatmeal with Blueberries',
          category: 'breakfast',
          calories: 280,
          protein: 8,
          carbs: 48,
          fat: 5,
          timestamp: Date.now() - 3600000 * 4
        },
        {
          id: 'init_2',
          name: '☕ Black Americano',
          category: 'breakfast',
          calories: 5,
          protein: 0,
          carbs: 1,
          fat: 0,
          timestamp: Date.now() - 3600000 * 3.8
        },
        {
          id: 'init_3',
          name: '🥗 Grilled Chicken & Avocado Salad',
          category: 'lunch',
          calories: 460,
          protein: 42,
          carbs: 12,
          fat: 24,
          timestamp: Date.now() - 3600000 * 1.5
        }
      ];
      saveMealsToStorage();
    }
  }

  // --- Rendering UI ---
  function renderAll() {
    const todaysMeals = mealsData[currentDate] || [];

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const categorySubtotals = {
      breakfast: { count: 0, kcal: 0 },
      lunch: { count: 0, kcal: 0 },
      dinner: { count: 0, kcal: 0 },
      snack: { count: 0, kcal: 0 }
    };

    todaysMeals.forEach(item => {
      const cal = Number(item.calories) || 0;
      const p = Number(item.protein) || 0;
      const c = Number(item.carbs) || 0;
      const f = Number(item.fat) || 0;

      totalCalories += cal;
      totalProtein += p;
      totalCarbs += c;
      totalFat += f;

      if (categorySubtotals[item.category]) {
        categorySubtotals[item.category].count += 1;
        categorySubtotals[item.category].kcal += cal;
      }
    });

    renderCalorieCard(totalCalories);
    renderMacrosCard(totalProtein, totalCarbs, totalFat, totalCalories);
    renderMealCategories(todaysMeals, categorySubtotals);
  }

  function renderCalorieCard(totalCalories) {
    const target = goalsData.calories;
    const remaining = target - totalCalories;
    const percentage = target > 0 ? Math.round((totalCalories / target) * 100) : 0;

    caloriesConsumedEl.textContent = totalCalories.toLocaleString();
    calorieTargetEl.textContent = target.toLocaleString();
    caloriesRemainingEl.textContent = Math.abs(remaining).toLocaleString();

    // Progress bar width
    const clampedWidth = Math.min(percentage, 100);
    calorieProgressBar.style.width = clampedWidth + '%';

    progressPercentageText.textContent = `${percentage}% consumed`;

    if (remaining >= 0) {
      progressDeltaText.textContent = `${remaining.toLocaleString()} kcal left`;
      calorieStatusBadge.textContent = 'On Track';
      calorieStatusBadge.className = 'status-badge status-good';
      calorieProgressBar.classList.remove('over-target');
      highlightBlock.classList.remove('over-budget');
      highlightBlock.querySelector('.metric-label').textContent = 'Remaining';
    } else {
      progressDeltaText.textContent = `${Math.abs(remaining).toLocaleString()} kcal over budget`;
      calorieStatusBadge.textContent = 'Over Target';
      calorieStatusBadge.className = 'status-badge status-over';
      calorieProgressBar.classList.add('over-target');
      highlightBlock.classList.add('over-budget');
      highlightBlock.querySelector('.metric-label').textContent = 'Over By';
    }
  }

  function renderMacrosCard(pGrams, cGrams, fGrams, totalCalories) {
    // Protein
    proteinTotalEl.textContent = Math.round(pGrams);
    proteinGoalLabel.textContent = goalsData.protein;
    const pPercent = goalsData.protein > 0 ? Math.min(Math.round((pGrams / goalsData.protein) * 100), 100) : 0;
    proteinBar.style.width = pPercent + '%';
    const pKcal = Math.round(pGrams * 4);
    const pKcalShare = totalCalories > 0 ? Math.round((pKcal / totalCalories) * 100) : 0;
    proteinKcalEl.textContent = `${pKcal} kcal (${pKcalShare}%)`;

    // Carbs
    carbsTotalEl.textContent = Math.round(cGrams);
    carbsGoalLabel.textContent = goalsData.carbs;
    const cPercent = goalsData.carbs > 0 ? Math.min(Math.round((cGrams / goalsData.carbs) * 100), 100) : 0;
    carbsBar.style.width = cPercent + '%';
    const cKcal = Math.round(cGrams * 4);
    const cKcalShare = totalCalories > 0 ? Math.round((cKcal / totalCalories) * 100) : 0;
    carbsKcalEl.textContent = `${cKcal} kcal (${cKcalShare}%)`;

    // Fat
    fatTotalEl.textContent = Math.round(fGrams);
    fatGoalLabel.textContent = goalsData.fat;
    const fPercent = goalsData.fat > 0 ? Math.min(Math.round((fGrams / goalsData.fat) * 100), 100) : 0;
    fatBar.style.width = fPercent + '%';
    const fKcal = Math.round(fGrams * 9);
    const fKcalShare = totalCalories > 0 ? Math.round((fKcal / totalCalories) * 100) : 0;
    fatKcalEl.textContent = `${fKcal} kcal (${fKcalShare}%)`;
  }

  function renderMealCategories(todaysMeals, subtotals) {
    mealCategories.forEach(category => {
      const countEl = document.getElementById(`count-${category}`);
      const kcalEl = document.getElementById(`kcal-${category}`);
      const listEl = document.getElementById(`list-${category}`);

      const catInfo = subtotals[category] || { count: 0, kcal: 0 };
      countEl.textContent = `${catInfo.count} item${catInfo.count === 1 ? '' : 's'}`;
      kcalEl.textContent = `${catInfo.kcal.toLocaleString()} kcal`;

      // Filter meals
      const categoryItems = todaysMeals.filter(m => m.category === category);

      if (categoryItems.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No ${category} logged yet.</div>`;
      } else {
        listEl.innerHTML = '';
        categoryItems.forEach(item => {
          const row = document.createElement('div');
          row.className = 'meal-item-row';

          const hasMacros = (item.protein > 0 || item.carbs > 0 || item.fat > 0);
          const macroDisplay = hasMacros
            ? `<div class="item-macro-tags">
                <span class="tag-p">P: ${item.protein || 0}g</span>
                <span class="tag-c">C: ${item.carbs || 0}g</span>
                <span class="tag-f">F: ${item.fat || 0}g</span>
               </div>`
            : '';

          row.innerHTML = `
            <div class="item-left">
              <span class="item-name">${escapeHtml(item.name)}</span>
              ${macroDisplay}
            </div>
            <div class="item-right">
              <span class="item-calories">${Number(item.calories).toLocaleString()} <span>kcal</span></span>
              <button class="delete-btn" title="Remove food" data-id="${item.id}">&times;</button>
            </div>
          `;

          // Delete action
          const delBtn = row.querySelector('.delete-btn');
          delBtn.addEventListener('click', () => {
            deleteMealItem(item.id);
          });

          listEl.appendChild(row);
        });
      }
    });
  }

  function renderPresets() {
    presetsContainer.innerHTML = '';
    PRESET_FOODS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.innerHTML = `${preset.name} <span class="preset-cal">${preset.calories} kcal</span>`;
      chip.addEventListener('click', () => {
        addPresetItem(preset);
      });
      presetsContainer.appendChild(chip);
    });
  }

  // --- Add / Delete Actions ---
  function addMealItem(item) {
    if (!mealsData[currentDate]) {
      mealsData[currentDate] = [];
    }
    mealsData[currentDate].push(item);
    saveMealsToStorage();
    renderAll();
    showToast(`Added "${item.name}" (${item.calories} kcal)`);
  }

  function addPresetItem(preset) {
    const currentCategory = mealCategorySelect.value || preset.category;
    const newItem = {
      id: generateId(),
      name: preset.name,
      category: currentCategory,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      timestamp: Date.now()
    };
    addMealItem(newItem);
  }

  function deleteMealItem(itemId) {
    if (!mealsData[currentDate]) return;
    const originalLen = mealsData[currentDate].length;
    mealsData[currentDate] = mealsData[currentDate].filter(item => item.id !== itemId);
    if (mealsData[currentDate].length < originalLen) {
      saveMealsToStorage();
      renderAll();
      showToast('Item deleted');
    }
  }

  // --- Modal & Goal Logic ---
  function openGoalsModal() {
    goalCaloriesInput.value = goalsData.calories;
    goalProteinInput.value = goalsData.protein;
    goalCarbsInput.value = goalsData.carbs;
    goalFatInput.value = goalsData.fat;
    goalsModal.classList.add('open');
  }

  function closeGoalsModal() {
    goalsModal.classList.remove('open');
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Date Navigation
    prevDateBtn.addEventListener('click', () => shiftDate(-1));
    nextDateBtn.addEventListener('click', () => shiftDate(1));
    todayBtn.addEventListener('click', () => {
      currentDate = getTodayDateString();
      updateDateDisplay();
      renderAll();
    });
    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        updateDateDisplay();
        renderAll();
      }
    });

    // Food Form Submit
    foodEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = foodNameInput.value.trim();
      const calories = parseFloat(foodCaloriesInput.value);
      const category = mealCategorySelect.value;
      const protein = parseFloat(foodProteinInput.value) || 0;
      const carbs = parseFloat(foodCarbsInput.value) || 0;
      const fat = parseFloat(foodFatInput.value) || 0;

      if (!name || isNaN(calories) || calories < 0) {
        alert('Please enter a valid food name and positive calorie amount.');
        return;
      }

      const newItem = {
        id: generateId(),
        name: name,
        category: category,
        calories: Math.round(calories),
        protein: Math.max(0, protein),
        carbs: Math.max(0, carbs),
        fat: Math.max(0, fat),
        timestamp: Date.now()
      };

      addMealItem(newItem);

      // Reset form fields
      foodNameInput.value = '';
      foodCaloriesInput.value = '';
      foodProteinInput.value = '';
      foodCarbsInput.value = '';
      foodFatInput.value = '';
      foodNameInput.focus();
    });

    // Goals Modal Events
    openGoalsModalBtn.addEventListener('click', openGoalsModal);
    closeGoalsModalBtn.addEventListener('click', closeGoalsModal);
    cancelGoalsModalBtn.addEventListener('click', closeGoalsModal);
    goalsModal.addEventListener('click', (e) => {
      if (e.target === goalsModal) {
        closeGoalsModal();
      }
    });

    goalsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCalories = parseInt(goalCaloriesInput.value, 10);
      const newProtein = parseInt(goalProteinInput.value, 10);
      const newCarbs = parseInt(goalCarbsInput.value, 10);
      const newFat = parseInt(goalFatInput.value, 10);

      if (newCalories > 0 && newProtein >= 0 && newCarbs >= 0 && newFat >= 0) {
        goalsData.calories = newCalories;
        goalsData.protein = newProtein;
        goalsData.carbs = newCarbs;
        goalsData.fat = newFat;

        saveGoalsToStorage();
        closeGoalsModal();
        renderAll();
        showToast('Daily goals updated!');
      }
    });

    // Storage Tools: Export
    exportDataBtn.addEventListener('click', () => {
      const exportObject = {
        app: 'NutriPulse Calorie Tracker',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        goals: goalsData,
        meals: mealsData
      };
      const jsonStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutripulse_backup_${currentDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Export downloaded successfully!');
    });

    // Storage Tools: Import
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.meals && typeof imported.meals === 'object') {
            if (confirm('Importing this file will merge into your current logs. Continue?')) {
              mealsData = Object.assign({}, mealsData, imported.meals);
              if (imported.goals) {
                goalsData = Object.assign({}, goalsData, imported.goals);
              }
              saveMealsToStorage();
              saveGoalsToStorage();
              renderAll();
              showToast('Backup imported successfully!');
            }
          } else {
            alert('Invalid backup file format. Expected "meals" data object.');
          }
        } catch (err) {
          alert('Failed to parse the JSON backup file.');
        }
      };
      reader.readAsText(file);
      // reset file input
      importFileInput.value = '';
    });

    // Storage Tools: Clear Today
    clearTodayBtn.addEventListener('click', () => {
      const count = (mealsData[currentDate] || []).length;
      if (count === 0) {
        showToast('No entries to clear for today.');
        return;
      }
      if (confirm(`Are you sure you want to delete all ${count} food logs for ${dateDisplayLabel.textContent}?`)) {
        delete mealsData[currentDate];
        saveMealsToStorage();
        renderAll();
        showToast(`Cleared food logs for ${dateDisplayLabel.textContent}`);
      }
    });

    // Storage Tools: Wipe All
    resetAllBtn.addEventListener('click', () => {
      if (confirm('⚠️ WARNING: This will permanently erase ALL logged days and reset your goals. Proceed?')) {
        localStorage.removeItem(STORAGE_KEY_MEALS);
        localStorage.removeItem(STORAGE_KEY_GOALS);
        mealsData = {};
        goalsData = Object.assign({}, DEFAULT_GOALS);
        renderAll();
        showToast('All browser data has been wiped.');
      }
    });

    // Keyboard Shortcuts (Escape closes modal)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && goalsModal.classList.contains('open')) {
        closeGoalsModal();
      }
    });
  }

  // --- Utility Functions ---
  function generateId() {
    return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
      toastTimer = null;
    }, 2800);
  }

  // Kickoff on DOMContentLoaded or immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

