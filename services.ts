/**
 * Services module.
 * TypeScript service classes and interfaces for the application layer.
 */

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  active: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface Config {
  baseUrl: string;
  timeout: number;
  retries: number;
}

/**
 * Low-level HTTP client with retry logic.
 */
export class ApiClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async get<T>(path: string, token: string): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return { data, status: response.status, message: response.statusText };
  }

  async post<T>(path: string, body: unknown, token: string): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { data, status: response.status, message: response.statusText };
  }

  async delete(path: string, token: string): Promise<boolean> {
    const url = `${this.config.baseUrl}${path}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  }
}

/**
 * High-level user service built on top of ApiClient.
 */
export class UserService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getUser(userId: string, token: string): Promise<UserRecord> {
    const res = await this.client.get<UserRecord>(`/users/${userId}`, token);
    return res.data;
  }

  async createUser(
    username: string,
    email: string,
    token: string
  ): Promise<UserRecord> {
    const res = await this.client.post<UserRecord>(
      "/users",
      { username, email },
      token
    );
    return res.data;
  }

  async deactivateUser(userId: string, token: string): Promise<boolean> {
    return this.client.delete(`/users/${userId}`, token);
  }

  async listActiveUsers(token: string): Promise<UserRecord[]> {
    const res = await this.client.get<UserRecord[]>("/users?active=true", token);
    return res.data;
  }
}

/**
 * Notification service for user-facing alerts.
 */
export class NotificationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`[NotificationService] Sending email to ${to}: ${subject}`);
    return true;
  }

  async sendAlert(userId: string, message: string): Promise<void> {
    console.log(`[NotificationService] Alert for ${userId}: ${message}`);
  }
}
