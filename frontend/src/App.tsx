import { useState } from 'react';
import type { PageId } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { DataPrepPage } from './pages/DataPrepPage';
import { CandidateGenPage } from './pages/CandidateGenPage';
import { CandidatePairsPage } from './pages/CandidatePairsPage';
import { EntityMatchingPage } from './pages/EntityMatchingPage';
import { ResultsPage } from './pages/ResultsPage';
import { ValidationPage } from './pages/ValidationPage';
import { SubmissionPage } from './pages/SubmissionPage';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage onNavigate={setActivePage} />;
      case 'datasets':
        return <DatasetsPage />;
      case 'data-prep':
        return <DataPrepPage />;
      case 'candidate-gen':
        return <CandidateGenPage />;
      case 'candidate-pairs':
        return <CandidatePairsPage />;
      case 'entity-matching':
        return <EntityMatchingPage />;
      case 'results':
        return <ResultsPage />;
      case 'validation':
        return <ValidationPage />;
      case 'submission':
        return <SubmissionPage />;
      default:
        return <OverviewPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} onSelectPage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
