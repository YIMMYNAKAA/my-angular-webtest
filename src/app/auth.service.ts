import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * Call backend login endpoint.
   * Adjust the URL and response type to match your backend.
   */
  login(payload: LoginPayload): Observable<any> {
    // Default to the local PHP backend used in the project. Change if needed.
    return this.http.post('http://192.168.1.166/php-bob/login.php', payload);
  }
}
