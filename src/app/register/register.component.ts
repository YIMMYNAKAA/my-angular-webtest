import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface GameState {
  playerX: number;
  playerY: number;
  obstacles: Obstacle[];
  speed: number;
  keys: { [key: string]: boolean };
  animationId: number | null;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed?: boolean;
}

interface LeaderboardEntry {
  id?: number;
  player_name: string;
  score: number;
  play_date: string;
  email?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-racing-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-container">
      
      <div *ngIf="!currentUser" class="login-required-screen">
        <div class="login-required-card">
          <h1>🏎️ Racing Game</h1>
          <p class="subtitle">กรุณาเข้าสู่ระบบก่อนเล่นเกม</p>
          <button class="login-btn" (click)="goToLogin()">🔐 เข้าสู่ระบบ</button>
          <button class="register-btn" (click)="goToRegister()">📝 สมัครสมาชิก</button>
        </div>
      </div>

      <div *ngIf="currentUser && gameState === 'menu'" class="menu-screen">
        <div class="menu-card">
          <h1>🏎️ Racing Game</h1>
          <p class="subtitle">ยินดีต้อนรับ, {{currentUser.name}}!</p>
          <p class="info-text">หลีกหลบรถคู่แข่งและทำคะแนนสูงสุด!</p>

          <button class="start-btn" (click)="startGame()">🚀 เริ่มเกม</button>
          <button class="logout-btn" (click)="onLogout()">🚪 ออกจากระบบ</button>

          <div class="instructions">
            <p class="ins-title">🎮 วิธีเล่น:</p>
            <p>← → ขับรถซ้าย-ขวา</p>
            <p>หลีกหลบรถสีแดง และทำคะแนนให้สูงที่สุด!</p>
          </div>

          <div *ngIf="isLoading" class="loading">
            <p>⏳ กำลังโหลด...</p>
          </div>

          <div *ngIf="!isLoading && leaderboard.length > 0" class="leaderboard-section">
            <h2>🏆 Leaderboard</h2>
            <div class="leaderboard-list">
              <div *ngFor="let entry of leaderboard; let i = index" class="leader-item">
                <span class="rank">{{i + 1}}. {{entry.player_name}}</span>
                <span class="score">{{entry.score}} pts</span>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            ⚠️ {{errorMessage}}
          </div>
        </div>
      </div>

      <div *ngIf="currentUser && gameState === 'playing'" class="game-screen">
        <div class="game-area">
          <div class="score-panel">
            <p class="score-text">คะแนน: {{score}}</p>
            <p class="player-text">ผู้เล่น: {{currentUser.name}}</p>
          </div>
          <canvas #gameCanvas width="400" height="600"></canvas>
        </div>

        <div class="side-leaderboard">
          <h2>🏆 Leaderboard</h2>
          <div *ngIf="leaderboard.length > 0" class="leaderboard-list">
            <div *ngFor="let entry of leaderboard; let i = index" class="leader-item">
              <span class="rank">{{i + 1}}. {{entry.player_name}}</span>
              <span class="score">{{entry.score}}</span>
            </div>
          </div>
          <p *ngIf="leaderboard.length === 0" class="no-scores">ยังไม่มีคะแนน</p>
        </div>
      </div>

      <div *ngIf="currentUser && gameState === 'gameover'" class="gameover-screen">
        <div class="gameover-card">
          <h1 class="gameover-title">💥 Game Over!</h1>
          <p class="score-label">คะแนนของคุณ</p>
          <p class="final-score">{{score}}</p>

          <div *ngIf="isSaving" class="saving-status">
            ⏳ กำลังบันทึกคะแนน...
          </div>

          <div *ngIf="saveSuccess" class="success-message">
            ✅ บันทึกคะแนนสำเร็จ!
          </div>

          <div class="leaderboard-section">
            <h2>🏆 Leaderboard</h2>
            <div *ngIf="leaderboard.length > 0" class="leaderboard-list">
              <div 
                *ngFor="let entry of leaderboard; let i = index" 
                class="leader-item"
                [class.highlight]="isCurrentPlayer(entry)"
              >
                <span class="rank">{{i + 1}}. {{entry.player_name}}</span>
                <span class="score">{{entry.score}} pts</span>
              </div>
            </div>
          </div>

