// 操作動作對應文字
export const ACTION_TEXT_MAP: Record<string, string> = {
  read: '檢視',
  create: '建立',
  edit: '編輯',
  delete: '刪除',
};

// 表格分頁設定
export const TABLE_PAGINATION_CONFIG = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
};

// 表單驗證規則
export const FORM_RULES = {
  REQUIRED: { required: true },
  EMP_ID: { required: true, message: '請輸入員工編號' },
  NAME: { required: true, message: '請輸入姓名' },
  PASSWORD: { required: true, message: '請輸入密碼' },
  ROLE_NAME: { required: true, message: '請輸入角色名稱' },
  ROLE_DESCRIPTION: { required: true, message: '請輸入角色描述' },
};

// 訊息文字
export const MESSAGES = {
  USER_CREATED: '使用者已新增',
  USER_UPDATED: '使用者資訊已更新',
  USER_DELETED: '使用者已刪除',
  USER_RESTORED: '使用者已恢復',
  ROLE_CREATED: '角色已新增',
  ROLE_UPDATED: '角色資訊已更新',
  ROLE_DELETED: '角色已刪除',
  PERMISSION_UPDATED: '權限設定已更新',
  ROLE_ASSIGNMENT_PENDING: '角色分配功能開發中',
  DELETE_USER_CONFIRM: '確定要停權此使用者嗎？',
  RESTORE_USER_CONFIRM: '確定要恢復此使用者嗎？',
  DELETE_ROLE_CONFIRM: '確定要刪除此角色嗎？',
};

// 模態框寬度
export const MODAL_WIDTH = {
  SMALL: 500,
  MEDIUM: 600,
  LARGE: 800,
};
