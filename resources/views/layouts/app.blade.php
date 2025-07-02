<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'HRoS') }} - @yield('title', 'Human Resource Operations System')</title>
    
    <!-- Preconnect to external resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Scripts and Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Meta Tags -->
    <meta name="description" content="HRoS - Comprehensive Human Resource Operations System for modern workforce management">
    <meta name="keywords" content="HR, Human Resources, Employee Management, Workforce, HRoS">
    <meta name="author" content="HRoS Team">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    
    @stack('head')
</head>
<body class="antialiased"
      x-data="{
          themeManager: $store.themeManager,
          navigation: $store.navigation
      }"
      x-init="
          $store.themeManager = Alpine.store('themeManager', {
              theme: Alpine.$persist('light').as('hros-theme'),
              init() {
                  this.updateTheme();
              },
              toggleTheme() {
                  this.theme = this.theme === 'light' ? 'dark' : 'light';
                  this.updateTheme();
              },
              updateTheme() {
                  if (this.theme === 'dark') {
                      document.documentElement.classList.add('dark');
                  } else {
                      document.documentElement.classList.remove('dark');
                  }
              }
          });
          
          $store.navigation = Alpine.store('navigation', {
              currentPage: Alpine.$persist('{{ $currentPage ?? 'welcome' }}').as('hros-current-page'),
              isTransitioning: false,
              
              navigateTo(page) {
                  if (this.isTransitioning || this.currentPage === page) return;
                  
                  this.isTransitioning = true;
                  
                  // Navigate using Laravel routes
                  window.location.href = page === 'welcome' ? '/' : '/' + page;
              }
          });
          
          $store.themeManager.init();
      "
      :class="{ 'dark': $store.themeManager.theme === 'dark' }">

    <!-- Mouse Follower -->
    <div x-data="mouseFollower" 
         class="fixed pointer-events-none z-50 w-6 h-6 rounded-full bg-primary/20 blur-sm transition-all duration-300"
         :style="`transform: translate(${x}px, ${y}px)`"
         x-cloak></div>

    <!-- Main Content -->
    <main id="app" class="w-full min-h-screen">
        @yield('content')
    </main>

    <!-- Scripts -->
    @stack('scripts')
    
    <!-- Alpine.js Event Listeners -->
    <div x-data 
         @login-success.window="$store.navigation.navigateTo('dashboard')"
         @logout.window="$store.navigation.navigateTo('welcome')"
         x-cloak></div>
</body>
</html>