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
      
      <!-- Login Required Screen -->
      <div *ngIf="!currentUser" class="login-required-screen">
        <div class="login-required-card">
          <h1>🏎️ Racing Game</h1>
          <p class="subtitle">กรุณาเข้าสู่ระบบก่อนเล่นเกม</p>
          <button class="login-btn" (click)="goToLogin()">🔐 เข้าสู่ระบบ</button>
          <button class="register-btn" (click)="goToRegister()">📝 สมัครสมาชิก</button>
        </div>
      </div>

      <!-- Menu Screen -->
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

          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading">
            <p>⏳ กำลังโหลด...</p>
          </div>

          <!-- Leaderboard -->
          <div *ngIf="!isLoading && leaderboard.length > 0" class="leaderboard-section">
            <h2>🏆 Leaderboard</h2>
            <div class="leaderboard-list">
              <div *ngFor="let entry of leaderboard; let i = index" class="leader-item">
                <span class="rank">{{i + 1}}. {{entry.player_name}}</span>
                <span class="score">{{entry.score}} pts</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            ⚠️ {{errorMessage}}
          </div>
        </div>
      </div>

      <!-- Playing Screen -->
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

      <!-- Game Over Screen -->
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
    .game-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .menu-screen, .gameover-screen, .login-required-screen {
      width: 100%;
      max-width: 600px;
    }

    .menu-card, .gameover-card, .login-required-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(18px);
      border-radius: 25px;
      padding: 40px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    h1 {
      font-size: 3.5rem;
      color: white;
      margin-bottom: 15px;
      font-weight: bold;
    }

    .subtitle {
      color: #fbbf24;
      font-size: 1.3rem;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .info-text {
      color: #ddd;
      font-size: 1.1rem;
      margin-bottom: 30px;
    }

    .start-btn, .restart-btn, .login-btn, .register-btn, .logout-btn {
      padding: 15px 40px;
      border: none;
      border-radius: 15px;
      font-size: 1.3rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
      margin: 10px;
      width: 100%;
      max-width: 300px;
    }

    .start-btn {
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
      color: white;
    }

    .login-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
    }

    .register-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      color: white;
    }

    .logout-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-size: 1rem;
      padding: 12px 30px;
    }

    .start-btn:hover, .restart-btn:hover, .login-btn:hover, .register-btn:hover, .logout-btn:hover {
      transform: scale(1.05);
    }

    .instructions {
      margin-top: 30px;
      color: #ddd;
    }

    .ins-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .loading, .saving-status {
      color: #60a5fa;
      font-size: 1.1rem;
      margin: 20px 0;
      animation: pulse 1.5s infinite;
    }

    .success-message {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 12px;
      border-radius: 10px;
      margin: 15px 0;
      font-weight: bold;
      border: 2px solid #10b981;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 12px;
      border-radius: 10px;
      margin: 15px 0;
      border: 2px solid #ef4444;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .game-screen {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }

    .game-area {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(18px);
      border-radius: 20px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .score-panel {
      text-align: center;
      margin-bottom: 15px;
    }

    .score-text {
      color: white;
      font-size: 1.8rem;
      font-weight: bold;
      margin: 5px 0;
    }

    .player-text {
      color: #ddd;
      font-size: 1rem;
    }

    canvas {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      display: block;
    }

    .side-leaderboard {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(18px);
      border-radius: 20px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      min-width: 300px;
    }

    .side-leaderboard h2, .leaderboard-section h2 {
      color: #fbbf24;
      font-size: 1.8rem;
      margin-bottom: 20px;
    }

    .leaderboard-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 25px;
      margin: 30px 0;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .leader-item {
      display: flex;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.1);
      padding: 12px 20px;
      border-radius: 10px;
      transition: background 0.2s;
    }

    .leader-item.highlight {
      background: rgba(16, 185, 129, 0.3);
      border: 2px solid #10b981;
      animation: highlight-pulse 2s infinite;
    }

    @keyframes highlight-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
      50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
    }

    .rank {
      color: white;
      font-weight: 600;
    }

    .score {
      color: #fbbf24;
      font-weight: bold;
    }

    .no-scores {
      color: #999;
      text-align: center;
      padding: 20px;
    }

    .gameover-title {
      color: #ef4444;
      font-size: 3rem;
    }

    .score-label {
      color: white;
      font-size: 1.5rem;
      margin: 20px 0 10px;
    }

    .final-score {
      color: #fbbf24;
      font-size: 4rem;
      font-weight: bold;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .game-screen {
        flex-direction: column;
        align-items: center;
      }
      
      .side-leaderboard {
        width: 100%;
        max-width: 400px;
      }
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

    const gameLoop = () => {
      if (this.gameState !== 'playing') {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        return;
      }

      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      // Clear canvas
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road
      ctx.fillStyle = '#404040';
      ctx.fillRect(50, 0, 300, canvas.height);

      // Draw road lines
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player movement
      if (this.game.keys['ArrowLeft'] && this.game.playerX > 60) {
        this.game.playerX -= 5;
      }
      if (this.game.keys['ArrowRight'] && this.game.playerX < 310) {
        this.game.playerX += 5;
      }

      // Draw player car
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(this.game.playerX, this.game.playerY, 40, 60);
      ctx.fillStyle = '#003300';
      ctx.fillRect(this.game.playerX + 5, this.game.playerY + 10, 30, 20);

      // Spawn obstacles
      obstacleTimer += delta;
      if (obstacleTimer > 1500) {
        const lanes = [70, 160, 250];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.game.obstacles.push({
          x: randomLane,
          y: -60,
          width: 40,
          height: 60
        });
        obstacleTimer = 0;
      }

      // Update and draw obstacles
      this.game.obstacles = this.game.obstacles.filter(obs => {
        obs.y += this.game.speed;

        // Draw obstacle car
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#330000';
        ctx.fillRect(obs.x + 5, obs.y + 30, 30, 20);

        // Check collision
        if (
          this.game.playerX < obs.x + obs.width &&
          this.game.playerX + 40 > obs.x &&
          this.game.playerY < obs.y + obs.height &&
          this.game.playerY + 60 > obs.y
        ) {
          this.endGame();
          return false;
        }

        // Score when passing obstacle
        if (obs.y > this.game.playerY + 60 && !obs.passed) {
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