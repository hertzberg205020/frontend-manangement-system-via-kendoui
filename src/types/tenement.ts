type statusType = 0 | 1 | 2;

interface TenementDataType {
  id: string;
  name: string;
  responsiblePerson: string;
  tel: string;
  status: statusType;
  vacancyRate: number;
  managementFee: string;
}

interface CreateTenementDataType extends Omit<
  TenementDataType, 'id' | 'vacancyRate' | 'propertyFee'
> {
  id?: string; // 在新增時，ID 可以是可選的
  vacancyRate?: number; // 在新增時，vacancyRate 可以是可選的
  propertyFee?: string; // 在新增時，propertyFee 可以是可選的
}



export type { TenementDataType, CreateTenementDataType };
