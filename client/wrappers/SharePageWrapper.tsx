// wrappers/SharePageWrapper.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import SharePage from '../components/SharePage';

export default function SharePageWrapper() {
  const { docId } = useParams();
  return <SharePage docId={docId!} />;
}
