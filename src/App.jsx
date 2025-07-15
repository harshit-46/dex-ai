// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/LoginPage';
import Signup from './components/Auth/SignUp';
import Home from './pages/Home';
import AuthRoute from './components/Auth/AuthRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <AuthRoute>
            <Home />
          </AuthRoute>
        }
      />
    </Routes>
  );
};

export default App;
