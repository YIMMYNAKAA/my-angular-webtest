import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">

        <h2>{{ title }}</h2>

        <!-- แสดงข้อความสถานะ -->
        <div *ngIf="statusMessage" class="status-message" [class.success]="isLoginSuccess">{{ statusMessage }}</div>

        <form (ngSubmit)="onLogin()">

          <div class="form-group">
            <label for="email">อีเมล (Email)</label>
            <input type="text" id="email" name="email" [(ngModel)]="email" required>
          </div>

          <div class="form-group">
            <label for="password">รหัสผ่าน (Password)</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required>
          </div>

          <!-- ปุ่ม Login อยู่กลางแบบเต็มความกว้าง -->
          <div class="button-center">
            <button type="submit" class="login-btn">เข้าสู่ระบบ</button>
          </div>

        </form>

        <button class="register-link-btn" (click)="onNavigateToRegister()">
          ลงทะเบียนสมาชิกใหม่
        </button>

      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      text-align: center;
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    h2 {
      margin-bottom: 1.8rem;
      color: #333;
      font-size: 1.9rem;
      font-weight: bold;
    }

    .status-message {
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 6px;
      font-weight: bold;
      color: #721c24;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .status-message.success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    .form-group {
      margin-bottom: 1.2rem;
      text-align: left;
    }

    label {
      font-weight: bold;
      margin-bottom: 6px;
      display: block;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.85rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
      transition: 0.2s;
    }

    input:focus {
      border-color: #6a11cb;
      outline: none;
      box-shadow: 0 0 5px rgba(106, 17, 203, 0.4);
    }

    /* จัดปุ่ม Login ให้อยู่ตรงกลาง */
    .button-center {
      display: flex;
      justify-content: center;
      margin-top: 15px;
    }

    .login-btn {
      width: 100%;
      padding: 0.85rem;
      background-color: #28a745;
      color: white;
      font-size: 1.1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: 0.25s;
      font-weight: bold;
    }

    .login-btn:hover {
      background-color: #218838;
      box-shadow: 0 5px 12px rgba(40, 167, 69, 0.3);
    }

    .register-link-btn {
      width: 100%;
      padding: 0.85rem;
      margin-top: 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: 0.25s;
    }

    .register-link-btn:hover {
      background-color: #0056b3;
      box-shadow: 0 5px 12px rgba(0, 123, 255, 0.3);
    }
  `]
})
export class LoginComponent {
  title = 'เข้าสู่ระบบ';
  email = '';
  password = '';
  statusMessage = '';
  isLoginSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.statusMessage = '';
    this.isLoginSuccess = false;

    const data = {
      email: this.email,
      password: this.password
    };

    this.authService.login(data)
      .pipe(catchError(error => { 
        console.error('Login HTTP Error:', error);
        this.statusMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
        return EMPTY;
      }))
      .subscribe((res: any) => {

        if (res.status === "success") {
          this.isLoginSuccess = true;
          this.statusMessage = "เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ " + res.user.name;

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1200);

        } else {
          this.statusMessage = "เข้าสู่ระบบล้มเหลว: " + res.message;
        }

        this.email = '';
        this.password = '';
      });
  }

  onNavigateToRegister() {
    this.router.navigate(['/register']);
  }
}
