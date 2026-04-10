'use client';

import Swal from 'sweetalert2';

export const confirmDelete = async (title: string, html?: string) => {
  const result = await Swal.fire({
    title,
    html,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    width: '400px',
  });
  return result.isConfirmed;
};

export const showSuccess = async (message: string) => {
  await Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    width: '350px',
  });
};

export const showError = async (message: string) => {
  await Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    timer: 2000,
    showConfirmButton: false,
    width: '350px',
  });
};

export default Swal;