@extends('layouts.app')

@section('title', 'Login')

@section('content')
<div x-data="loginPage" 
     @login-success.window="$store.navigation.navigateTo('dashboard')"
     class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden transition-colors duration-500">

    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-accent/20 to-primary/10 rounded-full blur-3xl animate-float" style="animation-delay: -2s;"></div>
        <div class="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl animate-float" style="animation-delay: -1s;"></div>
    </div>

    <!-- Header -->
    <header class="absolute top-0 left-0 right-0 z-20 p-6 animate-fade-in-down">
        <div class="flex justify-between items-center">
            <!-- Back Button -->
            <button @click="$store.navigation.navigateTo('welcome')"
                    class="flex items-center space-x-2 bg-card/90 backdrop-blur-xl p-3 rounded-2xl border border-border/50 shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 text-muted-foreground hover:text-foreground">
                <div class="w-5 h-5 rotate-180" x-html="createLucideIcon('arrow-right', 'w-5 h-5')"></div>
                <span class="text-sm">Back to Welcome</span>
            </button>

            <!-- Theme Toggle -->
            @include('components.theme-toggle')
        </div>
    </header>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div class="w-full max-w-md mx-auto">
            
            <!-- Logo -->
            <div class="text-center mb-8 animate-fade-in-up">
                @include('components.logo', ['width' => 120, 'height' => 48, 'class' => 'mx-auto mb-4'])
                <h1 class="text-3xl gradient-text-primary">Welcome Back</h1>
                <p class="text-muted-foreground mt-2">Sign in to your HRoS account</p>
            </div>

            <!-- Login Card -->
            <div class="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-2xl animate-fade-in-up" style="animation-delay: 0.2s;">
                
                <!-- Login Method Tabs -->
                <div class="flex space-x-1 bg-muted/30 p-1 rounded-2xl mb-6">
                    <button @click="setLoginMethod('password')"
                            class="flex-1 py-2 px-4 rounded-xl text-sm transition-all duration-200"
                            :class="loginMethod === 'password' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'">
                        Password
                    </button>
                    <button @click="setLoginMethod('biometric')"
                            class="flex-1 py-2 px-4 rounded-xl text-sm transition-all duration-200"
                            :class="loginMethod === 'biometric' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'">
                        Biometric
                    </button>
                    <button @click="setLoginMethod('sso')"
                            class="flex-1 py-2 px-4 rounded-xl text-sm transition-all duration-200"
                            :class="loginMethod === 'sso' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'">
                        SSO
                    </button>
                </div>

                <!-- Password Login Form -->
                <div x-show="loginMethod === 'password'" 
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform scale-95"
                     x-transition:enter-end="opacity-100 transform scale-100">
                    
                    <form @submit.prevent="submitLogin()" class="space-y-6">
                        <!-- Username Field -->
                        <div class="space-y-2">
                            <label for="username" class="block text-sm text-foreground">Username</label>
                            <input type="text" 
                                   id="username"
                                   x-model="formData.username"
                                   class="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                   placeholder="Enter your username"
                                   :class="errors.username ? 'border-destructive focus:ring-destructive/50' : ''">
                            <p x-show="errors.username" x-text="errors.username" class="text-sm text-destructive"></p>
                        </div>

                        <!-- Password Field -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm text-foreground">Password</label>
                            <div class="relative">
                                <input :type="showPassword ? 'text' : 'password'"
                                       id="password"
                                       x-model="formData.password"
                                       class="w-full px-4 py-3 pr-12 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                       placeholder="Enter your password"
                                       :class="errors.password ? 'border-destructive focus:ring-destructive/50' : ''">
                                <button type="button" 
                                        @click="togglePasswordVisibility()"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    <div class="w-5 h-5" x-html="createLucideIcon(showPassword ? 'eye-off' : 'eye', 'w-5 h-5')"></div>
                                </button>
                            </div>
                            <p x-show="errors.password" x-text="errors.password" class="text-sm text-destructive"></p>
                        </div>

                        <!-- Error Message -->
                        <div x-show="errors.general" 
                             x-transition:enter="transition ease-out duration-200"
                             x-transition:enter-start="opacity-0 transform scale-95"
                             x-transition:enter-end="opacity-100 transform scale-100"
                             class="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                            <p x-text="errors.general" class="text-sm text-destructive"></p>
                        </div>

                        <!-- Login Button -->
                        <button type="submit" 
                                :disabled="isLoading"
                                class="w-full btn-gradient text-white py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            <span x-show="!isLoading">Sign In</span>
                            <span x-show="isLoading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Biometric Login -->
                <div x-show="loginMethod === 'biometric'" 
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform scale-95"
                     x-transition:enter-end="opacity-100 transform scale-100">
                    
                    <div class="text-center space-y-6">
                        <div class="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse-custom">
                            <div class="w-12 h-12 text-white" x-html="createLucideIcon('shield', 'w-12 h-12')"></div>
                        </div>
                        
                        <div>
                            <h3 class="text-xl gradient-text-primary mb-2">Biometric Authentication</h3>
                            <p class="text-muted-foreground text-sm">Use your fingerprint or face recognition to sign in securely</p>
                        </div>

                        <button @click="handleBiometricLogin()"
                                :disabled="isLoading"
                                class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            <span x-show="!isLoading">Authenticate with Biometrics</span>
                            <span x-show="isLoading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        </button>
                    </div>
                </div>

                <!-- SSO Login -->
                <div x-show="loginMethod === 'sso'" 
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform scale-95"
                     x-transition:enter-end="opacity-100 transform scale-100">
                    
                    <div class="text-center space-y-6">
                        <div class="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-custom">
                            <div class="w-12 h-12 text-white" x-html="createLucideIcon('globe', 'w-12 h-12')"></div>
                        </div>
                        
                        <div>
                            <h3 class="text-xl gradient-text-primary mb-2">Single Sign-On</h3>
                            <p class="text-muted-foreground text-sm">Sign in with your organization's SSO provider</p>
                        </div>

                        <button @click="handleSSOLogin()"
                                :disabled="isLoading"
                                class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            <span x-show="!isLoading">Continue with SSO</span>
                            <span x-show="isLoading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Redirecting...
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mt-8 pt-6 border-t border-border/50 text-center">
                    <p class="text-sm text-muted-foreground">
                        Demo credentials: <span class="text-primary">admin / password</span>
                    </p>
                </div>
            </div>

            <!-- Additional Info -->
            <div class="text-center mt-8 space-y-2 animate-fade-in-up" style="animation-delay: 0.4s;">
                <p class="text-sm text-muted-foreground">
                    🔒 Your security is our priority
                </p>
                <p class="text-xs text-muted-foreground/70">
                    All data is encrypted and securely transmitted
                </p>
            </div>
        </div>
    </div>
</div>
@endsection