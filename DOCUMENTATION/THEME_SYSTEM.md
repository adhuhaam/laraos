# HRoS Theme System Documentation

## Overview

The HRoS (Human Resource Operations System) implements a comprehensive dark/light theme system using CSS custom properties (variables) and React Context. This ensures all UI components automatically adapt to theme changes with smooth transitions.

## Features

### ✅ Complete Theme Coverage
- **All UI Components**: Every shadcn/ui component is theme-aware
- **Custom Components**: All custom components use semantic color variables
- **Form Elements**: Inputs, selects, textareas adapt automatically
- **Interactive States**: Hover, focus, active states respect the theme
- **Toasts & Notifications**: Theme-compatible messaging system

### ✅ Smooth Transitions
- **Automatic Transitions**: All elements transition smoothly between themes
- **Optimized Performance**: Transition delays prevent visual glitches
- **Preserved Animations**: Motion animations continue during theme changes

### ✅ System Integration
- **OS Preference Detection**: Automatically detects system dark/light preference
- **Persistent Settings**: Theme choice saved to localStorage
- **Hydration Safe**: Prevents flash of wrong theme on page load

## Theme Structure

### CSS Variables

#### Light Mode Colors
```css
:root {
  --background: #D1D1D1;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --secondary: oklch(0.95 0.0058 264.53);
  --muted: #BEBEBE;
  --accent: #D9D9D9;
  --card: #E8E8E8;
  --border: rgba(0, 0, 0, 0.15);
  /* ... additional variables */
}
```

#### Dark Mode Colors
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --secondary: oklch(0.269 0 0);
  --muted: oklch(0.269 0 0);
  --accent: oklch(0.269 0 0);
  --card: oklch(0.145 0 0);
  --border: oklch(0.269 0 0);
  /* ... additional variables */
}
```

### Semantic Color System

All colors use semantic naming for consistency:

- `background` / `foreground` - Main page colors
- `primary` / `primary-foreground` - Primary action colors
- `secondary` / `secondary-foreground` - Secondary elements
- `muted` / `muted-foreground` - Subtle text and backgrounds
- `accent` / `accent-foreground` - Highlight colors
- `card` / `card-foreground` - Card/panel backgrounds
- `destructive` / `destructive-foreground` - Error/danger states
- `border` - Border colors
- `input` / `input-background` - Form element colors
- `ring` - Focus ring colors

## Usage

### Theme Provider Setup

```tsx
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

### Using Theme in Components

```tsx
import { useTheme } from './components/ThemeProvider'

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from './components/ThemeToggle'

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  )
}
```

## Implementation Best Practices

### 1. Use Semantic Colors
Always use CSS variables instead of hardcoded colors:

```tsx
// ✅ Good - uses theme variables
<div className="bg-background text-foreground border border-border">

// ❌ Bad - hardcoded colors
<div className="bg-white text-black border border-gray-300">
```

### 2. Leverage Tailwind Classes
Use Tailwind's semantic color classes:

```tsx
// ✅ Theme-aware classes
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground">
<p className="text-muted-foreground">
```

### 3. Custom Component Styling
For custom components, use CSS variables directly:

```css
.custom-component {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}
```

## Component Examples

### Theme-Aware Button Variants
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      }
    }
  }
)
```

### Theme-Aware Form Elements
```tsx
<Input className="
  bg-input-background 
  text-foreground 
  border-border 
  focus:border-ring 
  placeholder:text-muted-foreground
" />
```

## Advanced Features

### Dark Mode Specific Styles
Use the `dark:` prefix for dark-mode specific styling:

```tsx
<div className="
  bg-white dark:bg-slate-900 
  text-black dark:text-white
  shadow-lg dark:shadow-xl
">
```

### Theme Transition Control
The system automatically handles smooth transitions, but you can control them:

```css
/* Disable transitions during theme change */
[data-theme-transition] * {
  transition: none !important;
}
```

### Custom Scrollbars
Scrollbars automatically adapt to the theme:

```css
::-webkit-scrollbar-thumb {
  background: var(--color-muted-foreground);
}

.dark ::-webkit-scrollbar-thumb {
  background: var(--color-muted-foreground);
}
```

## Testing Theme Compatibility

### Theme Demo Component
Use the built-in `ThemeDemo` component to test all UI elements:

```tsx
import { ThemeDemo } from './components/ThemeDemo'

// Navigate to Settings > Theme Demo in the dashboard
```

### Manual Testing Checklist

- [ ] All text is readable in both themes
- [ ] Form elements have proper contrast
- [ ] Hover states are visible
- [ ] Focus indicators are clear
- [ ] Loading states are visible
- [ ] Error states are distinguishable
- [ ] Success states are clear
- [ ] Disabled states are apparent

## Accessibility Considerations

### Color Contrast
- Light mode: Minimum 4.5:1 contrast ratio
- Dark mode: Minimum 4.5:1 contrast ratio
- Focus indicators: Minimum 3:1 contrast ratio

### System Preferences
- Respects `prefers-color-scheme` media query
- Supports system-level theme changes
- Maintains user preference across sessions

### Reduced Motion
The system respects `prefers-reduced-motion` for users who prefer minimal animations.

## Browser Support

- **Modern Browsers**: Full support (Chrome 88+, Firefox 85+, Safari 14+)
- **CSS Variables**: Required for theme system
- **CSS Custom Properties**: Used for dynamic theming
- **Local Storage**: Used for persistence

## Performance

### Optimizations
- CSS variables compile to static values in production
- Minimal JavaScript for theme switching
- Smooth transitions without layout shifts
- Efficient re-renders using React Context

### Bundle Size
- Theme system adds <2KB to bundle size
- No runtime CSS generation
- Efficient CSS variable updates

## Migration Guide

### From Hardcoded Colors
1. Replace hardcoded Tailwind colors with semantic ones
2. Update custom CSS to use CSS variables
3. Test in both light and dark modes
4. Verify accessibility standards

### Adding New Components
1. Use semantic color variables from the start
2. Test in both themes during development
3. Include hover/focus states
4. Add to the theme demo for testing

## Troubleshooting

### Common Issues

#### Flash of Wrong Theme
```tsx
// Ensure ThemeProvider is at the root level
function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

#### Component Not Theme-Aware
```tsx
// Check if using semantic colors
// ❌ Wrong
<div className="bg-white text-black">

// ✅ Correct  
<div className="bg-background text-foreground">
```

#### Transitions Too Slow/Fast
```css
/* Adjust transition duration in globals.css */
* {
  transition: background-color 0.2s ease; /* Faster */
}
```

## Contributing

When adding new components or features:

1. Always use semantic color variables
2. Test in both light and dark modes
3. Ensure proper contrast ratios
4. Add to theme demo if appropriate
5. Update documentation if needed

## Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [prefers-color-scheme (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)