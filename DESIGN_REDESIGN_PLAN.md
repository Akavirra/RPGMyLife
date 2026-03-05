# План редизайну системи RPG My Life

## Дизайн-система v2.0 — Світла мінімалістична тема

---

## 1. Кольорова гама

### 1.1 Основні кольори

| Назва | HEX | RGB | Використання |
|-------|-----|-----|--------------|
| Background Primary | `#FAFBFC` | 250, 251, 252 | Основний фон сторінки |
| Background Secondary | `#FFFFFF` | 255, 255, 255 | Картки, модальні вікна |
| Background Tertiary | `#F4F5F7` | 244, 245, 247 | Альтернативний фон, hover стани |
| Border Light | `#E8EAED` | 232, 234, 237 | Легкі межі, розділювачі |
| Border Medium | `#D0D3D6` | 208, 211, 214 | Активні межі |

### 1.2 Акцентні кольори (пастельні)

| Назва | HEX | RGB | Використання |
|-------|-----|-----|--------------|
| Accent Primary | `#5B8DEF` | 91, 141, 239 | Основні кнопки, посилання |
| Accent Hover | `#4A7BD4` | 74, 123, 212 | Hover стан основного акценту |
| Accent Success | `#34A853` | 52, 168, 83 | Успіх, виконані квести |
| Accent Warning | `#FBBC04` | 251, 188, 4 | Попередження, складність |
| Accent Danger | `#EA4335` | 234, 67, 53 | Помилки, небезпека |
| Accent Purple | `#A78BFA` | 167, 139, 250 | Навички, XP |

### 1.3 Текстові кольори

| Назва | HEX | RGB | Використання |
|-------|-----|-----|--------------|
| Text Primary | `#1F2937` | 31, 41, 55 | Основний текст, заголовки |
| Text Secondary | `#6B7280` | 107, 114, 128 | Опис, вторинна інформація |
| Text Muted | `#9CA3AF` | 156, 163, 175 | Плейсхолдери, підказки |
| Text Disabled | `#D1D5DB` | 209, 213, 217 | Неактивний текст |

### 1.4 CSS змінні

```css
:root {
  /* Backgrounds */
  --bg-primary: #FAFBFC;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F4F5F7;
  --bg-hover: #F0F2F5;
  
  /* Borders */
  --border-light: #E8EAED;
  --border-medium: #D0D3D6;
  
  /* Text */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --text-disabled: #D1D5DB;
  
  /* Accents */
  --accent-primary: #5B8DEF;
  --accent-primary-hover: #4A7BD4;
  --accent-success: #34A853;
  --accent-warning: #FBBC04;
  --accent-danger: #EA4335;
  --accent-purple: #A78BFA;
  
  /* Shadows - легкі, повітряні */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-focus: 0 0 0 3px rgba(91, 141, 239, 0.15);
}
```

---

## 2. Типографіка

### 2.1 Шрифтова система

| Рівень | Розмір | Вага | Висота рядка | Letter Spacing | Призначення |
|--------|--------|------|--------------|----------------|-------------|
| Display | 36px / 2.25rem | 700 | 1.2 | -0.02em | Головні заголовки |
| H1 | 32px / 2rem | 600 | 1.25 | -0.01em | Секції |
| H2 | 24px / 1.5rem | 600 | 1.3 | -0.01em | Підзаголовки |
| H3 | 20px /rem | 600 | 1. 1.254 | 0 | Картки, компоненти |
| Body | 16px / 1rem | 400 | 1.6 | 0 | Основний текст |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 | Опис |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.02em | Бейджі, лейбли |

### 2.2 Рекомендовані шрифти

```css
/* Main font - Inter or system font stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;

/* Headings - більш виразні */
h1, h2, h3 {
  font-weight: 600;
  color: var(--text-primary);
}

/* Body text */
p, span, div {
  font-weight: 400;
  color: var(--text-secondary);
}
```

### 2.3 Ієрархія заголовків

```css
h1 {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
```

---

## 3. Система відступів (Spacing)

### 3.1 Base spacing scale

| Назва | PX | REM | Використання |
|-------|-----|-----|--------------|
| xs | 4px | 0.25 | Inline елементи |
| sm | 8px | 0.5 | Внутрішні відступи |
| md | 16px | 1 | Стандартні відступи |
| lg | 24px | 1.5 | Секції |
| xl | 32px | 2 | Великі секції |
| 2xl | 48px | 3 | Відступи між картками |

### 3.2 Padding для компонентів

