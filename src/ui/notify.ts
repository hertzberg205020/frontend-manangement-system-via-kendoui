/**
 * @fileoverview Notification facade for unified user feedback
 * @description Provides a consistent API for displaying notifications across the application.
 * Currently uses Ant Design as the backend implementation, but can be swapped for KendoReact later.
 * @author Graham
 * @since 1.0.0
 */

import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

/**
 * Configuration options for notification messages
 * @since 1.0.0
 */
export interface NotifyOptions {
  /** The message content to display */
  content: string;
  /** Duration in seconds to show the message (0 = persistent) */
  duration?: number;
  /** Unique key to prevent duplicate messages */
  key?: string;
  /** Callback when message is closed */
  onClose?: () => void;
}

/**
 * Notification facade interface
 * @since 1.0.0
 */
export interface NotifyService {
  /** Display a success message */
  success: (content: string | NotifyOptions) => void;
  /** Display an error message */
  error: (content: string | NotifyOptions) => void;
  /** Display an informational message */
  info: (content: string | NotifyOptions) => void;
  /** Display a warning message */
  warning: (content: string | NotifyOptions) => void;
  /** Destroy all messages */
  destroy: () => void;
}

/**
 * Normalizes input to NotifyOptions format
 * @param input - String or NotifyOptions object
 * @returns Normalized NotifyOptions
 * @since 1.0.0
 */
const normalizeOptions = (input: string | NotifyOptions): NotifyOptions => {
  if (typeof input === 'string') {
    return { content: input };
  }
  return input;
};

/**
 * Converts NotifyOptions to Ant Design message config
 * @param options - NotifyOptions to convert
 * @returns Ant Design message config object
 * @since 1.0.0
 */
const toAntdConfig = (options: NotifyOptions): Parameters<MessageInstance['success']>[0] => {
  return {
    content: options.content,
    duration: options.duration,
    key: options.key,
    onClose: options.onClose,
  };
};

/**
 * Unified notification service
 * Provides a consistent API for displaying success, error, info, and warning messages
 * @since 1.0.0
 * @example
 * ```typescript
 * // Simple string message
 * notify.success('Operation completed');
 * notify.error('Something went wrong');
 *
 * // With options
 * notify.warning({
 *   content: 'Please check your input',
 *   duration: 5,
 *   key: 'validation-warning'
 * });
 *
 * // With callback
 * notify.info({
 *   content: 'Loading...',
 *   duration: 0,
 *   key: 'loading',
 *   onClose: () => console.log('Message closed')
 * });
 * ```
 */
export const notify: NotifyService = {
  /**
   * Display a success message
   * @param input - Message content or options
   * @since 1.0.0
   */
  success: (input: string | NotifyOptions): void => {
    const options = normalizeOptions(input);
    message.success(toAntdConfig(options));
  },

  /**
   * Display an error message
   * @param input - Message content or options
   * @since 1.0.0
   */
  error: (input: string | NotifyOptions): void => {
    const options = normalizeOptions(input);
    message.error(toAntdConfig(options));
  },

  /**
   * Display an informational message
   * @param input - Message content or options
   * @since 1.0.0
   */
  info: (input: string | NotifyOptions): void => {
    const options = normalizeOptions(input);
    message.info(toAntdConfig(options));
  },

  /**
   * Display a warning message
   * @param input - Message content or options
   * @since 1.0.0
   */
  warning: (input: string | NotifyOptions): void => {
    const options = normalizeOptions(input);
    message.warning(toAntdConfig(options));
  },

  /**
   * Destroy all messages
   * @since 1.0.0
   */
  destroy: (): void => {
    message.destroy();
  },
};
