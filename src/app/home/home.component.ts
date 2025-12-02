import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h2>ยินดีต้อนรับสู่ เมนูอาหารสุดพิเศษ</h2>
      <p>ค้นพบสูตรอาหารใหม่ๆ และแรงบันดาลใจในการทำอาหาร</p>

      <div class="slideshow-container">
        @for (slide of slides; track slide.caption; let i = $index) {
          <div class="slide" [class.active]="i === currentIndex">
            <img [src]="slide.url" [alt]="slide.caption">
            <div class="caption">{{ slide.caption }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      text-align: center;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h2 {
      color: #d9534f;
      margin-bottom: 0.5rem;
    }
    p {
      color: #555;
      margin-bottom: 2rem;
    }
    .slideshow-container {
      position: relative;
      width: 100%;
      max-width: 800px;
      margin: auto;
      overflow: hidden;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .slide {
      display: none;
      transition: opacity 1s ease-in-out;
      opacity: 0;
      position: absolute;
      width: 100%;
    }
    .slide.active {
      display: block;
      position: relative;
      opacity: 1;
    }
    .slide img {
      width: 100%;
      height: auto;
      max-height: 450px;
      object-fit: cover;
      display: block;
    }
    .caption {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 15px;
      font-size: 1.2rem;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }
  `]
})
export class HomeComponent implements OnInit {
  title = 'เมนูเด็ดจากทั่วโลก';
  
  slides = [
    { url: 'assets/slide1.jpg', caption: 'อาหารไทยรสจัดจ้าน' },
    { url: 'assets/slide2.jpg', caption: 'อาหารญี่ปุ่นแสนอร่อย' },
    { url: 'assets/slide3.jpg', caption: 'อาหารอิตาเลียนคลาสสิก' }
  ];
  
  currentIndex = 0;
  
  ngOnInit() {
    this.startSlideShow();
  }
  
  // เปลี่ยนสไลด์ทุก 5 วินาที
  startSlideShow() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, 5000);
  }
}