import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>{{ title }}</h2>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="username">ชื่อผู้ใช้ (Username)</label>
            <input type="text" id="username" name="username" [(ngModel)]="username" required>
          </div>
          <div class="form-group">
            <label for="password">รหัสผ่าน (Password)</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required>
          </div>
          <button type="submit">เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh; 
      background-color: #f4f4f9;
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #333;
    }
    .form-group {
      margin-bottom: 1rem;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #555;
    }
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #d9534f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }
    button:hover {
      background-color: #c9302c;
    }
  `]
})
export class LoginComponent {
  title = 'เข้าสู่ระบบ';
  username = '';
  password = '';

  onLogin() {
    if (this.username === 'user' && this.password === 'pass') {
      alert('Login successful! Welcome, ' + this.username);
      // ในแอปจริง: ควรใช้ Router เพื่อนำไปยังหน้าอื่น
    } else {
      alert('Login failed. Invalid credentials.');
    }
    
    this.username = '';
    this.password = '';
  }
}