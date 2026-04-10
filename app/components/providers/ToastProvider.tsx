<<<<<<< HEAD
"use client";

import { Toaster } from "react-hot-toast";
=======
'use client';

import { Toaster } from 'react-hot-toast';
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
<<<<<<< HEAD
        duration: 2000,
        style: {
          background: "#161616",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
        success: {
          duration: 3000,
          style: {
            background: "#161616",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
=======
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
<<<<<<< HEAD
            primary: "#ef4444",
            secondary: "#fff",
=======
            primary: '#ef4444',
            secondary: '#fff',
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
          },
        },
      }}
    />
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
