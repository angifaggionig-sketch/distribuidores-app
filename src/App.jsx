import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Canillitas from './pages/Canillitas'
import Ventas from './pages/Ventas'
import Catalogo from './pages/Catalogo'
import Admin from './pages/Admin'
import Navbar from './components/Navbar'
import OlvidePassword from './pages/OlvidePassword'
import NuevaPassword from './pages/NuevaPassword'
import Landing from './pages/Landing'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
        <Route path="/catalogo" element={<><Navbar /><Catalogo /></>} />
        <Route path="/canillitas" element={<><Navbar /><Canillitas /></>} />
        <Route path="/ventas" element={<><Navbar /><Ventas /></>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/nueva-password" element={<NuevaPassword />} />
        <Route path="/inicio" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App