import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineChat, HiOutlineUserGroup, HiOutlineLightningBolt } from 'react-icons/hi';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height))]">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Bölümü */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
          <div className="lg:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">DockerChat ile Gerçek Zamanlı Mesajlaşma</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Docker üzerinde çalışan modern ve güvenli bir mesajlaşma uygulaması. Kişisel veya grup mesajlaşmaları ile anlık iletişim kurun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/giris" className="btn btn-primary">
                Hemen Başla
              </Link>
              <Link href="/kayit" className="btn btn-secondary">
                Kayıt Ol
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <Image 
              src="/logo.svg" 
              alt="DockerChat Logo"
              width={300} 
              height={300}
              className="animate-float"
              priority
            />
          </div>
        </div>

        {/* Özellikler */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Öne Çıkan Özellikler</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
              <div className="text-primary mb-4">
                <HiOutlineChat size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Özel Mesajlaşma</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Arkadaşlarınızla güvenli ve anlık özel mesajlaşma özelliği ile iletişim kurun.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
              <div className="text-primary mb-4">
                <HiOutlineUserGroup size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Grup Sohbetleri</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ekip arkadaşlarınızla veya arkadaş gruplarınızla grup sohbetleri oluşturun.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
              <div className="text-primary mb-4">
                <HiOutlineLightningBolt size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gerçek Zamanlı</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Socket.IO ile güçlendirilmiş gerçek zamanlı mesajlaşma ve bildirimler.
              </p>
            </div>
          </div>
        </div>

        {/* Test Hesapları */}
        <div className="bg-white dark:bg-[var(--card-bg)] p-8 rounded-lg shadow-md border border-[var(--border-color)] text-center mb-16">
          <h2 className="text-2xl font-bold mb-6">Hemen Test Edin</h2>
          <p className="text-lg mb-6">
            Aşağıdaki test hesaplarından birini kullanarak hemen uygulamayı deneyebilirsiniz.
          </p>
          
          <div className="max-w-md mx-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-left">
            <p className="mb-2"><span className="font-semibold">Kullanıcı Adı:</span> admin, user1, user2, user3</p>
            <p><span className="font-semibold">Şifre:</span> 123456</p>
          </div>
          
          <Link href="/giris" className="btn btn-primary">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
