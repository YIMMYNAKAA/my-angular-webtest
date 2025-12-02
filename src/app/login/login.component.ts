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
    <div class="login-page">
      <div class="login-card">

        <h1>Welcome Back!</h1>
        <p class="subtitle">Enter your details below to sign in into your account</p>

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

    .social-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .social-buttons button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.15);
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: 0.3s;
    }

    .social-buttons img {
      width: 18px;
      height: 18px;
    }

    .divider {
      text-align: center;
      color: #ccc;
      margin: 20px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      font-size: 0.8rem;
    }

    .divider span {
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.3);
    }

    label {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 5px;
      margin-top: 10px;
    }

    input {
      width: 100%;
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

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login({ email: this.email, password: this.password })
      .pipe(catchError(() => {
        this.statusMessage = 'โปรดตรวจสอบข้อมูลอีกครั้ง';
        return EMPTY;
      }))
      .subscribe((res: any) => {
        if (res.status === 'success') {
          this.router.navigate(['/']);
        } else {
          this.statusMessage = res.message;
        }
      });
  }

  onNavigateToRegister() {
    this.router.navigate(['/register']);
  }
}
