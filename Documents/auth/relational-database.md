# 資料庫結構設計

依循 RBAC 基於 postgresql dialog DDL 建立 資料庫結構:

```sql
CREATE SCHEMA auth;      -- 認證相關

CREATE TABLE auth.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    emp_id VARCHAR(16) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- 使用 bcrypt 雜湊字串
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth.user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id), -- composite key

    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES auth.roles(id) ON DELETE CASCADE
);

-- 為 user_roles 建立索引
CREATE INDEX idx_user_roles_user_id ON auth.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON auth.user_roles(role_id);

CREATE TABLE auth.resources (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(256) NOT NULL UNIQUE,-- 例如："user.profile", "dashboard"
    description   TEXT,                         -- 人類可讀描述
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE auth.permission_action AS ENUM ('read', 'create', 'edit', 'delete');

CREATE TABLE auth.permissions (  -- 開發人員維護
    id           BIGSERIAL PRIMARY KEY,
    resource_id  BIGINT    NOT NULL,
    action       auth.permission_action NOT NULL DEFAULT 'read',
    description  TEXT,
    is_active    BOOLEAN   NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permissions_resource FOREIGN KEY (resource_id)
        REFERENCES auth.resources(id) ON DELETE CASCADE,
    CONSTRAINT uq_permissions_action_resource UNIQUE (action, resource_id)
);

CREATE TABLE auth.role_permissions (
    role_id        BIGINT NOT NULL,
    permission_id  BIGINT NOT NULL,
    assigned_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
        REFERENCES auth.roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id)
        REFERENCES auth.permissions(id) ON DELETE CASCADE
);

-- 為 role_permissions 建立索引
CREATE INDEX idx_role_permissions_role_id       ON auth.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON auth.role_permissions(permission_id);

```

以下是前端的 menu 資料結構，包含了 icon、label、description 和 key 等欄位：

```json
[
  {
    "icon": "DashboardOutlined",
    "label": "Dashboard",
    "description": "儀表板",
    "key": "/dashboard"
  },
  {
    "icon": "TeamOutlined",
    "label": "Tenant Management",
    "description": "客戶管理",
    "key": "/users",
    "children": [
      {
        "icon": "UnorderedListOutlined",
        "label": "Tenant List",
        "description": "客戶列表",
        "key": "/users/list"
      },
      {
        "icon": "UserAddOutlined",
        "label": "Add Tenant",
        "description": "新增客戶",
        "key": "/users/add"
      }
    ]
  },
  {
    "icon": "LaptopOutlined",
    "label": "Property Management",
    "key": "/property-management",
    "description": "物業管理",
    "children": [
      {
        "icon": "InsertRowLeftOutlined",
        "label": "Building Management",
        "description": "大樓管理",
        "key": "/property-management/building"
      },
      {
        "icon": "BankOutlined",
        "label": "Room Management",
        "description": "房間管理",
        "key": "/property-management/room"
      },
      {
        "icon": "TruckOutlined",
        "label": "Vehicle Information",
        "description": "車輛管理",
        "key": "/property-management/car"
      }
    ]
  },
  {
    "icon": "ToolOutlined",
    "label": "Repair Management",
    "key": "/repair",
    "description": "修復管理"
  },
  {
    "icon": "DollarOutlined",
    "label": "Financial Management",
    "description": "財務管理",
    "key": "/finance",
    "children": [
      {
        "icon": "ProfileOutlined",
        "label": "Contract Management",
        "description": "合約管理",
        "key": "/finance/contract"
      },
      {
        "icon": "FrownOutlined",
        "label": "Contract Detail",
        "description": "合約明細",
        "key": "/finance/contract/detail"
      },
      {
        "icon": "FileTextOutlined",
        "label": "Billing Management",
        "description": "收費管理",
        "key": "/finance/bill"
      }
    ]
  },
  {
    "icon": "TransactionOutlined",
    "label": "Leasing Hub",
    "description": "招商管理",
    "key": "/merchant-portal"
  },
  {
    "icon": "FundProjectionScreenOutlined",
    "label": "Operations Management",
    "description": "運營管理",
    "key": "/operation-center",
    "children": [
      {
        "icon": "FundViewOutlined",
        "label": "Operations Overview",
        "description": "運營概覽",
        "key": "/operation-center/analytics"
      },
      {
        "icon": "ReadOutlined",
        "label": "Article Publishing",
        "description": "文章發布",
        "key": "/operation-center/article"
      },
      {
        "icon": "CommentOutlined",
        "label": "Content Comments",
        "description": "內容評論",
        "key": "/operation-center/comments"
      }
    ]
  },
  {
    "icon": "ToolOutlined",
    "label": "Equipment Management",
    "description": "設備管理",
    "key": "/equipment"
  },
  {
    "icon": "ThunderboltOutlined",
    "label": "Energy Consumption",
    "description": "能耗管理",
    "key": "/energy"
  },
  {
    "icon": "SettingOutlined",
    "label": "Authorization Settings",
    "description": "權限管理",
    "key": "/authorization-center"
  },
  {
    "icon": "UserOutlined",
    "label": "User Profile",
    "description": "個人資訊",
    "key": "/user-profile"
  }
]
```

依據目錄結構在 resource 資料表中新增資源：

