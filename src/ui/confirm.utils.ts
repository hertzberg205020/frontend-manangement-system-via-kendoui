/**
 * @fileoverview Confirmation utilities and imperative API
 * @description Provides imperative confirm function and default export facade
 * @author Graham
 * @since 1.0.0
 */

import { Modal } from 'antd';
import type { ModalFuncProps } from 'antd';
import type React from 'react';

/**
 * Configuration options for imperative confirm dialog
 * @since 1.0.0
 */
export interface ConfirmOptions {
  /** The title of the confirmation dialog */
  title: string;
  /** The content/description of the confirmation dialog */
  content?: React.ReactNode;
  /** Callback when user confirms */
  onOk?: () => void | Promise<void>;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Text for the OK button */
  okText?: string;
  /** Text for the Cancel button */
  cancelText?: string;
  /** Type of confirmation (affects styling) */
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
}

/**
 * Imperative confirm dialog function
 * Shows a modal confirmation dialog and returns a promise
 * @param options - Configuration options for the confirm dialog
 * @returns Promise that resolves when OK is clicked, rejects when Cancel is clicked
 * @since 1.0.0
 * @example
 * ```typescript
 * // Simple confirm
 * try {
 *   await confirm({
 *     title: 'Delete Item',
 *     content: 'Are you sure you want to delete this item?'
 *   });
 *   // User confirmed, proceed with deletion
 *   await deleteItem(id);
 * } catch {
 *   // User cancelled
 *   console.log('Delete cancelled');
 * }
 *
 * // With custom buttons and callbacks
 * confirm({
 *   title: 'Warning',
 *   content: 'This action cannot be undone',
 *   okText: 'Yes, Delete',
 *   cancelText: 'No, Keep',
 *   type: 'warning',
 *   onOk: async () => {
 *     await deleteItem(id);
 *   },
 *   onCancel: () => {
 *     console.log('Cancelled');
 *   }
 * });
 * ```
 */
export const confirm = (options: ConfirmOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const modalConfig: ModalFuncProps = {
      title: options.title,
      content: options.content,
      okText: options.okText || 'Yes',
      cancelText: options.cancelText || 'No',
      onOk: async () => {
        try {
          if (options.onOk) {
            await options.onOk();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      onCancel: () => {
        if (options.onCancel) {
          options.onCancel();
        }
        reject(new Error('User cancelled'));
      },
    };

    // Call appropriate Modal method based on type
    switch (options.type) {
      case 'info':
        Modal.info(modalConfig);
        break;
      case 'success':
        Modal.success(modalConfig);
        break;
      case 'error':
        Modal.error(modalConfig);
        break;
      case 'warning':
        Modal.warning(modalConfig);
        break;
      case 'confirm':
      default:
        Modal.confirm(modalConfig);
        break;
    }
  });
};
