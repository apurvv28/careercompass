import 'regenerator-runtime/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StudentForm from './components/StudentForm';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudentForm />
  </StrictMode>
);