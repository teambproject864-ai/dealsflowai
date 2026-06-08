import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader3D } from "@/components/immersive/Loader3D";

export default function CustomerLoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader3D label="Loading login" />
          </div>
        }
      >
        <LoginForm role="customer" allowRegistration />
      </Suspense>
    </div>
  );
}
