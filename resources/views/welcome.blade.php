@extends('layouts.app')

@section('title', 'Welcome')

@section('content')
<div x-data="welcomePage" 
     class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden transition-colors duration-500">
    
    <!-- Animated Particles -->
    <div class="absolute inset-0 pointer-events-none">
        <template x-for="particle in particles" :key="particle.id">
            <div class="absolute rounded-full animate-pulse-custom"
                 :style="`
                     left: ${particle.x}px;
                     top: ${particle.y}px;
                     width: ${particle.size}px;
                     height: ${particle.size}px;
                     background-color: ${$store.themeManager.theme === 'dark' ? '#3b82f6' : '#1e40af'};
                     opacity: ${particle.opacity * 0.3};
                 `"></div>
        </template>
    </div>

    <!-- Dynamic Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent/20 to-primary/10 rounded-full blur-3xl animate-float" style="animation-delay: -2s;"></div>
        <div class="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl animate-float" style="animation-delay: -1s;"></div>
    </div>

    <!-- Enhanced Header -->
    <header class="absolute top-0 left-0 right-0 z-20 p-6 animate-fade-in-down">
        <div class="flex justify-end items-center">
            <!-- Enhanced Theme Toggle -->
            <div class="flex items-center space-x-4 bg-card/90 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200">
                <div class="transition-all duration-400"
                     :class="$store.themeManager.theme === 'light' ? 'rotate-0 scale-100' : 'rotate-180 scale-75'">
                    <div class="h-5 w-5 text-amber-500" x-html="createLucideIcon('sun', 'h-5 w-5')"></div>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           class="sr-only peer" 
                           :checked="$store.themeManager.theme === 'dark'"
                           @change="$store.themeManager.toggleTheme()">
                    <div class="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 peer-checked:bg-primary scale-125"></div>
                </label>
                
                <div class="transition-all duration-400"
                     :class="$store.themeManager.theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-180 scale-75'">
                    <div class="h-5 w-5 text-blue-500" x-html="createLucideIcon('moon', 'h-5 w-5')"></div>
                </div>
                
                <span class="text-sm gradient-text-primary" x-text="$store.themeManager.theme === 'dark' ? 'Dark Mode' : 'Light Mode'"></span>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div class="max-w-6xl mx-auto text-center space-y-12">
            
            <!-- Logo with advanced animation -->
            <div class="relative animate-fade-in-up" style="animation-delay: 0.3s;">
                <div class="animate-float">
                    @include('components.logo', ['width' => 200, 'height' => 80, 'class' => 'mb-8 mx-auto'])
                </div>
                <div class="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-custom"></div>
            </div>

            <!-- Enhanced Hero Section -->
            <div class="space-y-6 animate-fade-in-up" style="animation-delay: 0.5s;">
                <h1 class="text-5xl md:text-7xl lg:text-8xl">
                    <span class="block gradient-text-primary">Welcome to</span>
                    <span class="block gradient-text-secondary">HRoS</span>
                </h1>
                
                <p class="text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    Your comprehensive
                    <span class="text-primary animate-pulse-custom">Human Resource Operations System</span>
                    <br />
                    <span class="text-lg text-muted-foreground/80">
                        Empowering teams, streamlining processes, securing futures
                    </span>
                </p>
            </div>

            <!-- Interactive Feature Showcase -->
            <div class="relative max-w-4xl mx-auto animate-fade-in-up" style="animation-delay: 0.7s;">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Main Feature Display -->
                    <div class="md:col-span-2 relative">
                        <div class="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                            <div class="text-center space-y-6">
                                <div class="mx-auto w-24 h-24 bg-gradient-to-r rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-180 transition-all duration-600 cursor-pointer"
                                     :class="features[currentFeature].color">
                                    <div class="w-12 h-12 text-white" 
                                         x-html="createLucideIcon(features[currentFeature].icon, 'w-12 h-12')"></div>
                                </div>
                                
                                <div class="space-y-4">
                                    <h3 class="text-3xl gradient-text-primary" x-text="features[currentFeature].title"></h3>
                                    <p class="text-lg text-muted-foreground leading-relaxed" x-text="features[currentFeature].description"></p>
                                    <div class="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary hover:scale-105 transition-transform duration-200 cursor-pointer" 
                                         x-text="features[currentFeature].stats"></div>
                                </div>
                            </div>

                            <!-- Floating elements -->
                            <div class="absolute top-4 right-4 text-primary/20 animate-rotate">
                                <div x-html="createLucideIcon('sparkles', 'w-6 h-6')"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature Navigation -->
                    <div class="md:col-span-2 flex justify-center space-x-3">
                        <template x-for="(feature, index) in features" :key="index">
                            <button @click="selectFeature(index)"
                                    class="relative p-4 rounded-2xl transition-all hover:scale-105 hover:-translate-y-0.5"
                                    :class="index === currentFeature 
                                        ? 'bg-primary text-primary-foreground shadow-lg' 
                                        : 'bg-card/50 backdrop-blur-sm hover:bg-card/80 border border-border/50'">
                                <div class="w-6 h-6" x-html="createLucideIcon(feature.icon, 'w-6 h-6')"></div>
                                <span class="relative z-10 block mt-2 text-xs" x-text="feature.title"></span>
                            </button>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Achievement Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style="animation-delay: 0.9s;">
                <template x-for="(achievement, index) in achievements" :key="index">
                    <div class="text-center p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:bg-card/50 transition-all cursor-pointer hover:scale-105 hover:-translate-y-2"
                         style="animation-delay: calc(1.1s + 0.1s * index);">
                        <div class="text-primary mb-3 hover:rotate-180 hover:scale-110 transition-all duration-600">
                            <div class="w-8 h-8 mx-auto" x-html="createLucideIcon(achievement.icon, 'w-8 h-8')"></div>
                        </div>
                        <div class="text-2xl md:text-3xl gradient-text-primary animate-pulse-custom" x-text="achievement.value"></div>
                        <div class="text-sm text-muted-foreground mt-1" x-text="achievement.label"></div>
                    </div>
                </template>
            </div>

            <!-- Enhanced Call to Action -->
            <div class="space-y-8 animate-fade-in-up" style="animation-delay: 1.1s;">
                <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button @click="$store.navigation.navigateTo('login')"
                            class="group relative overflow-hidden btn-gradient text-white px-10 py-4 text-lg shadow-2xl rounded-2xl transition-all hover:scale-105">
                        <div class="w-5 h-5 mr-2 inline-block" x-html="createLucideIcon('sparkles', 'w-5 h-5')"></div>
                        Get Started Now
                        <div class="w-5 h-5 ml-3 inline-block group-hover:translate-x-2 transition-transform duration-300" x-html="createLucideIcon('arrow-right', 'w-5 h-5')"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    </button>

                    <button class="px-10 py-4 text-lg bg-card/50 backdrop-blur-xl border-2 border-primary/30 hover:bg-card/80 hover:border-primary/50 shadow-xl rounded-2xl transition-all hover:scale-105">
                        <svg class="w-5 h-5 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l7-5z" />
                        </svg>
                        Watch Demo
                    </button>
                </div>

                <div class="text-center space-y-2">
                    <p class="text-muted-foreground">
                        🌟 Trusted by <span class="text-primary">10,000+</span> organizations worldwide
                    </p>
                    <p class="text-sm text-muted-foreground/70">
                        Join the revolution in human resource management
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Action Button -->
    <div x-show="showFab" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 scale-0 rotate-180"
         x-transition:enter-end="opacity-100 scale-100 rotate-0"
         x-transition:leave="transition ease-in duration-300"
         x-transition:leave-start="opacity-100 scale-100 rotate-0"
         x-transition:leave-end="opacity-0 scale-0 rotate-180"
         class="fixed bottom-8 right-8 z-30">
        <button @click="scrollToTop()"
                class="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 animate-pulse-custom">
            <div class="w-8 h-8 rotate-[-90deg]" x-html="createLucideIcon('chevron-right', 'w-8 h-8')"></div>
        </button>
    </div>
</div>
@endsection