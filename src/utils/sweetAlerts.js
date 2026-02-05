/**
 * Enhanced SweetAlert2 Utilities
 * Provides consistent, modern styling for all popups across the application
 */
import Swal from 'sweetalert2';

// Base configuration for all popups
const baseConfig = {
    customClass: {
        popup: 'swal-popup-enhanced',
        title: 'swal-title-enhanced',
        htmlContainer: 'swal-html-enhanced',
        confirmButton: 'swal-confirm-enhanced',
        cancelButton: 'swal-cancel-enhanced',
        denyButton: 'swal-deny-enhanced',
        actions: 'swal-actions-enhanced',
        icon: 'swal-icon-enhanced'
    },
    buttonsStyling: false,
    showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
};

/**
 * Success Toast - Brief success notification
 */
export const showSuccessToast = (title, text = '') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'success',
        title,
        text,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: false,
        position: 'center',
        background: '#ffffff',
        iconColor: '#10B981'
    });
};

/**
 * Error Alert - For displaying errors
 */
export const showError = (title, text = '') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Got it',
        background: '#ffffff',
        iconColor: '#EF4444'
    });
};

/**
 * Warning Alert - For warnings and cautions
 */
export const showWarning = (title, text = '') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'Understood',
        background: '#ffffff',
        iconColor: '#F59E0B'
    });
};

/**
 * Info Alert - For informational messages
 */
export const showInfo = (title, text = '') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'info',
        title,
        text,
        confirmButtonText: 'OK',
        background: '#ffffff',
        iconColor: '#3B82F6'
    });
};

/**
 * Confirmation Dialog - For destructive actions
 */
export const showConfirm = async (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
        background: '#ffffff',
        iconColor: '#F59E0B'
    });
};

/**
 * Delete Confirmation - Specifically styled for delete actions
 */
export const showDeleteConfirm = async (title = 'Are you sure?', text = 'This action cannot be undone.') => {
    return Swal.fire({
        ...baseConfig,
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        background: '#ffffff',
        iconColor: '#EF4444',
        customClass: {
            ...baseConfig.customClass,
            confirmButton: 'swal-confirm-danger'
        }
    });
};

/**
 * Loading State - Shows a loading spinner
 */
export const showLoading = (title = 'Please wait...') => {
    return Swal.fire({
        ...baseConfig,
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

/**
 * Close any open popup
 */
export const closePopup = () => {
    Swal.close();
};

/**
 * Quick Success - Minimal success toast
 */
export const quickSuccess = (title) => {
    return Swal.fire({
        ...baseConfig,
        icon: 'success',
        title,
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        iconColor: '#10B981'
    });
};

/**
 * Input Dialog - For getting user input
 */
export const showInput = async (title, inputLabel, inputPlaceholder = '', inputType = 'text') => {
    return Swal.fire({
        ...baseConfig,
        title,
        input: inputType,
        inputLabel,
        inputPlaceholder,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
            if (!value) {
                return 'This field is required';
            }
        }
    });
};

// Export Swal for advanced customization
export { Swal };
