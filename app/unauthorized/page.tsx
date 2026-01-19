"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="unauth-container">
      <div className="card">
        <div className="lock">🔒</div>

        <h1>403</h1>
        <h2>Access Denied</h2>

        <p>
          You don’t have permission to access this page.
          <br />
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="actions">
          <button onClick={() => router.back()}>Go Back</button>
          <button className="primary" onClick={() => router.push("/login")}>
            Login Again
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .unauth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          animation: bgMove 8s ease infinite;
        }

        @keyframes bgMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .card {
          background: #ffffff;
          padding: 40px;
          border-radius: 16px;
          width: 420px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.8s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lock {
          font-size: 48px;
          animation: shake 2s infinite;
        }

        @keyframes shake {
          0%,
          100% {
            transform: rotate(0);
          }
          25% {
            transform: rotate(-8deg);
          }
          75% {
            transform: rotate(8deg);
          }
        }

        h1 {
          font-size: 64px;
          margin: 10px 0;
          color: #ff4d4f;
        }

        h2 {
          margin: 0;
          font-size: 22px;
          color: #333;
        }

        p {
          margin-top: 12px;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .actions {
          margin-top: 28px;
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        button {
          padding: 10px 18px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        button:hover {
          transform: translateY(-1px);
          border-color: #888;
        }

        .primary {
          background: #2c5364;
          color: white;
          border: none;
        }

        .primary:hover {
          background: #203a43;
        }
      `}</style>
    </div>
  );
}
