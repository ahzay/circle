// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { AuthProvider } from './hooks/AuthContext';
import { Dashboard } from '@/pages/Dashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Landing page - create new circle */}
                    <Route path="/" element={<Landing />} />

                    {/* Join existing circle */}
                    <Route path="/join/:slug" element={<Landing />} />

                    {/* Circle dashboard */}
                    <Route path="/circle/:slug" element={<Dashboard />} />

                    {/* Redirect any unknown routes to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;