```css
/* Картки */
.card-padding {
  padding: 24px; /* p-6 */
}

/* Кнопки */
.btn-padding {
  padding: 10px 20px; /* px-5 py-2.5 */
}

/* Форми */
.input-padding {
  padding: 12px 16px; /* px-4 py-3 */
}

/* Модальні вікна */
.modal-padding {
  padding: 32px; /* p-8 */
}
```

---

## 4. Компоненти — Детальні специфікації

### 4.1 Кнопки (Button)

#### Варіанти

| Варіант | Фон | Текст | Border | Hover |
|---------|-----|-------|--------|-------|
| Primary | `#5B8DEF` | `#FFFFFF` | none | `#4A7BD4` |
| Secondary | `#F4F5F7` | `#1F2937` | `#E8EAED` | `#E8EAED` |
| Ghost | transparent | `#6B7280` | none | `#F4F5F7` |
| Outline | transparent | `#5B8DEF` | `#5B8DEF` | `#F0F5FF` |
| Danger | `#EA4335` | `#FFFFFF` | none | `#D33426` |

#### Розміри

| Розмір | Height | Font Size | Padding | Border Radius |
|--------|--------|------------|---------|----------------|
| sm | 32px | 0.875rem | px-3 py-1.5 | 6px |
| md | 40px | 0.9375rem | px-4 py-2 | 8px |
| lg | 48px | 1rem | px-6 py-2.5 | 10px |

#### CSS властивості

```css
/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  outline: none;
}

/* Primary button */
.btn-primary {
  background-color: #5B8DEF;
  color: white;
  box-shadow: 0 1px 2px rgba(91, 141, 239, 0.2);
}

.btn-primary:hover {
  background-color: #4A7BD4;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(91, 141, 239, 0.25);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Focus state */
.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.25);
}

/* Disabled state */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### States

- **Default**: Базовий вигляд
- **Hover**: Зміна кольору + легке підняття (translateY -1px)
- **Active**: Повернення на місце, легке затемнення
- **Focus**: Кільце фокусу (box-shadow)
- **Disabled**: 50% opacity, no pointer events

---

### 4.2 Форми вводу (Input)

#### Специфікація

```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  outline: none;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:hover {
  border-color: var(--border-medium);
}

.input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.1);
}

.input:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

/* Error state */
.input-error {
  border-color: var(--accent-danger);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.1);
}
```

#### Textarea

```css
.textarea {
  resize: vertical;
  min-height: 100px;
}
```

#### Select

```css
.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}
```

---

### 4.3 Картки (Card)

#### Варіанти

| Варіант | Фон | Border | Shadow | Призначення |
|---------|-----|--------|--------|-------------|
| Default | white | #E8EAED | shadow-sm | Стандартні картки |
| Glass | rgba(255,255,255,0.8) | #E8EAED | shadow-md | Прозорі картки |
| Bordered | transparent | #E8EAED | none | Виділені картки |

#### CSS

```css
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-medium);
}

/* Card header */
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* Card content */
.card-content {
  padding: 24px;
}

/* Card footer */
.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 12px;
}
```

#### Hover ефект

```css
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
```

---

### 4.4 Таблиці (Table)

#### CSS

```css
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-secondary);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
}

.table td {
  padding: 16px;
  font-size: 0.9375rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background-color: var(--bg-hover);
}
```

---

### 4.5 Модальні вікна (Modal)

#### CSS

```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 50;
  animation: fadeIn 0.2s ease;
}

/* Modal container */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: 51;
  animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  background: transparent;
}

.modal-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

#### Анімація

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

---

### 4.6 Навігаційне меню (Bottom Nav)

#### CSS

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  z-index: 50;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.bottom-nav-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.bottom-nav-item.active {
  color: var(--accent-primary);
}

.bottom-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 8px;
  width: 20px;
  height: 3px;
  background-color: var(--accent-primary);
  border-radius: 3px;
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-label {
  font-size: 0.6875rem;
  font-weight: 500;
}
```

---

### 4.7 Заголовки секцій (Section Headers)

#### CSS

```css
.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

.section-action {
  margin-top: 16px;
}
```

---

### 4.8 Бейджі (Badge)

#### Варіанти

| Варіант | Фон | Текст | Border |
|---------|-----|-------|--------|
| Default | #F4F5F7 | #6B7280 | none |
| Primary | #EFF6FF | #5B8DEF | none |
| Success | #ECFDF5 | #34A853 | none |
| Warning | #FFFBEB | #D97706 | none |
| Danger | #FEF2F2 | #EA4335 | none |
| Outline | transparent | #6B7280 | #E8EAED |

#### CSS

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 100px;
  line-height: 1.5;
}
```

