/**
 * @fileoverview UI utilities and facades
 * @description Central export point for all UI-related utilities and facades
 * @author Graham
 * @since 1.0.0
 */

export { notify } from './notify';
export type { NotifyOptions, NotifyService } from './notify';

export { confirm } from './confirm.utils';
export type { ConfirmOptions } from './confirm.utils';

export { Popconfirm } from './confirm';
export type { PopconfirmProps } from './confirm';

export { AppIcon } from './icons';
export type { AppIconProps, IconName } from './icons';

export { Icons } from './icons.constants';
