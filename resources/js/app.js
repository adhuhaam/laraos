import './bootstrap';
import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';
import morph from '@alpinejs/morph';
import persist from '@alpinejs/persist';

// Register Alpine.js plugins
Alpine.plugin(intersect);
Alpine.plugin(morph);
Alpine.plugin(persist);

// Theme management
Alpine.data('themeManager', () => ({
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
}));

// Navigation management
Alpine.data('navigation', () => ({
    currentPage: Alpine.$persist('welcome').as('hros-current-page'),
    isTransitioning: false,
    
    navigateTo(page) {
        if (this.isTransitioning || this.currentPage === page) return;
        
        this.isTransitioning = true;
        
        // Simulate page transition
        setTimeout(() => {
            this.currentPage = page;
            window.history.pushState({}, '', `/${page === 'welcome' ? '' : page}`);
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, 100);
        }, 250);
    },
    
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const path = window.location.pathname;
            if (path === '/') {
                this.currentPage = 'welcome';
            } else if (path === '/login') {
                this.currentPage = 'login';
            } else if (path === '/dashboard') {
                this.currentPage = 'dashboard';
            }
        });
    }
}));

// Welcome page functionality
Alpine.data('welcomePage', () => ({
    currentFeature: 0,
    particles: [],
    showFab: false,
    mouseX: 0,
    mouseY: 0,
    
    features: [
        {
            title: 'Team Management',
            description: 'Streamline your workforce with advanced team management tools',
            color: 'from-blue-500 to-purple-600',
            stats: '10K+ Teams',
            icon: 'users'
        },
        {
            title: 'Secure Platform',
            description: 'Enterprise-grade security to protect your sensitive HR data',
            color: 'from-green-500 to-teal-600',
            stats: '99.9% Secure',
            icon: 'shield'
        },
        {
            title: 'Lightning Fast',
            description: 'Quick access to all your HR needs with our optimized platform',
            color: 'from-yellow-500 to-orange-600',
            stats: '< 2s Load Time',
            icon: 'zap'
        },
        {
            title: 'Global Reach',
            description: 'Connect teams worldwide with our international platform',
            color: 'from-indigo-500 to-blue-600',
            stats: '180+ Countries',
            icon: 'globe'
        }
    ],
    
    achievements: [
        { label: 'Industry Leader', value: '#1', icon: 'award' },
        { label: 'Growth Rate', value: '300%', icon: 'trending-up' },
        { label: 'Uptime', value: '99.9%', icon: 'clock' },
        { label: 'Rating', value: '4.9/5', icon: 'star' }
    ],
    
    init() {
        this.createParticles();
        this.startParticleAnimation();
        this.initMouseTracking();
        this.initScrollEvents();
        
        // Auto-cycle features
        setInterval(() => {
            this.currentFeature = (this.currentFeature + 1) % this.features.length;
        }, 5000);
    },
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    },
    
    startParticleAnimation() {
        setInterval(() => {
            this.particles = this.particles.map(particle => {
                let newX = particle.x + particle.speedX;
                let newY = particle.y + particle.speedY;
                
                if (newX > window.innerWidth) newX = 0;
                if (newX < 0) newX = window.innerWidth;
                if (newY > window.innerHeight) newY = 0;
                if (newY < 0) newY = window.innerHeight;
                
                return { ...particle, x: newX, y: newY };
            });
        }, 50);
    },
    
    initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    },
    
    initScrollEvents() {
        window.addEventListener('scroll', () => {
            this.showFab = window.scrollY > 300;
        });
    },
    
    selectFeature(index) {
        this.currentFeature = index;
    },
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}));

// Login page functionality
Alpine.data('loginPage', () => ({
    loginMethod: 'password',
    formData: {
        username: '',
        password: ''
    },
    isLoading: false,
    showPassword: false,
    errors: {},
    
    setLoginMethod(method) {
        this.loginMethod = method;
        this.errors = {};
    },
    
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    },
    
    async submitLogin() {
        this.isLoading = true;
        this.errors = {};
        
        // Basic validation
        if (!this.formData.username) {
            this.errors.username = 'Username is required';
        }
        if (!this.formData.password && this.loginMethod === 'password') {
            this.errors.password = 'Password is required';
        }
        
        if (Object.keys(this.errors).length > 0) {
            this.isLoading = false;
            return;
        }
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock successful login
            if (this.formData.username === 'admin' && this.formData.password === 'password') {
                this.$dispatch('login-success');
            } else {
                this.errors.general = 'Invalid credentials';
            }
        } catch (error) {
            this.errors.general = 'Login failed. Please try again.';
        } finally {
            this.isLoading = false;
        }
    },
    
    handleBiometricLogin() {
        this.isLoading = true;
        
        // Simulate biometric authentication
        setTimeout(() => {
            this.isLoading = false;
            this.$dispatch('login-success');
        }, 3000);
    },
    
    handleSSOLogin() {
        this.isLoading = true;
        
        // Simulate SSO authentication
        setTimeout(() => {
            this.isLoading = false;
            this.$dispatch('login-success');
        }, 2000);
    }
}));

// Dashboard functionality
Alpine.data('dashboard', () => ({
    employeeStats: [
        { status: 'Active', count: 1315, color: 'bg-green-500', icon: 'user-check' },
        { status: 'Dead', count: 3, color: 'bg-red-500', icon: 'user-x' },
        { status: 'Missing', count: 33, color: 'bg-yellow-500', icon: 'user-minus' },
        { status: 'Resigned', count: 1354, color: 'bg-blue-500', icon: 'user-minus' },
        { status: 'Retired', count: 15, color: 'bg-purple-500', icon: 'user' },
        { status: 'Terminated', count: 608, color: 'bg-orange-500', icon: 'user-x' }
    ],
    
    sidebarOpen: true,
    searchQuery: '',
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    },
    
    logout() {
        this.$dispatch('logout');
    },
    
    init() {
        // Initialize dashboard
        console.log('Dashboard initialized');
    }
}));

// Mouse follower component
Alpine.data('mouseFollower', () => ({
    x: 0,
    y: 0,
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.x = e.clientX - 12;
            this.y = e.clientY - 12;
        });
    }
}));

// Lucide icons helper
window.createLucideIcon = function(iconName, className = 'w-6 h-6') {
    const icons = {
        'users': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
        'shield': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
        'zap': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
        'globe': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`,
        'award': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
        'trending-up': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
        'clock': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        'star': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
        'sun': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
        'moon': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`,
        'menu': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`,
        'arrow-right': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`,
        'chevron-right': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`,
        'sparkles': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
        'eye': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
        'eye-off': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>`,
        'user-check': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/></svg>`,
        'user-x': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
        'user-minus': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8"/></svg>`,
        'user': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
        'search': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
        'bell': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>`,
        'log-out': `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`
    };
    
    return icons[iconName] || icons['user'];
};

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();