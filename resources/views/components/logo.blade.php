<div class="{{ $class ?? '' }}" style="width: {{ $width ?? 120 }}px; height: {{ $height ?? 48 }}px;">
    <svg viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
        <!-- Background Circle -->
        <circle cx="24" cy="24" r="20" class="fill-primary/10 stroke-primary/20" stroke-width="2"/>
        
        <!-- Main Logo Shape -->
        <path d="M12 16h8v16h-4v-12h-4v12h-4V16z" class="fill-primary"/>
        <path d="M24 16h8c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4h-4v4h-4V16z" class="fill-primary"/>
        <path d="M28 20v4h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z" class="fill-background"/>
        
        <!-- Text -->
        <text x="52" y="20" class="fill-foreground text-sm font-bold">HRoS</text>
        <text x="52" y="32" class="fill-muted-foreground text-xs">Human Resource</text>
        <text x="52" y="42" class="fill-muted-foreground text-xs">Operations System</text>
        
        <!-- Decorative Elements -->
        <circle cx="100" cy="12" r="2" class="fill-primary animate-pulse"/>
        <circle cx="108" cy="18" r="1.5" class="fill-accent animate-pulse" style="animation-delay: 0.5s;"/>
        <circle cx="96" cy="24" r="1" class="fill-secondary animate-pulse" style="animation-delay: 1s;"/>
    </svg>
</div>