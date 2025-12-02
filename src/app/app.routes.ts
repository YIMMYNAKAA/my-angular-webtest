import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent }, // หน้าเข้าสู่ระบบ
    { path: 'register', component: RegisterComponent }, // เส้นทางสำหรับลงทะเบียน
    { path: '**', redirectTo: '' }                // เส้นทางอื่น ๆ ให้กลับไปหน้าหลัก
];