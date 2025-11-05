# Auth Tag API Paths

The table below lists every operation in `Documents/contract/api.json` whose `tags` array includes `Auth`.

| Method | Path                             | Summary                                                   |
| ------ | -------------------------------- | --------------------------------------------------------- |
| GET    | /api/auth/{empId}                | Retrieve user information by employee ID                  |
| POST   | /api/auth/login                  | Authenticate user and generate JWT token with permissions |
| GET    | /api/auth/me                     | Fetch current user context                                |
| GET    | /api/auth/permissions            | List all active permissions                               |
| POST   | /api/auth/register               | Register a new user                                       |
| GET    | /api/auth/roles                  | Retrieve role list                                        |
| POST   | /api/auth/roles                  | Create a new role                                         |
| GET    | /api/auth/roles/{id}             | Retrieve a role by ID                                     |
| PUT    | /api/auth/roles/{id}/permissions | Replace role permission set                               |
| GET    | /api/auth/users                  | Retrieve paginated users                                  |
| POST   | /api/auth/users                  | Create a new user                                         |
| DELETE | /api/auth/users/{empId}          | Soft delete a user                                        |
| GET    | /api/auth/users/{empId}          | Retrieve a user by employee ID                            |
| PUT    | /api/auth/users/{empId}          | Update user information                                   |
| PUT    | /api/auth/users/{empId}/roles    | Replace user role set                                     |
| GET    | /api/auth/resources              | Retrieve all resources                                    |
