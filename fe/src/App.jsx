import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import routes from './routes/routes';

const App = () => {
  const renderRoutes = (routeList) => {
    return routeList.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={route.element}>
            {renderRoutes(route.children)}
          </Route>
        );
      }
      
      return (
        <Route 
          key={index} 
          path={route.path} 
          element={route.element} 
        />
      );
    });
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {renderRoutes(routes)}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;