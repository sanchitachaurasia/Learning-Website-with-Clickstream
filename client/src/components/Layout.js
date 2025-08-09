import React from 'react';

export default function Layout({ children }) {
  return (
    <main className="container mx-auto px-6 py-8">
      {children}
    </main>
  );
}