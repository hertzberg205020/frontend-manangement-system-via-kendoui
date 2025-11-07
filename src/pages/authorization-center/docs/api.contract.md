# Auth Tag API Paths

The table below lists every operation in `Documents/contract/api.json` whose `tags` array includes `Auth`.

| Method | Path                             | Summary                                                   | signature in IAuthorizationService                                                                                  |
| ------ | -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| GET    | /api/auth/{empId}                | Retrieve user information by employee ID                  | *Not implemented in interface*                                                                                      |
| POST   | /api/auth/login                  | Authenticate user and generate JWT token with permissions | *Not in authorization service scope*                                                                                |
| GET    | /api/auth/me                     | Fetch current user context                                | `getAuthMe(): Promise<AuthMeDTO>`                                                                                   |
| GET    | /api/auth/permissions            | List all active permissions                               | `getPermissions(): Promise<PermissionDTO[]>`                                                                        |
| POST   | /api/auth/register               | Register a new user                                       | *Not in authorization service scope*                                                                                |
| GET    | /api/auth/roles                  | Retrieve role list                                        | `getRoles(): Promise<RoleDTO[]>`                                                                                    |
| POST   | /api/auth/roles                  | Create a new role                                         | `createRole(data: Partial<RoleDTO>): Promise<RoleDTO>`                                                              |
| GET    | /api/auth/roles/{id}             | Retrieve a role by ID                                     | *Not implemented in interface*                                                                                      |
| PUT    | /api/auth/roles/{id}/permissions | Replace role permission set                               | `updateRolePermissions(roleId: number, payload: UpdateRolePermissionsPayload): Promise<RolePermissionsResponse>`    |
| GET    | /api/auth/users                  | Retrieve paginated users                                  | `getUsers(params?: PaginationQuery): Promise<PaginatedResponse<UserDTO>>`                                           |
| POST   | /api/auth/users                  | Create a new user                                         | `createUser(data: Partial<UserDTO>): Promise<UserDTO>`                                                              |
| DELETE | /api/auth/users/{empId}          | Soft delete a user                                        | `deleteUser(id: number): Promise<{ success: boolean } \| string>`                                                   |
| GET    | /api/auth/users/{empId}          | Retrieve a user by employee ID                            | *Not implemented in interface*                                                                                      |
| PUT    | /api/auth/users/{empId}          | Update user information                                   | `updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO>`                                                  |
| PUT    | /api/auth/users/{empId}/roles    | Replace user role set                                     | `updateUserRoles(userId: number, payload: UpdateUserRolesPayload): Promise<{ userId: number; roleIds: number[]; }>` |
| GET    | /api/auth/resources              | Retrieve all resources                                    | `getResources(): Promise<ResourceDTO[]>`                                                                            |
