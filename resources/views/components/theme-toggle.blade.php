<div x-data="themeManager" class="flex items-center space-x-4 bg-card/90 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200">
    <div class="transition-all duration-400"
         :class="theme === 'light' ? 'rotate-0 scale-100' : 'rotate-180 scale-75'">
        <div class="h-5 w-5 text-amber-500" x-html="createLucideIcon('sun', 'h-5 w-5')"></div>
    </div>
    
    <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" 
               class="sr-only peer" 
               :checked="theme === 'dark'"
               @change="toggleTheme()">
        <div class="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 peer-checked:bg-primary scale-125"></div>
    </label>
    
    <div class="transition-all duration-400"
         :class="theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-180 scale-75'">
        <div class="h-5 w-5 text-blue-500" x-html="createLucideIcon('moon', 'h-5 w-5')"></div>
    </div>
    
    <span class="text-sm gradient-text-primary" x-text="theme === 'dark' ? 'Dark Mode' : 'Light Mode'"></span>
</div>