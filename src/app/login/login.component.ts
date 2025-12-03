import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-page">
      <div class="login-card">

        <h1>Welcome Back!</h1>
        <p class="subtitle">Enter your details below to sign in into your account</p>

        @if (statusMessage) {
          <p class="status-message" [class.success]="isLoginSuccess" [class.error]="!isLoginSuccess">
            {{ statusMessage }}
          </p>
        }

        <form (ngSubmit)="onLogin()">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required>

          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" placeholder="Enter Password" required>

          <a class="forgot" href="#">Forgot Password?</a>

          <button class="login-btn">Login</button>
        </form>

        <p class="signup-text">
          Don't Have An Account? <a (click)="onNavigateToRegister()">Sign Up</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: url("3.jpg") center/cover no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .login-card {
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

    .status-message {
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-weight: 500;
      text-align: center;
    }
    .status-message.error {
      background-color: rgba(255, 99, 71, 0.2);
      color: tomato;
      border: 1px solid tomato;
    }
    .status-message.success {
      background-color: rgba(144, 238, 144, 0.2);
      color: lightgreen;
      border: 1px solid lightgreen;
    }

    label {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 5px;
      margin-top: 10px;
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

    .forgot {
      display: block;
      text-align: right;
      margin-bottom: 18px;
      color: #80b3ff;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .login-btn {
      width: 100%;
      padding: 13px;
      background: #257CFF;
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.25s;
    }

    .login-btn:hover {
      background: #1b63cc;
    }

    .signup-text {
      text-align: center;
      margin-top: 20px;
      color: #ccc;
      font-size: 0.9rem;
    }

    .signup-text a {
      color: #4da3ff;
      cursor: pointer;
      font-weight: 600;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `]
})
export class LoginComponent {

  email = '';
  password = '';
  statusMessage = '';
  isLoginSuccess = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.statusMessage = '';
    this.isLoginSuccess = false;

    const apiUrl = 'http://192.168.1.166/php-bob/login.php';

    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post(apiUrl, body)
      .pipe(
        catchError(() => {
          this.statusMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ❌';
          this.isLoginSuccess = false;
          return EMPTY;
        })
      )
      .subscribe((res: any) => {

        if (res.status === 'success') {
          this.isLoginSuccess = true;
          this.statusMessage = res.message;

          // ✅ บันทึกข้อมูล user ลง localStorage
          localStorage.setItem('currentUser', JSON.stringify(res.user));

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 800);

        } else {
          this.isLoginSuccess = false;
          this.statusMessage = res.message;
        }
      });
  }

  onNavigateToRegister() {
    this.router.navigate(['/register']);
  }
}