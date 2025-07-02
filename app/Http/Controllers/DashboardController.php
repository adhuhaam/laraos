<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class DashboardController extends Controller
{
    /**
     * Show the dashboard
     */
    public function index()
    {
        $user = Session::get('user');
        
        return view('dashboard', [
            'currentPage' => 'dashboard',
            'user' => $user,
            'stats' => $this->getEmployeeStats()
        ]);
    }

    /**
     * Get employee statistics
     */
    public function getStats()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getEmployeeStats()
        ]);
    }

    /**
     * Show employees page
     */
    public function employees()
    {
        return view('employees', [
            'currentPage' => 'employees'
        ]);
    }

    /**
     * Show attendance page
     */
    public function attendance()
    {
        return view('attendance', [
            'currentPage' => 'attendance'
        ]);
    }

    /**
     * Show reports page
     */
    public function reports()
    {
        return view('reports', [
            'currentPage' => 'reports'
        ]);
    }

    /**
     * Show performance page
     */
    public function performance()
    {
        return view('performance', [
            'currentPage' => 'performance'
        ]);
    }

    /**
     * Get employee statistics data
     */
    private function getEmployeeStats()
    {
        return [
            [
                'status' => 'Active',
                'count' => 1315,
                'color' => 'bg-green-500',
                'icon' => 'user-check',
                'trend' => '+2.5%',
                'trendDirection' => 'up'
            ],
            [
                'status' => 'Dead',
                'count' => 3,
                'color' => 'bg-red-500',
                'icon' => 'user-x',
                'trend' => '0%',
                'trendDirection' => 'neutral'
            ],
            [
                'status' => 'Missing',
                'count' => 33,
                'color' => 'bg-yellow-500',
                'icon' => 'user-minus',
                'trend' => '-1.2%',
                'trendDirection' => 'down'
            ],
            [
                'status' => 'Resigned',
                'count' => 1354,
                'color' => 'bg-blue-500',
                'icon' => 'user-minus',
                'trend' => '+0.8%',
                'trendDirection' => 'up'
            ],
            [
                'status' => 'Retired',
                'count' => 15,
                'color' => 'bg-purple-500',
                'icon' => 'user',
                'trend' => '+3.1%',
                'trendDirection' => 'up'
            ],
            [
                'status' => 'Terminated',
                'count' => 608,
                'color' => 'bg-orange-500',
                'icon' => 'user-x',
                'trend' => '-0.5%',
                'trendDirection' => 'down'
            ]
        ];
    }
}