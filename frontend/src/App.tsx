
import React, { useState } from 'react';
import { Patient, PatientFormData } from './types/patient';
import PatientList from './components/patient/PatientList';
import PatientForm from './components/patient/PatientForm';
import PatientDetail from './components/patient/PatientDetail';
import PatientSearch from './components/patient/PatientSearch';

type View = 'list' | 'form' | 'detail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
  };

  const handlePatientEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setCurrentView('form');
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: PatientFormData) => {
    console.log('Form submitted:', data);
    // Here you would typically send the data to your API
    // For now, we'll just go back to the list
    setCurrentView('list');
    setEditingPatient(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setEditingPatient(null);
  };

  const handleDetailClose = () => {
    setCurrentView('list');
    setSelectedPatient(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <PatientList
            onPatientSelect={handlePatientSelect}
            onPatientEdit={handlePatientEdit}
          />
        );
      case 'form':
        return (
          <PatientForm
            patient={editingPatient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        );
      case 'detail':
        return selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            onEdit={handlePatientEdit}
            onClose={handleDetailClose}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Hospital Readmission System</h1>
              </div>
              
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'list'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  Patient List
                </button>
                <button
                  onClick={handleAddPatient}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'form' && !editingPatient
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  Add Patient
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Search */}
              <div className="hidden md:block">
                <PatientSearch
                  onSearchChange={(query) => console.log('Quick search:', query)}
                  onFilterChange={(filters) => console.log('Quick filters:', filters)}
                  onPatientSelect={handlePatientSelect}
                  placeholder="Quick search..."
                  showFilters={false}
                  className="w-64"
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">Dr. Sarah Johnson</div>
                  <div className="text-xs text-gray-400">Physician</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  SJ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              © 2024 Hospital Readmission System. HIPAA Compliant.
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Built with React + TypeScript</span>
              <span>•</span>
              <span>Framer Motion</span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}


export default App;