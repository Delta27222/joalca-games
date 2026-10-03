import { Route, Routes } from 'react-router'
import Ahorcado from './pages/Ahorcado.tsx'
import Home from './pages/Home.tsx'
import Jugador from './pages/Jugador.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
import SopaDeLetras from './pages/SopaDeLetras.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sopa-de-letras" element={<SopaDeLetras />} />
      <Route path="/ahorcado" element={<Ahorcado />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/jugador/:id" element={<Jugador />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default App
