import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], 
  template: `
    <div class="register-page">
      <div class="register-card">

        <h1>Create Account</h1>
        <p class="subtitle">Fill in the details below to register your new account</p>

        <div *ngIf="statusMessage" class="status-message" [class.success]="isRegisterSuccess">
          {{ statusMessage }}
        </div>

        <form (ngSubmit)="onRegister()">

          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required>

          <label>Username</label>
          <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" required>

          <label>Password</label>
          <div class="password-wrapper">
            <input type="password" [(ngModel)]="password" name="password" placeholder="Create password" required>
          </div>

          <button class="register-btn">Create Account</button>
        </form>

        <p class="login-text">
          Already have an account? 
          <a (click)="onNavigateToLogin()">Login</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      background: url('4.jpg') center/cover no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .register-card {
      width: 450px;
      padding: 35px;
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      color: #fff;
      animation: fadeIn 0.4s ease;
      text-align: left;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .subtitle {
      font-size: 0.9rem;
      color: #ddd;
      margin-bottom: 25px;
    }

    label {
      display: block;
      margin-top: 15px;
      margin-bottom: 5px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    input {
      width: 95%;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255, 255, 255, 0.25);
      color: white;
      font-size: 1rem;
      margin-bottom: 10px;
    }

    input::placeholder {
      color: rgba(230,230,230,0.8);
    }

    .password-wrapper {
      position: relative;
    }

    /* ปุ่ม Register */
    .register-btn {
      width: 100%;
      padding: 13px;
      background: #257CFF;
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 20px;
      transition: 0.25s;
    }

    .register-btn:hover {
      background: #1b63cc;
    }

    .login-text {
      margin-top: 20px;
      text-align: center;
      color: #ddd;
    }

    .login-text a {
      color: #4da3ff;
      cursor: pointer;
      font-weight: 600;
    }

    .status-message {
      padding: 12px;
      margin-bottom: 15px;
      border-radius: 10px;
      background: rgba(255, 80, 80, 0.25);
      border: 1px solid rgba(255, 140, 140, 0.4);
      color: white;
      font-weight: bold;
    }

    .status-message.success {
      background: rgba(70, 255, 70, 0.25);
      border-color: rgba(140, 255, 140, 0.4);
      color: #d7ffd7;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `]
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  statusMessage = '';
  isRegisterSuccess = false;

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    this.statusMessage = '';
    this.isRegisterSuccess = false;

    if (!this.email || !this.username || !this.password) {
      this.statusMessage = 'โปรดกรอกข้อมูลให้ครบถ้วน';
      return;
    }

    const data = {
      name: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post("http://192.168.1.166/php-bob/register.php", data)
      .subscribe({
        next: (res: any) => {
          if (res.status === "success") {
            this.isRegisterSuccess = true;
            this.statusMessage = 'ลงทะเบียนสำเร็จ!';
          } else {
            this.statusMessage = "ผิดพลาด: " + res.message;
          }
        },
        error: (err) => {
          this.statusMessage = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้: ' + err.message;
        }
      });
  }

  onNavigateToLogin() {
    this.router.navigate(['/login']);
  }
}
