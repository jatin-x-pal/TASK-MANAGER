# TaskFlow - Modern Project Management Platform

TaskFlow is a premium, high-performance project management workspace designed for seamless team collaboration and productivity tracking.

## 🚀 Features

- **Dynamic Dashboard**: Real-time productivity analytics, time-off tracking, and activity hubs.
- **Project Board**: Advanced task management with role-based access control (Admin vs. Member).
- **Intelligent Scheduling**: Fully synced calendar with meeting and event management.
- **Unified Messaging**: Private and project-based group chats with real-time updates.
- **Theme Engine**: Seamless Light and Dark mode synchronization.
- **Professional Profiles**: Customizable user identities with photo upload and preference management.

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & HttpOnly Cookies
- **Styling**: Vanilla CSS with Theme Variables
- **Icons**: Lucide React
- **Data Fetching**: SWR (Stale-While-Revalidate)

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jatin-x-pal/TASK-MANAGER.git
   cd TASK-MANAGER
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 🔒 Security

- Enforced HttpOnly cookies for session management.
- Role-based permissions for project and task management.
- Password hashing using Bcrypt.
- Protected API routes with middleware validation.

## 📄 License

This project is licensed under the MIT License.