---

### 4.9 Progress Bar

#### CSS

```css
.progress-container {
  width: 100%;
}

.progress-track {
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Variants */
.progress-default .progress-fill {
  background-color: var(--accent-primary);
}

.progress-success .progress-fill {
  background: linear-gradient(90deg, #34A853, #46C663);
}

.progress-warning .progress-fill {
  background: linear-gradient(90deg, #FBBC04, #FCC934);
}

.progress-xp .progress-fill {
  background: linear-gradient(90deg, #A78BFA, #C4B5FD);
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.3);
}
```

---

### 4.10 Повідомлення про помилки та успіх

#### Alert CSS

```css
.alert {
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9375rem;
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.alert-message {
  color: var(--text-secondary);
}

/* Success */
.alert-success {
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
}

.alert-success .alert-icon {
  color: #34A853;
}

/* Error */
.alert-error {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
}

.alert-error .alert-icon {
  color: #EA4335;
}

/* Warning */
.alert-warning {
  background-color: #FFFBEB;
  border: 1px solid #FDE68A;
}

.alert-warning .alert-icon {
  color: #D97706;
}

/* Info */
.alert-info {
  background-color: #EFF6FF;
  border: 1px solid #BFDBFE;
}

.alert-info .alert-icon {
  color: #5B8DEF;
}
```

---

## 5. Анімації

### 5.1 Timing functions

```css
/* Smooth easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* Notion-like */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 5.2 Base animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade in up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide in from right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Shimmer (loading) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 5.3 Animation classes

```css
.animate-fade-in {
  animation: fadeIn 0.2s var(--ease-out);
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn 0.2s var(--ease-out);
}

.animate-slide-in-right {
  animation: slideInRight 0.3s var(--ease-out);
}

/* Delays */
.delay-75 { animation-delay: 75ms; }
.delay-150 { animation-delay: 150ms; }
.delay-300 { animation-delay: 300ms; }

/* Durations */
.duration-150 { animation-duration: 150ms; }
.duration-200 { animation-duration: 200ms; }
.duration-300 { animation-duration: 300ms; }
```

### 5.4 Transitions

```css
/* Base transition */
.transition-base {
  transition: all 0.2s var(--ease-out);
}

