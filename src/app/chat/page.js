import { Suspense } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';

export const metadata = {
  title: 'Sohbet - DockerChat',
  description: 'DockerChat ile gerçek zamanlı mesajlaşma',
};

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-var(--header-height))]">
      <Suspense fallback={<ChatLoading />}>
        <ChatWindow />
      </Suspense>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );
} 