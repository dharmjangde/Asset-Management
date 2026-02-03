import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AllProducts from './pages/AllProducts';
import Settings from './pages/Settings';
import ProductView from './pages/ProductView';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Placeholder components until implemented
// const Layout = ({ children }) => <>{children}</>;
// const Dashboard = () => <div>Dashboard</div>; 
// Wrapper for now to avoid errors until files are essential, 
// BUT I will create them in next steps. For now, let's just make sure imports work by creating skeletons.

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Public route for QR code scanning */}
            <Route path="/product/:productId" element={<ProductView />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  {/* Redirect root to dashboard */}
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <AllProducts />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

          </Routes>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
