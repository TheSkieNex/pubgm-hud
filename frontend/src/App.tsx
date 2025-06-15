import { BrowserRouter, Routes, Route } from 'react-router-dom';

import TablePage from './pages/table';
import Layout from './pages/layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/table" element={<TablePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