          <button class="restart-btn" (click)="backToMenu()">🔄 เล่นอีกครั้ง</button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* 1. ธีมพื้นหลังรวม */
    .game-container {
      min-height: 100vh;
      /* เปลี่ยนพื้นหลังให้มีมิติของความมืดและสว่างของสนามแข่ง */
      background: #0f0f0f; 
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    /* 2. สไตล์สำหรับ Card (Menu, Game Over, Login Required) */
    .menu-card, .gameover-card, .login-required-card {
      /* ปรับให้โปร่งแสงน้อยลงและใช้สีเทาเข้มเพื่อความโมเดิร์น */
      background: rgba(30, 30, 30, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      border: 3px solid #6c757d; /* เพิ่มขอบสีเทา */
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      text-align: center;
      color: #e0e0e0; /* สีข้อความสว่าง */
      max-width: 450px; /* ลดขนาด Card เล็กน้อย */
    }

    h1 {
      font-size: 2.8rem; /* ลดขนาดฟอนต์เล็กน้อย */
      color: #00bcd4; /* สีฟ้า-เขียว Neon */
      margin-bottom: 10px;
      text-shadow: 0 0 10px rgba(0, 188, 212, 0.5); /* เพิ่มแสง Neon */
      font-weight: 800;
      letter-spacing: 1px;
    }

    .subtitle {
      color: #ff9800; /* สีส้ม Amber */
      font-size: 1.1rem;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .info-text {
      color: #aaa;
      font-size: 1rem;
      margin-bottom: 25px;
    }

    /* 3. สไตล์ปุ่ม */
    .start-btn, .restart-btn, .login-btn, .register-btn, .logout-btn {
      padding: 15px 40px;
      border: none;
      border-radius: 10px; /* ขอบโค้งมนน้อยลง */
      font-size: 1.1rem; /* ลดขนาดฟอนต์ปุ่ม */
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 8px;
      width: 100%;
      max-width: 250px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .start-btn {
      background: linear-gradient(90deg, #10b981, #059669); /* ไล่สีเขียวนีออน */
      color: #fff;
    }

    .login-btn {
      background: linear-gradient(90deg, #3b82f6, #2563eb); /* ไล่สีน้ำเงินเข้ม */
      color: #fff;
    }

    .register-btn {
      background: linear-gradient(90deg, #ff9800, #f57c00); /* ไล่สีส้มเข้ม */
      color: #fff;
    }

    .logout-btn {
      background: linear-gradient(90deg, #ef4444, #dc2626);
      color: white;
      font-size: 1rem;
      padding: 10px 25px;
    }

    .start-btn:hover, .restart-btn:hover, .login-btn:hover, .register-btn:hover, .logout-btn:hover {
      transform: translateY(-3px); /* ยกขึ้นเล็กน้อย */
      opacity: 0.9;
    }

    /* 4. ส่วนของ Game Area และ Canvas */
    .game-screen {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      /* ปรับพื้นหลังให้ดูเป็นห้องมืดๆ */
      background: #1a1a1a; 
      border-radius: 25px;
      padding: 30px;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
    }

    .game-area {
      background: #252525; /* พื้นที่เกมเป็นสีดำเข้ม */
      border-radius: 15px;
      padding: 15px;
      border: 5px solid #1a1a1a;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    }

    canvas {
      border: 5px solid #00bcd4; /* กรอบสี Neon */
      border-radius: 10px;
      display: block;
      box-shadow: 0 0 15px #00bcd4; /* เพิ่มแสงเรืองรอง */
    }

    .score-panel {
      text-align: center;
      margin-bottom: 15px;
      background: #333;
      padding: 10px;
      border-radius: 8px;
    }

    .score-text {
      color: #ffeb3b; /* สีเหลืองทอง */
      font-size: 2rem;
      font-weight: 900;
      margin: 0;
      text-shadow: 0 0 8px rgba(255, 235, 59, 0.5);
    }

    .player-text {
      color: #aaa;
      font-size: 1.1rem;
    }

    /* 5. Leaderboard Sidebar */
    .side-leaderboard {
      background: #1a1a1a;
      border-radius: 15px;
      padding: 25px;
      border: 2px solid #555;
      min-width: 300px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .side-leaderboard h2, .leaderboard-section h2 {
      color: #ff9800; /* สีส้ม Amber */
      font-size: 1.5rem;
      margin-bottom: 15px;
      border-bottom: 2px solid #ff9800;
      padding-bottom: 5px;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .leader-item {
      display: flex;
      justify-content: space-between;
      background: #303030; /* สีพื้นหลังรายการ */
      padding: 10px 15px;
      border-radius: 5px;
      border-left: 5px solid #00bcd4;
      transition: background 0.2s;
    }

    .leader-item.highlight {
      background: #054d35;
      border-color: #10b981;
      animation: highlight-pulse 2s infinite;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    @keyframes highlight-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
      50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
    }

    .rank {
      color: #fff;
      font-weight: 700;
    }

    .score {
      color: #ffeb3b; /* คะแนนสีเหลือง */
      font-weight: bold;
    }

    .no-scores {
      color: #999;
      text-align: center;
      padding: 20px;
    }

    .gameover-title {
      color: #ef4444;
      font-size: 3.5rem;
      text-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
    }

    .score-label {
      color: #ddd;
      font-size: 1.3rem;
      margin: 15px 0 5px;
    }

    .final-score {
      color: #ffeb3b;
      font-size: 5rem;
      font-weight: 900;
      margin-bottom: 25px;
      text-shadow: 0 0 15px rgba(255, 235, 59, 0.8);
    }

    .success-message {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 15px;
      border-radius: 10px;
      margin: 15px 0;
      font-weight: bold;
      border: 2px solid #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    .loading, .saving-status {
      color: #60a5fa;
      font-size: 1.1rem;
      margin: 20px 0;
      animation: pulse 1.5s infinite;
    }

    /* สไตล์เดิมที่จำเป็น */
    .instructions {
      margin-top: 30px;
      color: #ddd;
    }

    .ins-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 12px;
      border-radius: 10px;
      margin: 15px 0;
      border: 2px solid #ef4444;
    }

    .leaderboard-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 25px;
      margin: 30px 0;
    }

    /* 7. Responsive Adjustments */
    @media (max-width: 768px) {
      .game-screen {
        flex-direction: column;
        align-items: center;
        padding: 15px;
      }
      
      .side-leaderboard {
        width: 100%;
        max-width: 400px;
      }

      .menu-card, .gameover-card, .login-required-card {
        padding: 25px;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class RacingGameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // API URL
  private apiUrl = 'http://192.168.1.166/php-bob/racing/';

  // User Management
  currentUser: User | null = null;

  gameState: 'menu' | 'playing' | 'gameover' = 'menu';
  score = 0;
  leaderboard: LeaderboardEntry[] = [];
  isLoading = false;
  isSaving = false;
  saveSuccess = false;
  errorMessage = '';
  
  private game: GameState = {
    playerX: 175,
    playerY: 450,
    obstacles: [],
    speed: 3,
    keys: {},
    animationId: null
  };

  private currentScore = 0;
  private lastSavedScore = 0;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // โหลดข้อมูล user จาก localStorage
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
    
    if (this.currentUser) {
      this.loadLeaderboard();
    }
  }

  ngOnDestroy() {
    if (this.game.animationId) {
      cancelAnimationFrame(this.game.animationId);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  onLogout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  loadLeaderboard() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.apiUrl + 'get_leaderboard.php')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success') {
            this.leaderboard = response.data;
          } else {
            this.errorMessage = 'ไม่สามารถโหลดข้อมูลได้';
            console.error('Error:', response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
          console.error('HTTP Error:', error);
        }
      });
  }

  saveScore(userId: number, finalScore: number) {
    if (!userId || finalScore <= 0) return;

    this.isSaving = true;
    this.saveSuccess = false;

    const data = {
      user_id: userId,
      score: finalScore
    };

    this.http.post<any>(this.apiUrl + 'save_score.php', data)
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.status === 'success') {
            this.saveSuccess = true;
            this.lastSavedScore = finalScore;
            this.loadLeaderboard();
          } else {
            this.errorMessage = 'บันทึกคะแนนไม่สำเร็จ';
            console.error('Save error:', response.message);
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
          console.error('HTTP Error:', error);
        }
      });
  }

  startGame() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.score = 0;
    this.currentScore = 0;
    this.saveSuccess = false;
    this.errorMessage = '';
    this.game = {
      playerX: 175,
      playerY: 450,
      obstacles: [],
      speed: 3,
      keys: {},
      animationId: null
    };
    this.gameState = 'playing';

    setTimeout(() => this.initGame(), 100);
  }

  initGame() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const handleKeyDown = (e: KeyboardEvent) => {
      this.game.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.game.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = Date.now();
    let obstacleTimer = 0;
    let lineDashOffset = 0; // เพิ่มตัวแปรสำหรับ Road Line Animation

    // **NEW HELPER FUNCTION:** Draw a rectangle with rounded corners
    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    };

    const gameLoop = () => {
      if (this.gameState !== 'playing') {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        return;
      }

      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      // 1. Clear canvas & Draw background
      ctx.fillStyle = '#0f0f0f'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Road (Darker color for depth)
      ctx.fillStyle = '#1b1b1b'; 
      ctx.fillRect(40, 0, canvas.width - 80, canvas.height);
      
      // 3. Draw Road Borders (Neon lines)
      ctx.fillStyle = '#10b981'; // Neon Green
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fillRect(40, 0, 5, canvas.height);
      ctx.fillRect(canvas.width - 45, 0, 5, canvas.height);
      ctx.shadowBlur = 0;

      // 4. Update and Draw Road Lines with Animation
      lineDashOffset -= this.game.speed * 0.5; 
      if (lineDashOffset < 0) {
        lineDashOffset += 35; 
      }

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 15]);
      ctx.lineDashOffset = lineDashOffset; // ใช้ Offset เพื่อทำให้เส้นเคลื่อนที่
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]); // รีเซ็ต dashed lines

      // Player movement
      if (this.game.keys['ArrowLeft'] && this.game.playerX > 45) { 
        this.game.playerX -= 5;
      }
      if (this.game.keys['ArrowRight'] && this.game.playerX < 315) { 
        this.game.playerX += 5;
      }

      // 5. Draw Player Car (Detailed)
      const playerW = 40;
      const playerH = 60;
      const playerX = this.game.playerX;
      const playerY = this.game.playerY;

      // Car Body (Neon Blue/Green)
      ctx.fillStyle = '#00bcd4';
      drawRoundedRect(playerX, playerY, playerW, playerH, 8);
      
      // Window/Roof (Dark Gray)
      ctx.fillStyle = '#444';
      drawRoundedRect(playerX + 5, playerY + 15, 30, 20, 5);

      // Headlights (Neon Yellow/Orange)
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 8;
      ctx.fillRect(playerX + 2, playerY + 5, 5, 5);
      ctx.fillRect(playerX + playerW - 7, playerY + 5, 5, 5);
      ctx.shadowBlur = 0; // Reset blur

      // 6. Spawn obstacles
      obstacleTimer += delta;
      if (obstacleTimer > 1500) {
        const lanes = [65, 160, 255]; // Adjusted lanes to fit new road borders
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.game.obstacles.push({
          x: randomLane,
          y: -60,
          width: 40,
          height: 60
        });
        obstacleTimer = 0;
      }

      // 7. Update and draw obstacles
      this.game.obstacles = this.game.obstacles.filter(obs => {
        obs.y += this.game.speed;

        const obsW = obs.width;
        const obsH = obs.height;
        const obsX = obs.x;
        const obsY = obs.y;

        // Car Body (Fiery Red)
        ctx.fillStyle = '#ef4444'; 
        drawRoundedRect(obsX, obsY, obsW, obsH, 8);

        // Window/Roof (Dark Gray)
        ctx.fillStyle = '#444';
        drawRoundedRect(obsX + 5, obsY + 15, 30, 20, 5);

        // Taillights (Bright Red)
        ctx.fillStyle = '#ff0000'; 
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillRect(obsX + 2, obsY + obsH - 10, 5, 5);
        ctx.fillRect(obsX + obsW - 7, obsY + obsH - 10, 5, 5);
        ctx.shadowBlur = 0; // Reset blur


        // Check collision
        if (
          playerX < obsX + obsW &&
          playerX + playerW > obsX &&
          playerY < obsY + obsH &&
          playerY + playerH > obsY
        ) {
          this.endGame();
          return false;
        }

        // Score when passing obstacle
        if (obs.y > playerY + playerH && !obs.passed) {
          obs.passed = true;
          this.currentScore += 10;
          this.score = this.currentScore;
          this.game.speed += 0.05;
        }

        return obs.y < canvas.height;
      });

      this.game.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  endGame() {
    if (this.game.animationId) {
      cancelAnimationFrame(this.game.animationId);
    }
    this.gameState = 'gameover';
    
    // บันทึกคะแนนลง database
    if (this.score > 0 && this.currentUser) {
      this.saveScore(this.currentUser.id, this.score);
    }
  }

  backToMenu() {
    this.gameState = 'menu';
    this.saveSuccess = false;
    this.errorMessage = '';
    this.loadLeaderboard();
  }

  isCurrentPlayer(entry: LeaderboardEntry): boolean {
    return this.currentUser !== null &&
           entry.player_name === this.currentUser.name && 
           entry.score === this.lastSavedScore;
  }
}