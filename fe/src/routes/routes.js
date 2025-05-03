import React from 'react';
import { Navigate } from 'react-router-dom';

// Auth Views
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';
import ForgotPassword from '../views/auth/ForgotPassword';

// Dashboard Views
import AdminDashboard from '../views/dashboard/AdminDashboard';
import ManagerDashboard from '../views/dashboard/ManagerDashboard';
import UserDashboard from '../views/dashboard/UserDashboard';

// Inventory Views
import InventoryList from '../views/inventory/InventoryList';
import AddProduct from '../views/inventory/AddProduct';
import EditProduct from '../views/inventory/EditProduct';

// Supplier Views
import SupplierList from '../views/suppliers/SupplierList';
import AddSupplier from '../views/suppliers/AddSupplier';
import EditSupplier from '../views/suppliers/EditSupplier';

// Transaction Views
import TransactionList from '../views/transactions/TransactionList';
import AddTransaction from '../views/transactions/AddTransaction';
import TransactionDetails from '../views/transactions/TransactionDetails';

// Report Views
import RevenueReport from '../views/reports/RevenueReport';
import InventoryReport from '../views/reports/InventoryReport';
import TransactionReport from '../views/reports/TransactionReport';

// User Management Views
import UserList from '../views/users/UserList';
import AddUser from '../views/users/AddUser';
import EditUser from '../views/users/EditUser';

// Profile Views
import Profile from '../views/profile/Profile';
import ChangePassword from '../views/profile/ChangePassword';

// Error Views
import NotFound from '../views/NotFound';

// Route Components
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import RoleRoute from './RoleRoute';

// Define routes configuration
const routes = [
  // Public routes
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },

  // Protected routes (require authentication)
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <UserDashboard />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'change-password',
        element: <ChangePassword />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      // Inventory routes
      {
        path: 'inventory',
        element: <InventoryList />
      },
      {
        path: 'inventory/add',
        element: <AddProduct />
      },
      {
        path: 'inventory/edit/:id',
        element: <EditProduct />
      },
      
      // Transaction routes
      {
        path: 'transactions',
        element: <TransactionList />
      },
      {
        path: 'transactions/add',
        element: <AddTransaction />
      },
      {
        path: 'transactions/:id',
        element: <TransactionDetails />
      },
    ]
  },
  
  // Manager routes
  {
    path: '/',
    element: <RoleRoute requiredRole="manager" />,
    children: [
      {
        path: 'manager-dashboard',
        element: <ManagerDashboard />
      },
      
      // Report routes
      {
        path: 'reports/revenue',
        element: <RevenueReport />
      },
      {
        path: 'reports/inventory',
        element: <InventoryReport />
      },
      {
        path: 'reports/transactions',
        element: <TransactionReport />
      },
      
      // Supplier routes
      {
        path: 'suppliers',
        element: <SupplierList />
      },
      {
        path: 'suppliers/add',
        element: <AddSupplier />
      },
      {
        path: 'suppliers/edit/:id',
        element: <EditSupplier />
      },
    ]
  },
  
  // Admin routes
  {
    path: '/',
    element: <AdminRoute />,
    children: [
      {
        path: 'admin-dashboard',
        element: <AdminDashboard />
      },
      
      // User management routes
      {
        path: 'users',
        element: <UserList />
      },
      {
        path: 'users/add',
        element: <AddUser />
      },
      {
        path: 'users/edit/:id',
        element: <EditUser />
      }
    ]
  },
  
  // 404 Not Found route
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;