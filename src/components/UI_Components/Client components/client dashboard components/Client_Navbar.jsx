"use client";
import { useState } from "react";
import { clientLogout } from "@/app/actions/client.actions";
import useNotificationStore from "@/store/notificationStore";
import { LogOut, AlertCircle, Menu, X, ChevronRight } from "lucide-react";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdvancedStyledDropdown from "../../Standard_Components/AdvancedStyledDropdown";
import Image from "next/image";
import Link from "next/link";

const Client_Navbar = ({ isOpen }) => {
  const { userRole, preferredRoleName } = useNotificationStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogOut = async () => {
    try {
      setLoading(true);

      // Small delay to ensure dropdown closes before clearing store
      setTimeout(async () => {
        const res = await clientLogout();
        if (res.success) {
          useNotificationStore.setState({
            userId: null,
            userRole: null,
            notificationCount: 0,
            notifications: [],
            lastSync: null,
            preferredRoleName: null,
          });
          setError(null);
          setLoading(false);
          router.push("/");
        } else {
          setError(res.message || "Logout failed. Please try again.");
          setLoading(false);
        }
      }, 100); // 100ms delay
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const dismissError = () => {
    setError(null);
  };
  console.log(preferredRoleName);

  return (
    <div>
      {/* Main Navbar */}
      <div
        className={`w-full overflow-hidden bg-white shadow-md  px-11 sm:px-10 transition-all duration-200
    ${isOpen ? "ml-[240px]" : "ml-[30px] md:ml-[45px]"}
    min-h-16 sm:min-h-16 md:min-h-16 lg:min-h-14 xl:min-h-16
  `}
      >
        <div>
          <div className=" px-4 sm:px-6">
            <div className="h-16 md:h-20 flex items-center justify-between">
              {/* Left Section: Logo & Mobile Menu */}
              <div className="flex-shrink-0 flex items-center h-full">
                <Link
                  href="/client/client-dashboard"
                  className="flex items-center h-full py-2"
                >
                  <div className="relative h-20 ">
                    <Image
                      src="/b10.svg"
                      width={240}
                      height={50}
                      alt="logo"
                      quality={100}
                      className="h-full w-auto object-cover  "
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Right Section: User Info & Actions */}
              <div className="flex items-center space-x-1">
                <h1>
                  {preferredRoleName != null ? preferredRoleName : userRole}
                </h1>

                <AdvancedStyledDropdown
                  handleLogOut={handleLogOut}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="absolute top-full left-0 right-0 px-4 pt-3 ">
          <Alert
            variant="destructive"
            className="max-w-md mx-auto animate-slide-down"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={dismissError}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Client_Navbar;
