import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomeView } from '@/views/HomeView';
import { DirectorSetupView } from '@/views/DirectorSetupView';
import { QRDistributionView } from '@/views/QRDistributionView';
import { ScanQRView } from '@/views/ScanQRView';
import { PanelDisplayView } from '@/views/PanelDisplayView';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/director" element={<DirectorSetupView />} />
        <Route path="/director/qr" element={<QRDistributionView />} />
        <Route path="/scan" element={<ScanQRView />} />
        <Route path="/panel" element={<PanelDisplayView />} />
      </Routes>
    </BrowserRouter>
  );
}
