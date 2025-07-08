import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx carregado');

try {
  console.log('Tentando renderizar App...');
  createRoot(document.getElementById("root")!).render(<App />);
  console.log('App renderizado com sucesso');
} catch (error) {
  console.error('Erro ao renderizar App:', error);
}
