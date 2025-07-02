@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden transition-colors duration-500"
     x-data="loginPageHandler()" 
     x-init="init()">

    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md space-y-6"
             x-show="!showSuccess"
             x-transition:enter="transition ease-out duration-600"
             x-transition:enter-start="opacity-0 transform scale-95"
             x-transition:enter-end="opacity-100 transform scale-100">
            
            <!-- Enhanced Header -->
            <div class="flex justify-between items-center">
                <a href="{{ route('welcome') }}" 
                   class="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors bg-card/50 backdrop-blur-xl px-4 py-3 rounded-xl border border-border/50 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200">
                    <i data-lucide="arrow-left" class="h-4 w-4"></i>
                    <span class="text-sm">Back to Welcome</span>
                </a>
                
                @include('components.theme-toggle', ['class' => 'ml-auto'])
            </div>

            <!-- Login Methods Selector -->
            <div class="flex justify-center space-x-2 bg-muted/50 p-2 rounded-xl">
                <template x-for="method in loginMethods" :key="method.id">
                    <button @click="setLoginMethod(method.id)"
                            class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                            :class="loginMethod === method.id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-background/50'">
                        <i :data-lucide="method.icon" class="w-4 h-4"></i>
                        <span class="text-sm" x-text="method.label"></span>
                    </button>
                </template>
            </div>

            <!-- Enhanced Login Card -->
            <div class="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                <!-- Card Header -->
                <div class="space-y-4 text-center relative p-6">
                    <!-- Floating decoration -->
                    <div class="absolute top-4 right-4 text-primary/20 animate-spin-slow">
                        <i data-lucide="sparkles" class="w-6 h-6"></i>
                    </div>

                    @include('components.logo', ['width' => 160, 'height' => 56, 'class' => 'mb-4'])
                    
                    <div class="space-y-2">
                        <h1 class="text-3xl bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p class="text-lg text-muted-foreground" x-text="getMethodDescription()"></p>
                    </div>
                </div>

                <!-- Card Content -->
                <div class="space-y-6 p-6">
                    <div class="min-h-[400px]">
                        <!-- Password Form -->
                        <form x-show="loginMethod === 'password'" 
                              @submit.prevent="handleSubmit()"
                              x-transition:enter="transition ease-out duration-300"
                              x-transition:enter-start="opacity-0 transform translate-x-5"
                              x-transition:enter-end="opacity-100 transform translate-x-0"
                              class="space-y-6">
                            
                            <!-- Username Field -->
                            <div class="space-y-2">
                                <label for="username" class="text-base block">Username</label>
                                <div class="relative">
                                    <input id="username"
                                           type="text"
                                           placeholder="Enter your username"
                                           x-model="form.username"
                                           @input="clearError('username')"
                                           class="w-full h-12 px-4 rounded-lg border transition-all duration-300 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                           :class="errors.username ? 'border-destructive focus:border-destructive' : form.username ? 'border-green-500 focus:border-green-500' : 'border-border focus:border-primary/50'">
                                    
                                    <div x-show="form.username && !errors.username" 
                                         x-transition:enter="transition ease-out duration-200"
                                         x-transition:enter-start="opacity-0 transform scale-0"
                                         x-transition:enter-end="opacity-100 transform scale-100"
                                         class="absolute right-3 top-1/2 -translate-y-1/2">
                                        <i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>
                                    </div>
                                </div>
                                
                                <div x-show="errors.username"
                                     x-transition:enter="transition ease-out duration-200"
                                     x-transition:enter-start="opacity-0 transform -translate-y-2"
                                     x-transition:enter-end="opacity-100 transform translate-y-0"
                                     class="text-sm text-destructive flex items-center space-x-1">
                                    <i data-lucide="alert-circle" class="w-4 h-4"></i>
                                    <span x-text="errors.username"></span>
                                </div>
                            </div>

                            <!-- Password Field -->
                            <div class="space-y-2">
                                <label for="password" class="text-base block">Password</label>
                                <div class="relative">
                                    <input id="password"
                                           :type="showPassword ? 'text' : 'password'"
                                           placeholder="Enter your password"
                                           x-model="form.password"
                                           @input="clearError('password')"
                                           class="w-full h-12 px-4 pr-12 rounded-lg border transition-all duration-300 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                           :class="errors.password ? 'border-destructive focus:border-destructive' : form.password ? 'border-green-500 focus:border-green-500' : 'border-border focus:border-primary/50'">
                                    
                                    <button type="button" 
                                            @click="showPassword = !showPassword"
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                        <i x-show="!showPassword" data-lucide="eye" class="h-5 w-5"></i>
                                        <i x-show="showPassword" data-lucide="eye-off" class="h-5 w-5"></i>
                                    </button>
                                </div>

                                <!-- Password Strength Indicator -->
                                <div x-show="form.password"
                                     x-transition:enter="transition ease-out duration-300"
                                     x-transition:enter-start="opacity-0 transform scale-y-0"
                                     x-transition:enter-end="opacity-100 transform scale-y-100"
                                     class="space-y-2">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-muted-foreground">Password Strength</span>
                                        <span :class="getStrengthColor()" x-text="getStrengthText()"></span>
                                    </div>
                                    <div class="w-full bg-muted rounded-full h-2">
                                        <div class="h-2 rounded-full transition-all duration-300"
                                             :class="getStrengthBarColor()"
                                             :style="`width: ${passwordStrength}%`"></div>
                                    </div>
                                </div>

                                <div x-show="errors.password"
                                     x-transition:enter="transition ease-out duration-200"
                                     x-transition:enter-start="opacity-0 transform -translate-y-2"
                                     x-transition:enter-end="opacity-100 transform translate-y-0"
                                     class="text-sm text-destructive flex items-center space-x-1">
                                    <i data-lucide="alert-circle" class="w-4 h-4"></i>
                                    <span x-text="errors.password"></span>
                                </div>
                            </div>

                            <!-- Login Button -->
                            <button type="submit"
                                    :disabled="isLoading"
                                    class="w-full h-12 relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg text-lg rounded-xl text-white disabled:opacity-50 hover:scale-105 active:scale-95">
                                <div x-show="!isLoading" class="flex items-center justify-center">
                                    <i data-lucide="shield" class="mr-2 h-5 w-5"></i>
                                    Sign in Securely
                                </div>
                                <div x-show="isLoading" class="flex items-center justify-center">
                                    <i data-lucide="loader-2" class="mr-2 h-5 w-5 animate-spin"></i>
                                    Signing in...
                                </div>
                            </button>
                        </form>

                        <!-- Biometric Form -->
                        <div x-show="loginMethod === 'biometric'"
                             x-transition:enter="transition ease-out duration-300"
                             x-transition:enter-start="opacity-0 transform translate-x-5"
                             x-transition:enter-end="opacity-100 transform translate-x-0"
                             class="text-center space-y-6 flex flex-col justify-center h-full">
                            
                            <div class="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center animate-pulse-glow hover:scale-110 transition-transform duration-300">
                                <i data-lucide="fingerprint" class="w-12 h-12 text-white"></i>
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-xl">Biometric Authentication</h3>
                                <p class="text-muted-foreground">
                                    Place your finger on the sensor or use face recognition
                                </p>
                            </div>
                            <button @click="handleBiometricLogin()"
                                    :disabled="isLoading"
                                    class="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50">
                                <span x-show="!isLoading">Authenticate</span>
                                <i x-show="isLoading" data-lucide="loader-2" class="h-5 w-5 animate-spin mx-auto"></i>
                            </button>
                        </div>

                        <!-- SSO Form -->
                        <div x-show="loginMethod === 'sso'"
                             x-transition:enter="transition ease-out duration-300"
                             x-transition:enter-start="opacity-0 transform translate-x-5"
                             x-transition:enter-end="opacity-100 transform translate-x-0"
                             class="space-y-4">
                            
                            <template x-for="provider in ssoProviders" :key="provider.name">
                                <button class="w-full h-12 rounded-xl text-white flex items-center justify-center space-x-3 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200"
                                        :class="provider.color">
                                    <i :data-lucide="provider.icon" class="w-5 h-5"></i>
                                    <span x-text="`Continue with ${provider.name}`"></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    <!-- Additional Options -->
                    <div class="text-center space-y-4">
                        <a href="#" 
                           class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-105 inline-block transform">
                            Forgot your password?
                        </a>
                        
                        <div class="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                            <span>Need help?</span>
                            <button class="text-primary hover:underline hover:scale-105 transform transition-all duration-200">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-sm text-muted-foreground space-y-2">
                <p>&copy; 2025 HRoS. All rights reserved.</p>
                <p class="text-xs">
                    🔒 Your data is protected with enterprise-grade security
                </p>
            </div>
        </div>

        <!-- Success Animation -->
        <div x-show="showSuccess"
             x-transition:enter="transition ease-out duration-600"
             x-transition:enter-start="opacity-0 transform scale-0"
             x-transition:enter-end="opacity-100 transform scale-100"
             class="text-center space-y-6">
            
            <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce-rotate">
                <i data-lucide="check-circle" class="w-12 h-12 text-white"></i>
            </div>
            <h2 class="text-3xl bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Welcome to HRoS!
            </h2>
            <p class="text-muted-foreground">
                Login successful. Redirecting to your dashboard...
            </p>
            <div class="w-48 h-2 bg-muted rounded-full mx-auto overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-progress-bar"></div>
            </div>
        </div>
    </div>
