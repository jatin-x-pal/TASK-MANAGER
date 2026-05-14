import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'TaskFlow | Collaborative Task Management',
  description: 'Organize projects, assign tasks, and track progress effectively.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="chroma-grid"></div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
