# 📁 Modular CSS Architecture

This directory contains the modular CSS structure for the Lumière project. The CSS is organized into logical modules for better maintainability.

## 📂 Structure

```
src/css/
├── base/              # Foundation styles
│   ├── reset.css      # CSS reset & variables
│   ├── typography.css # Font definitions
│   └── cursor.css     # Custom cursor styles
│
├── components/        # Reusable components
│   ├── loader.css     # Page loader
│   ├── navigation.css # Navigation & hamburger menu
│   └── modal.css      # Contact modal
│
├── sections/          # Page sections
│   ├── hero.css       # Hero section with Three.js
│   ├── statement.css  # Statement section
│   ├── services.css   # Services grid
│   ├── works.css      # Projects/Works showcase
│   ├── marquee.css    # Scrolling marquee
│   ├── about.css      # About/Atelier section
│   ├── process.css    # Process timeline
│   ├── awards.css     # Awards list
│   └── contact.css    # Contact form
│
└── responsive/        # Responsive overrides
    ├── touch.css      # Touch device overrides
    └── tablet.css     # Tablet & mobile styles
```

## 🔧 Build Process

The modular CSS files are concatenated into `src/app/globals.css` using the build script.

### Building CSS

```bash
# Build CSS from modules
node build-css.js

# The output will be: src/app/globals.css
```

### Development Workflow

1. **Edit** individual CSS files in `src/css/`
2. **Build** using `node build-css.js`
3. **Test** with `npm run dev` or `npm run build`

## 📝 Guidelines

### Adding New Styles

1. **Identify the category**: base, component, section, or responsive
2. **Create or edit** the appropriate file in `src/css/`
3. **Run build script** to regenerate `globals.css`
4. **Test** your changes

### File Naming

- Use lowercase with hyphens: `my-component.css`
- Be descriptive: `navigation.css` not `nav.css`
- Group related styles in the same file

### CSS Organization

Each file should:
- Start with a descriptive comment header
- Group related selectors together
- Use consistent indentation (2 spaces)
- Include comments for complex logic

### Example File Structure

```css
/* ═══════════════════════════════════════════════════════════
   COMPONENT - MY COMPONENT
   ═══════════════════════════════════════════════════════════ */

.my-component {
  /* Base styles */
}

.my-component__element {
  /* Element styles */
}

.my-component--modifier {
  /* Modifier styles */
}
```

## 🚀 Benefits

### Before (Monolithic)
- ❌ 1638 lines in one file
- ❌ Hard to navigate
- ❌ Difficult to maintain
- ❌ Merge conflicts

### After (Modular)
- ✅ ~17 focused files
- ✅ Easy to find styles
- ✅ Better organization
- ✅ Fewer conflicts
- ✅ Reusable modules

## 📊 File Sizes

| Category | Files | Approx Size |
|----------|-------|-------------|
| Base | 3 | ~2 KB |
| Components | 3 | ~8 KB |
| Sections | 9 | ~20 KB |
| Responsive | 2 | ~9 KB |
| **Total** | **17** | **~39 KB** |

## ⚠️ Important Notes

1. **DO NOT** edit `src/app/globals.css` directly
2. **ALWAYS** edit files in `src/css/` and rebuild
3. **RUN** `node build-css.js` after any CSS changes
4. **COMMIT** both module files and generated `globals.css`

## 🔄 Automation

Consider adding to `package.json`:

```json
{
  "scripts": {
    "css:build": "node build-css.js",
    "css:watch": "nodemon --watch src/css --exec 'node build-css.js'",
    "dev": "npm run css:build && next dev"
  }
}
```

## 📚 Related Files

- `build-css.js` - Build script that concatenates modules
- `src/app/globals.css` - Generated output (DO NOT EDIT)
- `src/app/globals.backup.css` - Original monolithic file (backup)

---

**Last Updated:** 2026-04-27  
**Maintainer:** Development Team