/* Colors only */
.transition-colors {
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* Transform only */
.transition-transform {
  transition: transform 0.2s var(--ease-out);
}

/* All properties */
.transition-all {
  transition: all 0.2s var(--ease-out);
}

/* Smooth hover */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.02);
}
```

### 5.5 Рекомендації щодо оптимізації анімацій

1. **Використовуйте `transform` та `opacity`** — ці властивості не викликають layout shifts
2. **Уникайте анімацій на `width`, `height`, `margin`, `padding`** — вони触发ують перерахунок layout
3. **Додавайте `will-change`** для елементів, що часто анімуються
4. **Використовуйте `prefers-reduced-motion`** для доступності
5. **Обмежте тривалість** — 150-300ms для мікро-взаємодій, 300-500ms для основних анімацій
6. **Використовуйте CSS анімації замість JS** де можливо

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Tailwind CSS конфігурація

### 6.1 Оновлена конфігурація кольорів

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: '#FAFBFC',
          secondary: '#FFFFFF',
          tertiary: '#F4F5F7',
          hover: '#F0F2F5',
        },
        // Borders
        border: {
          light: '#E8EAED',
          medium: '#D0D3D6',
        },
        // Text
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          disabled: '#D1D5DB',
        },
        // Accents
        accent: {
          primary: '#5B8DEF',
          'primary-hover': '#4A7BD4',
          success: '#34A853',
          warning: '#FBBC04',
          danger: '#EA4335',
          purple: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(91, 141, 239, 0.15)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 7. Глобальні стилі (app/globals.css оновлення)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Backgrounds */
    --bg-primary: #FAFBFC;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #F4F5F7;
    --bg-hover: #F0F2F5;
    
    /* Borders */
    --border-light: #E8EAED;
    --border-medium: #D0D3D6;
    
    /* Text */
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --text-muted: #9CA3AF;
    --text-disabled: #D1D5DB;
    
    /* Accents */
    --accent-primary: #5B8DEF;
    --accent-primary-hover: #4A7BD4;
    --accent-success: #34A853;
    --accent-warning: #FBBC04;
    --accent-danger: #EA4335;
    --accent-purple: #A78BFA;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
    --shadow-focus: 0 0 0 3px rgba(91, 141, 239, 0.15);
    
    /* Easing */
    --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: var(--bg-primary);
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
    color: var(--text-primary);
  }

  /* Custom scrollbar - light theme */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }
}

@layer components {
  /* Headings */
  h1 {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-primary);
  }

  /* Notion-style card */
  .card-notion {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s var(--ease-smooth);
  }

  .card-notion:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-medium);
  }

  /* Primary button */
  .btn-primary {
    background-color: var(--accent-primary);
    color: white;
    box-shadow: 0 1px 2px rgba(91, 141, 239, 0.2);
    transition: all 0.2s var(--ease-smooth);
  }

  .btn-primary:hover {
    background-color: var(--accent-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(91, 141, 239, 0.25);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  /* Focus ring */
  .focus-ring:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
}

@layer utilities {
  /* Safe area for mobile */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Text balance */
  .text-balance {
    text-wrap: balance;
  }

  /* Animations */
  .animate-in {
    animation: fadeInUp 0.3s var(--ease-smooth);
  }

  .animate-in-slow {
    animation: fadeInUp 0.5s var(--ease-smooth);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

## 8. Сумісність з існуючою функціональністю

### 8.1 Збереження функціональності

Всі зміни в дизайні не впливають на логіку компонентів. Оновлюються лише CSS властивості:

| Компонент | Зберігається | Оновлюється |
|-----------|--------------|-------------|
| Button | `onClick`, `disabled`, `isLoading`, `type` | Стилі, кольори, анімації |
| Card | `children`, `className`, `variant` | Стилі, тіні, бордери |
| Input | `value`, `onChange`, `placeholder`, `type` | Стилі, кольори фокусу |
| Modal | `isOpen`, `onClose`, `children`, `title` | Стилі, backdrop, анімація |
| Badge | `children`, `variant` | Кольори, fill |
| ProgressBar | `value`, `max`, `variant` | Кольори, градієнти |
| QuestCard | Всі props | Стилі картки |
| QuestForm | Всі props | Стилі інпутів |
| BottomNav | Всі props | Стилі, активний стан |

### 8.2 Приклади оновлень без зміни логіки

#### Button.tsx оновлення

```typescript
// Лише оновлюємо variant styles, логіка залишається
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary text-white hover:bg-accent-primary-hover shadow-sm hover:shadow-md hover:-translate-y-0.5',
        secondary: 'bg-bg-tertiary text-text-primary border border-border-light hover:bg-bg-hover',
        outline: 'border border-accent-primary text-accent-primary hover:bg-accent-primary/5',
        ghost: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        destructive: 'bg-accent-danger text-white hover:bg-red-600',
        success: 'bg-accent-success text-white hover:bg-green-600',
      },
      // sizes залишаються...
    },
  }
);
```

#### Card.tsx оновлення

```typescript
// Оновлюємо лише стилі
const variantStyles = {
  default: 'bg-bg-secondary border border-border-light',
  glass: 'bg-bg-secondary/80 backdrop-blur-sm border border-border-light',
  bordered: 'bg-transparent border-2 border-border-medium',
};
```

---

## 9.ровадження

### Фаза План вп 1: Базові зміни

1. Оновити Tailwind конфігурацію з новими кольорами
2. Оновити глобальні CSS змінні
3. Оновити компонент Button
4. Оновити компонент Input (включаючи форми)

### Фаза 2: Основні компоненти

1. Оновити Card та його підкомпоненти
2. Оновити Badge
3. Оновити ProgressBar
4. Оновити Modal

### Фаза 3: Комплексні компоненти

1. Оновити QuestCard
2. Оновити QuestForm
3. Оновити BottomNav
4. Оновити Header

### Фаза 4: Додаткові покращення

1. Додати нові анімації
2. Оптимізувати переходи
3. Додати loading states
4. Перевірити accessibility

---

## 10. Чеклист якості дизайну

### Візуальна узгодженість

- [ ] Всі кольори відповідають пастелній гамі
- [ ] Типографіка має чітку ієрархію
- [ ] Відступи послідовні
- [ ] Border radius однорідний

### Функціональна сумісність

- [ ] Всі існуючі функції працюють
- [ ] Hover/active/focus стани працюють
- [ ] Мобільна версія адаптивна
- [ ] Keyboard navigation працює

### Продуктивність

- [ ] Анімації плавні (60fps)
- [ ] Немає layout shifts
- [ ] Швидкий час завантаження

### Доступність

- [ ] Контраст відповідає WCAG AA
- [ ] Focus states видимі
- [ ] Reduced motion підтримується
- [ ] Screen reader сумісний
