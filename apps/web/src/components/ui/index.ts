/**
 * Barrel export for all UI primitives.
 * Import a single component: import { Button } from '@/components/ui'
 * Or import directly from the file for tree-shaking: from '@/components/ui/button'
 */

// --- Actions ---
export { Button, buttonVariants, type ButtonProps } from './button';
export { IconButton, type IconButtonProps } from './icon-button';

// --- Surfaces ---
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

// --- Badges & Chips ---
export { Badge, badgeVariants, type BadgeProps } from './badge';

// --- Forms ---
export { Input, type InputProps } from './input';
export { Textarea, type TextareaProps } from './textarea';
export { Label } from './label';
export { SearchInput, type SearchInputProps } from './search-input';
export { Switch } from './switch';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Slider } from './slider';

// --- Overlays ---
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';

// --- Menus ---
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuPortal,
} from './dropdown-menu';

// --- Navigation ---
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// --- Data display ---
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Progress } from './progress';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';
export { Separator } from './separator';
export { ScrollArea, ScrollBar } from './scroll-area';

// --- Feedback ---
export { Skeleton } from './skeleton';
export { Spinner, SpinnerOverlay, type SpinnerProps } from './spinner';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { ErrorState, type ErrorStateProps } from './error-state';

// --- Toast ---
export { Toaster } from './sonner';

// --- Typography ---
export {
  H1,
  H2,
  H3,
  H4,
  Lead,
  Text,
  Muted,
  Small,
  LabelText,
} from './typography';

// --- Bottom sheet & theme ---
export { BottomSheet, type BottomSheetProps } from './bottom-sheet';
export { ThemeToggle } from './theme-toggle';
