<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        // Redirect to dashboard if already authenticated
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return view('login', ['currentPage' => 'login']);
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Demo authentication - in production, use proper user authentication
        if ($request->username === 'admin' && $request->password === 'password') {
            // Create a session for the user
            Session::put('authenticated', true);
            Session::put('user', [
                'id' => 1,
                'username' => 'admin',
                'name' => 'Administrator',
                'email' => 'admin@hros.com',
                'role' => 'admin'
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Authentication successful',
                    'redirect' => route('dashboard')
                ]);
            }

            return redirect()->route('dashboard')->with('success', 'Welcome back!');
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        throw ValidationException::withMessages([
            'username' => 'The provided credentials are incorrect.',
        ]);
    }

    /**
     * Handle biometric authentication
     */
    public function biometricAuth(Request $request)
    {
        // Simulate biometric authentication
        // In production, this would integrate with actual biometric services
        
        // Simulate processing time
        sleep(2);

        // Mock successful biometric authentication
        Session::put('authenticated', true);
        Session::put('user', [
            'id' => 1,
            'username' => 'biometric_user',
            'name' => 'Biometric User',
            'email' => 'biometric@hros.com',
            'role' => 'user',
            'auth_method' => 'biometric'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Biometric authentication successful',
            'redirect' => route('dashboard')
        ]);
    }

    /**
     * Handle SSO authentication
     */
    public function ssoAuth(Request $request)
    {
        // Simulate SSO authentication
        // In production, this would integrate with SAML, OAuth, or other SSO providers
        
        // Simulate processing time
        sleep(1);

        // Mock successful SSO authentication
        Session::put('authenticated', true);
        Session::put('user', [
            'id' => 1,
            'username' => 'sso_user',
            'name' => 'SSO User',
            'email' => 'sso@hros.com',
            'role' => 'user',
            'auth_method' => 'sso'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'SSO authentication successful',
            'redirect' => route('dashboard')
        ]);
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Session::flush();
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
                'redirect' => route('welcome')
            ]);
        }

        return redirect()->route('welcome')->with('success', 'You have been logged out.');
    }
}