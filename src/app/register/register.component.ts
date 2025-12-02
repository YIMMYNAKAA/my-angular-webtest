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
    <div class="register-container">
      <div class="register-card">
        <h2>{{ title }}</h2>
        
        <!-- แสดงข้อความสถานะ -->
        <div *ngIf="statusMessage" class="status-message" [class.success]="isRegisterSuccess">{{ statusMessage }}</div>

        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label for="email">อีเมล (Email)</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required>
          </div>

          <div class="form-group">
            <label for="username">ชื่อผู้ใช้ (Username)</label>
            <input type="text" id="username" name="username" [(ngModel)]="username" required>
          </div>

          <div class="form-group">
            <label for="password">รหัสผ่าน (Password)</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required>
          </div>

          <button type="submit" class="register-btn">ลงทะเบียน</button>
        </form>
        
        <button class="login-link-btn" (click)="onNavigateToLogin()">
          ไปที่หน้าเข้าสู่ระบบ
        </button>
        <p class="hint">ข้อมูลจะถูกส่งไปยัง Server ภายนอก</p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background-color: #f4f4f9;
    }
    .register-card {
      background: white;
      padding: 2.5rem;
      border-radius: 10px;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 450px;
      text-align: center;
      border: 1px solid #ddd;
    }
    h2 {
      margin-bottom: 2rem;
      color: #3e2723;
      font-size: 1.8rem;
    }
    .status-message {
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
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
      margin-bottom: 1.25rem;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }
    input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .register-btn {
      width: 100%;
      padding: 0.8rem;
      background-color: #5cb85c;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      margin-top: 1.5rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .register-btn:hover {
      background-color: #4cae4c;
    }
    .login-link-btn {
      width: 100%;
      padding: 0.8rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      margin-top: 0.75rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .login-link-btn:hover {
      background-color: #0056b3;
    }
    .hint {
        margin-top: 1.5rem;
        color: #888;
        font-size: 0.9rem;
    }
  `]
})
export class RegisterComponent {
  title = 'ลงทะเบียนสมาชิกใหม่';
  email = '';
  username = '';
  password = '';
  statusMessage = '';
  isRegisterSuccess = false;

  constructor(private http: HttpClient, private router: Router) {} 

  onRegister() {
    this.statusMessage = '';
    this.isRegisterSuccess = false;
    
    // ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
    if (!this.email || !this.username || !this.password) {
      this.statusMessage = 'โปรดกรอกข้อมูลให้ครบถ้วน';
      return;
    }

    const data = {
      name: this.username,
      email: this.email,
      password: this.password
    };

    // จำลองการส่งข้อมูลไปยัง Server ภายนอก (ตาม URL ที่คุณกำหนดไว้)
    this.http.post("http://192.168.1.166/php-bob/register.php", data)
      .subscribe({
        next: (res: any) => {
          // หาก Server ส่ง status=success กลับมา
          if (res.status === "success") {
            this.isRegisterSuccess = true;
            this.statusMessage = 'ลงทะเบียนสำเร็จ! โปรดเข้าสู่ระบบ';
            this.email = '';
            this.username = '';
            this.password = '';
            // ในการใช้งานจริง ควรจะนำทางไปยังหน้า login ทันที
            // this.router.navigate(['/login']); 
          } else {
            // กรณีลงทะเบียนไม่สำเร็จ (เช่น ชื่อผู้ใช้ซ้ำ)
            this.statusMessage = "ผิดพลาด: " + (res.message || 'ไม่สามารถลงทะเบียนได้');
          }
        },
        error: (err) => {
            // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อ HTTP
            console.error("HTTP Error:", err);
            // ปรับปรุงการแสดงข้อความเพื่อให้มีรายละเอียดมากขึ้น
            this.statusMessage = `เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์: ${err.message}. โปรดตรวจสอบคอนโซล (F12) เพื่อดูข้อมูลเพิ่มเติม`;
        }
      });
  }

  // เมธอดสำหรับนำทางไปหน้า Login
  onNavigateToLogin() {
    this.router.navigate(['/login']);
  }
}