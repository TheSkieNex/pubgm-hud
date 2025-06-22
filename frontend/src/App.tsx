import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './pages/layout';
import Page from './pages/page';
import TablePage from './pages/table/page';
import TablesPage from './pages/tables/page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Page />} />
          <Route path="/table/:uuid" element={<TablePage />} />
          <Route path="/tables" element={<TablesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
