import { BrowserRouter, Routes, Route } from 'react-router-dom';

import TablePage from './pages/table';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/table" element={<TablePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
