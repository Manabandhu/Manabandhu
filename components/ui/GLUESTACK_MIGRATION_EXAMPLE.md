# Gluestack UI Components - Migration Guide

## ✅ Components Created

All Gluestack UI components have been created and are ready to use! They follow Gluestack UI patterns but use NativeWind/Tailwind directly for maximum compatibility.

### Available Components:
- ✅ `GluestackButton` - Button component with variants
- ✅ `GluestackInput` - Input component with floating labels
- ✅ `GluestackCard` - Card component
- ✅ `GluestackCheckbox` - Checkbox component
- ✅ `GluestackSwitch` - Switch/Toggle component
- ✅ `GluestackProgress` - Progress bar component

---

## 📦 Import

```tsx
import {
  GluestackButton,
  GluestackInput,
  GluestackCard,
  GluestackCheckbox,
  GluestackSwitch,
  GluestackProgress,
} from "@/components/ui/gluestack-index";
```

---

## 🔄 Migration Examples

### Button Migration

**Before (Custom Button):**
```tsx
import { Button } from "@/components/ui/Button";

<Button
  title="Sign in"
  onPress={handleSubmit}
  loading={loading}
  fullWidth
  variant="primary"
/>
```

**After (Gluestack Button):**
```tsx
import { GluestackButton } from "@/components/ui/gluestack-index";

<GluestackButton
  onPress={handleSubmit}
  isLoading={loading}
  fullWidth
  variant="primary"
>
  Sign in
</GluestackButton>
```

### Input Migration

**Before (Custom Input):**
```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  placeholder="Email address"
  value={value}
  onChangeText={onChange}
  error={error?.message}
  leftIcon={<EmailIcon />}
/>
```

**After (Gluestack Input):**
```tsx
import { GluestackInput } from "@/components/ui/gluestack-index";

<GluestackInput
  label="Email"
  placeholder="Email address"
  value={value}
  onChangeText={onChange}
  error={error?.message}
  leftElement={<EmailIcon size={20} color="#6B7280" />}
  floatingLabel
/>
```

### Checkbox Migration

**Before (Custom Checkbox):**
```tsx
import { Checkbox } from "@/components/ui/Checkbox";

<Checkbox
  checked={rememberMe}
  onToggle={() => setRememberMe(!rememberMe)}
  label={<Text>Remember me</Text>}
/>
```

**After (Gluestack Checkbox):**
```tsx
import { GluestackCheckbox } from "@/components/ui/gluestack-index";

<GluestackCheckbox
  isChecked={rememberMe}
  onChange={(checked) => setRememberMe(checked)}
  label="Remember me"
/>
```

### Card Migration

**Before (Custom Card):**
```tsx
import { Card } from "@/components/ui/Card";

<Card selected={isSelected} onPress={handlePress}>
  <Text>Card Content</Text>
</Card>
```

**After (Gluestack Card):**
```tsx
import { GluestackCard } from "@/components/ui/gluestack-index";

<GluestackCard isSelected={isSelected} onPress={handlePress}>
  <Text>Card Content</Text>
</GluestackCard>
```

### Switch/Toggle Migration

**Before (Custom Toggle):**
```tsx
import { Toggle } from "@/components/ui/Toggle";

<Toggle
  value={enabled}
  onValueChange={setEnabled}
/>
```

**After (Gluestack Switch):**
```tsx
import { GluestackSwitch } from "@/components/ui/gluestack-index";

<GluestackSwitch
  isChecked={enabled}
  onToggle={(checked) => setEnabled(checked)}
/>
```

### Progress Migration

**Before (Custom Progress):**
```tsx
import { Progress } from "@/components/ui/Progress";

<Progress current={2} total={5} showLabel />
```

**After (Gluestack Progress):**
```tsx
import { GluestackProgress } from "@/components/ui/gluestack-index";

<GluestackProgress value={2} max={5} showLabel />
```

---

## 🎯 Key Differences

### Prop Naming:
- `title` → `children` (for Button)
- `loading` → `isLoading`
- `disabled` → `isDisabled`
- `checked` → `isChecked`
- `onToggle` → `onChange` (for Checkbox)
- `onValueChange` → `onToggle` (for Switch)
- `current/total` → `value/max` (for Progress)
- `leftIcon` → `leftElement`
- `rightIcon` → `rightElement`

### Benefits:
- ✅ Same NativeWind/Tailwind styling
- ✅ Consistent API patterns
- ✅ Better TypeScript support
- ✅ More flexible (children instead of title)
- ✅ Follows Gluestack UI conventions

---

## 🚀 Next Steps

1. **Gradual Migration**: Start using Gluestack components in new features
2. **Update Existing**: Replace old components as you work on those files
3. **Keep Custom**: OTPInput, SplashScreen, Logo, ErrorBoundary stay custom

---

## 📝 Notes

- All components work with your existing NativeWind setup
- No provider needed - they work out of the box
- Fully compatible with iOS, Android, and Web
- TypeScript types are included

