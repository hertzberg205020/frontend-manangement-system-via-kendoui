/**
 * Represents the structure of company data.
 *
 * @property id - The unique identifier for the company (can be the unified business number).
 * @property name - The name of the company.
 * @property status - The current status of the company (e.g., approved, suspended, dissolved).
 * @property phoneNumber - The company's phone number (as a string to accommodate extensions or
 *   special characters).
 * @property industryCategory - The business category or industry of the company (usually a text
 *   description or code).
 * @property email - The company's email address.
 * @property unifiedBusinessNumber - The company's unified business number.
 * @property industryCode - The industry code (refer to Ministry of Finance tax industry
 *   classification).
 * @property responsiblePerson - The responsible person or representative of the company.
 */
export interface CompanyDataType {
  id: string; // 公司ID或編號 (可考慮使用統一編號)
  name: string; // 公司名稱
  status: string; // 公司狀態 (例如：核准設立、停業、解散等)
  phoneNumber: string; // 公司電話 (字串型態，因為可能有分機或特殊符號)
  industryCategory: string; // 營業項目 (通常是文字描述或代碼)
  email: string; // 公司電子郵件
  unifiedBusinessNumber: string; // 統一編號
  industryCode: string; // 行業代碼 (可參考財政部稅務行業標準分類)
  responsiblePerson: string; // 公司負責人 (或稱代表人)
}