</div>

<script>
function loginPageHandler() {
    return {
        loginMethod: 'password',
        showPassword: false,
        isLoading: false,
        showSuccess: false,
        form: {
            username: '',
            password: ''
        },
        errors: {},
        passwordStrength: 0,
        
        loginMethods: [
            { id: 'password', label: 'Password', icon: 'shield' },
            { id: 'biometric', label: 'Biometric', icon: 'fingerprint' },
            { id: 'sso', label: 'SSO', icon: 'zap' }
        ],
        
        ssoProviders: [
            { name: 'Google', icon: 'mail', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
            { name: 'Microsoft', icon: 'mail', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
            { name: 'GitHub', icon: 'github', color: 'bg-gradient-to-r from-gray-700 to-gray-900' }
        ],
        
        init() {
            this.$watch('form.password', (value) => {
                this.calculatePasswordStrength(value);
            });
            
            this.$watch('loginMethod', () => {
                this.resetForm();
            });
            
            this.$nextTick(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        },
        
        setLoginMethod(method) {
            this.loginMethod = method;
            this.$nextTick(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        },
        
        resetForm() {
            this.form = { username: '', password: '' };
            this.errors = {};
            this.showPassword = false;
            this.passwordStrength = 0;
        },
        
        calculatePasswordStrength(password) {
            let score = 0;
            if (password.length >= 8) score += 25;
            if (/[A-Z]/.test(password)) score += 25;
            if (/[0-9]/.test(password)) score += 25;
            if (/[^A-Za-z0-9]/.test(password)) score += 25;
            this.passwordStrength = score;
        },
        
        getStrengthText() {
            if (this.passwordStrength < 50) return 'Weak';
            if (this.passwordStrength < 75) return 'Medium';
            return 'Strong';
        },
        
        getStrengthColor() {
            if (this.passwordStrength < 50) return 'text-red-500';
            if (this.passwordStrength < 75) return 'text-yellow-500';
            return 'text-green-500';
        },
        
        getStrengthBarColor() {
            if (this.passwordStrength < 50) return 'bg-red-500';
            if (this.passwordStrength < 75) return 'bg-yellow-500';
            return 'bg-green-500';
        },
        
        getMethodDescription() {
            switch (this.loginMethod) {
                case 'password': return 'Sign in with your credentials';
                case 'biometric': return 'Use your biometric authentication';
                case 'sso': return 'Single Sign-On authentication';
                default: return '';
            }
        },
        
        validateForm() {
            this.errors = {};
            
            if (!this.form.username.trim()) {
                this.errors.username = 'Username is required';
            } else if (this.form.username.length < 3) {
                this.errors.username = 'Username must be at least 3 characters';
            }
            
            if (!this.form.password) {
                this.errors.password = 'Password is required';
            } else if (this.form.password.length < 6) {
                this.errors.password = 'Password must be at least 6 characters';
            }
            
            return Object.keys(this.errors).length === 0;
        },
        
        clearError(field) {
            if (this.errors[field]) {
                delete this.errors[field];
            }
        },
        
        async handleSubmit() {
            if (!this.validateForm()) return;
            
            this.isLoading = true;
            
            // Simulate API call
            setTimeout(() => {
                this.isLoading = false;
                this.showSuccess = true;
                
                setTimeout(() => {
                    window.location.href = '{{ route("dashboard") }}';
                }, 2000);
            }, 2000);
        },
        
        async handleBiometricLogin() {
            this.isLoading = true;
            
            setTimeout(() => {
                this.isLoading = false;
                this.showSuccess = true;
                
                setTimeout(() => {
                    window.location.href = '{{ route("dashboard") }}';
                }, 2000);
            }, 1500);
        }
    }
}
</script>
@endsection