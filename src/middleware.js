import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/giris' || path === '/kayit' || path === '/';
  
  // Çerezlerden token'ı al
  const token = request.cookies.get('token')?.value || '';
  
  // Eğer kullanıcı oturum açmamışsa ve korumalı bir sayfaya erişmeye çalışıyorsa
  if (!token && !isPublicPath) {
    // Giriş sayfasına yönlendir
    return NextResponse.redirect(new URL('/giris', request.url));
  }
  
  // Eğer kullanıcı zaten oturum açmışsa ve giriş/kayıt sayfalarına gidiyorsa
  if (token && (path === '/giris' || path === '/kayit')) {
    // Ana sayfaya yönlendir
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  // Diğer tüm durumlar için normal işleme izin ver
  return NextResponse.next();
}

// Middleware'in uygulanacağı yollar
export const config = {
  matcher: [
    '/giris',
    '/kayit',
    '/chat/:path*',
    '/profil',
    '/ayarlar',
  ],
}; 