```sql
INSERT INTO auth.resources (code, description) VALUES
('dashboard', '儀表板'),
('users.list', '客戶列表'),
('users.add', '新增客戶'),
('property.management.building', '大樓管理'),
('property.management.room', '房間管理'),
('property.management.car', '車輛管理'),
('repair', '修復管理'),
('finance.contract', '合約管理'),
('finance.contract.detail', '合約明細'),
('finance.bill', '收費管理'),
('merchant.portal', '招商管理'),
('operation.center.analytics', '運營概覽'),
('operation.center.article', '文章發布'),
('operation.center.comments', '內容評論'),
('equipment', '設備管理'),
('energy', '能耗管理'),
('authorization.center', '權限管理'),
('user.profile', '個人資訊');
```

建立對應的 permissions：

```sql
INSERT INTO auth.permissions (resource_id, action, description) VALUES
((SELECT id FROM auth.resources WHERE code = 'dashboard'), 'read', '查看儀表板'),
((SELECT id FROM auth.resources WHERE code = 'users.list'), 'read', '查看客戶列表'),
((SELECT id FROM auth.resources WHERE code = 'users.add'), 'read', '新增客戶'),
((SELECT id FROM auth.resources WHERE code = 'property.management.building'), 'read', '管理大樓'),
((SELECT id FROM auth.resources WHERE code = 'property.management.room'), 'read', '管理房間'),
((SELECT id FROM auth.resources WHERE code = 'property.management.car'), 'read', '管理車輛'),
((SELECT id FROM auth.resources WHERE code = 'repair'), 'read', '管理修復'),
((SELECT id FROM auth.resources WHERE code = 'finance.contract'), 'read', '管理合約'),
((SELECT id FROM auth.resources WHERE code = 'finance.contract.detail'), 'read', '查看合約明細'),
((SELECT id FROM auth.resources WHERE code = 'finance.bill'), 'read', '管理收費'),
((SELECT id FROM auth.resources WHERE code = 'merchant.portal'), 'read', '管理招商'),
((SELECT id FROM auth.resources WHERE code = 'operation.center.analytics'), 'read', '查看運營概覽'),
((SELECT id FROM auth.resources WHERE code = 'operation.center.article'), 'read', '管理文章發布'),
((SELECT id FROM auth.resources WHERE code = 'operation.center.comments'), 'read', '管理內容評論'),
((SELECT id FROM auth.resources WHERE code = 'equipment'), 'read', '管理設備'),
((SELECT id FROM auth.resources WHERE code = 'energy'), 'read', '管理能耗'),
((SELECT id FROM auth.resources WHERE code = 'authorization.center'), 'read', '管理權限'),
((SELECT id FROM auth.resources WHERE code = 'user.profile'), 'read', '查看個人資訊');
```

創建 admin user 和 admin role：

```sql
INSERT INTO auth.users (name, emp_id, password_hash, is_active) VALUES
('Admin User', 'admin001', 'P@ssw0rdHash', true);

INSERT INTO auth.roles (name, description) VALUES
('admin', '系統管理員角色');

INSERT INTO auth.user_roles (user_id, role_id) VALUES
((SELECT id FROM auth.users WHERE emp_id = 'admin001'), (SELECT id FROM auth.roles WHERE name = 'admin'));
```

替 admin role 分配所有權限：

```sql
INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM auth.roles WHERE name = 'admin'), id
FROM auth.permissions;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM auth.roles WHERE name = 'admin'), id
FROM auth.permissions
WHERE action = 'read';
```

返回特定使用者具有檢視哪些 page 的權限：

```sql
SELECT DISTINCT p.id, p.resource_id, p.action, p.description
FROM auth.permissions p
JOIN auth.role_permissions rp ON p.id = rp.permission_id
JOIN auth.user_roles ur ON rp.role_id = ur.role_id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.emp_id = 'admin001';
```

```sql
SELECT DISTINCT p.id, p.resource_id, p.action, p.description,
       r.code || '.' || p.action AS code
FROM auth.permissions p
JOIN auth.resources r ON p.resource_id = r.id
JOIN auth.role_permissions rp ON p.id = rp.permission_id
JOIN auth.user_roles ur ON rp.role_id = ur.role_id
JOIN auth.users u ON ur.user_id = u.id
WHERE p.action = 'read'
  AND u.emp_id = 'admin001';
```

````sql
SELECT DISTINCT r.code || '.' || p.action AS code
FROM auth.permissions p
JOIN auth.resources r ON p.resource_id = r.id
JOIN auth.role_permissions rp ON p.id = rp.permission_id
JOIN auth.user_roles ur ON rp.role_id = ur.role_id
JOIN auth.users u ON ur.user_id = u.id
WHERE p.action = 'read'
  AND u.emp_id = 'admin001';
```

the permissions for the admin user would be:

```json
[
  "authorization.center.read",
  "dashboard.read",
  "energy.read",
  "equipment.read",
  "finance.bill.read",
  "finance.contract.detail.read",
  "finance.contract.read",
  "merchant.portal.read",
  "operation.center.analytics.read",
  "operation.center.article.read",
  "operation.center.comments.read",
  "property.management.building.read",
  "property.management.car.read",
  "property.management.room.read",
  "repair.read",
  "user.profile.read",
  "users.add.read",
  "users.list.read"
]

```
````
