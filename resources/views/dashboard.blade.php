@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div x-data="dashboard" 
     @logout.window="$store.navigation.navigateTo('welcome')"
     class="min-h-screen bg-background transition-colors duration-500">

    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-40 transition-all duration-300"
         :class="sidebarOpen ? 'w-64' : 'w-16'">
        <div class="h-full bg-sidebar border-r border-sidebar-border shadow-xl">
            
            <!-- Logo Section -->
            <div class="p-4 border-b border-sidebar-border">
                <div class="flex items-center space-x-3" :class="!sidebarOpen && 'justify-center'">
                    @include('components.logo', ['width' => 32, 'height' => 32, 'class' => 'flex-shrink-0'])
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0 transform scale-95"
                          x-transition:enter-end="opacity-100 transform scale-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100 transform scale-100"
                          x-transition:leave-end="opacity-0 transform scale-95"
                          class="gradient-text-primary">HRoS</span>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="p-4 space-y-2">
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground group"
                   :class="!sidebarOpen && 'justify-center'">
                    <div class="w-5 h-5 group-hover:scale-110 transition-transform" x-html="createLucideIcon('users', 'w-5 h-5')"></div>
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0"
                          x-transition:enter-end="opacity-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100"
                          x-transition:leave-end="opacity-0">Dashboard</span>
                </a>
                
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                   :class="!sidebarOpen && 'justify-center'">
                    <div class="w-5 h-5 group-hover:scale-110 transition-transform" x-html="createLucideIcon('user-check', 'w-5 h-5')"></div>
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0"
                          x-transition:enter-end="opacity-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100"
                          x-transition:leave-end="opacity-0">Employees</span>
                </a>
                
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                   :class="!sidebarOpen && 'justify-center'">
                    <div class="w-5 h-5 group-hover:scale-110 transition-transform" x-html="createLucideIcon('clock', 'w-5 h-5')"></div>
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0"
                          x-transition:enter-end="opacity-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100"
                          x-transition:leave-end="opacity-0">Attendance</span>
                </a>
                
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                   :class="!sidebarOpen && 'justify-center'">
                    <div class="w-5 h-5 group-hover:scale-110 transition-transform" x-html="createLucideIcon('award', 'w-5 h-5')"></div>
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0"
                          x-transition:enter-end="opacity-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100"
                          x-transition:leave-end="opacity-0">Performance</span>
                </a>
                
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                   :class="!sidebarOpen && 'justify-center'">
                    <div class="w-5 h-5 group-hover:scale-110 transition-transform" x-html="createLucideIcon('trending-up', 'w-5 h-5')"></div>
                    <span x-show="sidebarOpen" 
                          x-transition:enter="transition ease-out duration-200 delay-100"
                          x-transition:enter-start="opacity-0"
                          x-transition:enter-end="opacity-100"
                          x-transition:leave="transition ease-in duration-150"
                          x-transition:leave-start="opacity-100"
                          x-transition:leave-end="opacity-0">Reports</span>
                </a>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <div class="transition-all duration-300" :class="sidebarOpen ? 'ml-64' : 'ml-16'">
        
        <!-- Header -->
        <header class="bg-card border-b border-border p-4 shadow-sm">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <!-- Sidebar Toggle -->
                    <button @click="toggleSidebar()" 
                            class="p-2 rounded-lg hover:bg-muted transition-colors duration-200">
                        <div class="w-6 h-6" x-html="createLucideIcon('menu', 'w-6 h-6')"></div>
                    </button>
                    
                    <!-- Page Title -->
                    <h1 class="text-2xl gradient-text-primary">Employee Dashboard</h1>
                </div>

                <div class="flex items-center space-x-4">
                    <!-- Search -->
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <div class="w-5 h-5 text-muted-foreground" x-html="createLucideIcon('search', 'w-5 h-5')"></div>
                        </div>
                        <input x-model="searchQuery"
                               type="text" 
                               placeholder="Search employees..."
                               class="w-64 pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200">
                    </div>

                    <!-- Notifications -->
                    <button class="p-2 rounded-lg hover:bg-muted transition-colors duration-200 relative">
                        <div class="w-6 h-6" x-html="createLucideIcon('bell', 'w-6 h-6')"></div>
                        <span class="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
                    </button>

                    <!-- Theme Toggle -->
                    @include('components.theme-toggle')

                    <!-- User Menu -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" 
                                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors duration-200">
                            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <span class="text-sm">A</span>
                            </div>
                            <span class="hidden md:block">Admin</span>
                            <div class="w-4 h-4 transition-transform duration-200" :class="open && 'rotate-180'" x-html="createLucideIcon('chevron-right', 'w-4 h-4')"></div>
                        </button>

                        <!-- Dropdown Menu -->
                        <div x-show="open" 
                             @click.away="open = false"
                             x-transition:enter="transition ease-out duration-200"
                             x-transition:enter-start="opacity-0 transform scale-95"
                             x-transition:enter-end="opacity-100 transform scale-100"
                             x-transition:leave="transition ease-in duration-150"
                             x-transition:leave-start="opacity-100 transform scale-100"
                             x-transition:leave-end="opacity-0 transform scale-95"
                             class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50">
                            <div class="py-2">
                                <a href="#" class="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors duration-200">
                                    <div class="w-4 h-4" x-html="createLucideIcon('user', 'w-4 h-4')"></div>
                                    <span>Profile</span>
                                </a>
                                <a href="#" class="flex items-center space-x-2 px-4 py-2 hover:bg-muted transition-colors duration-200">
                                    <div class="w-4 h-4" x-html="createLucideIcon('gear', 'w-4 h-4')"></div>
                                    <span>Settings</span>
                                </a>
                                <hr class="my-2 border-border">
                                <button @click="logout()" 
                                        class="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-muted transition-colors duration-200 text-destructive">
                                    <div class="w-4 h-4" x-html="createLucideIcon('log-out', 'w-4 h-4')"></div>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <main class="p-6">
            <!-- Stats Overview -->
            <div class="mb-8">
                <h2 class="text-xl mb-6">Employee Status Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <template x-for="(stat, index) in employeeStats" :key="index">
                        <div class="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
                             :style="`animation-delay: ${index * 0.1}s`">
                            
                            <!-- Icon -->
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 rounded-xl"
                                     :class="stat.color">
                                    <div class="w-6 h-6 text-white" x-html="createLucideIcon(stat.icon, 'w-6 h-6')"></div>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl gradient-text-primary" x-text="stat.count.toLocaleString()"></div>
                                    <div class="text-xs text-muted-foreground">Total</div>
                                </div>
                            </div>

                            <!-- Status -->
                            <div class="space-y-2">
                                <h3 class="text-lg" x-text="stat.status"></h3>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-muted-foreground">Status</span>
                                    <span class="px-2 py-1 rounded-full text-xs"
                                          :class="stat.color.replace('bg-', 'bg-').replace('-500', '-100') + ' ' + stat.color.replace('bg-', 'text-')">
                                        <span x-text="stat.status"></span>
                                    </span>
                                </div>
                            </div>

                            <!-- Progress Bar -->
                            <div class="mt-4">
                                <div class="w-full bg-muted/30 rounded-full h-2">
                                    <div class="h-2 rounded-full transition-all duration-1000 animate-pulse"
                                         :class="stat.color"
                                         :style="`width: ${Math.min((stat.count / 1500) * 100, 100)}%`"></div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mb-8">
                <h2 class="text-xl mb-6">Quick Actions</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button class="p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-105 text-left group">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                <div class="w-5 h-5 text-white" x-html="createLucideIcon('user-check', 'w-5 h-5')"></div>
                            </div>
                            <div>
                                <div class="font-medium">Add Employee</div>
                                <div class="text-sm text-muted-foreground">Register new employee</div>
                            </div>
                        </div>
                    </button>

                    <button class="p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-105 text-left group">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                <div class="w-5 h-5 text-white" x-html="createLucideIcon('trending-up', 'w-5 h-5')"></div>
                            </div>
                            <div>
                                <div class="font-medium">Generate Report</div>
                                <div class="text-sm text-muted-foreground">Create detailed reports</div>
                            </div>
                        </div>
                    </button>

                    <button class="p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-105 text-left group">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                                <div class="w-5 h-5 text-white" x-html="createLucideIcon('clock', 'w-5 h-5')"></div>
                            </div>
                            <div>
                                <div class="font-medium">Attendance</div>
                                <div class="text-sm text-muted-foreground">View attendance records</div>
                            </div>
                        </div>
                    </button>

                    <button class="p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-105 text-left group">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                                <div class="w-5 h-5 text-white" x-html="createLucideIcon('award', 'w-5 h-5')"></div>
                            </div>
                            <div>
                                <div class="font-medium">Performance</div>
                                <div class="text-sm text-muted-foreground">Track performance metrics</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Recent Activity -->
            <div>
                <h2 class="text-xl mb-6">Recent Activity</h2>
                <div class="bg-card rounded-2xl border border-border p-6">
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div class="p-2 bg-green-500 rounded-lg">
                                <div class="w-4 h-4 text-white" x-html="createLucideIcon('user-check', 'w-4 h-4')"></div>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">New employee John Doe registered</div>
                                <div class="text-sm text-muted-foreground">2 hours ago</div>
                            </div>
                        </div>

                        <div class="flex items-center space-x-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div class="p-2 bg-blue-500 rounded-lg">
                                <div class="w-4 h-4 text-white" x-html="createLucideIcon('trending-up', 'w-4 h-4')"></div>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">Monthly report generated</div>
                                <div class="text-sm text-muted-foreground">4 hours ago</div>
                            </div>
                        </div>

                        <div class="flex items-center space-x-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div class="p-2 bg-yellow-500 rounded-lg">
                                <div class="w-4 h-4 text-white" x-html="createLucideIcon('clock', 'w-4 h-4')"></div>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">Attendance records updated</div>
                                <div class="text-sm text-muted-foreground">6 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
@endsection