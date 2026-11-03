import ReactDOM from 'react-dom/client';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/baloo-2/latin-700.css';
import './styles.css';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);

// Production only: development remains uncached for reliable editing.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
 window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sw.js').catch(error => {
   console.warn('Offline setup unavailable; loaded lessons still work.', error);
  });
 });
}
