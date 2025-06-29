"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut, Settings, List, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import useNotificationStore from "@/store/notificationStore";
import { getRoleTitle } from "@/utils/roleTitleHelper";

const AdvancedStyledDropdown = ({ handleLogOut, loading, error }) => {
  const [open, setOpen] = useState(false);
  const { userName, userRole, userEmail, preferredRoleName } =
    useNotificationStore();

  // Store the role locally to prevent showing "unknown" during logout
  const [currentRole, setCurrentRole] = useState(userRole);
  const [currentUserName, setCurrentUserName] = useState(userName);

  // Update local state when store changes, but only if not logging out
  useEffect(() => {
    if (!loading && userRole) {
      setCurrentRole(userRole);
    }
    if (!loading && userName) {
      setCurrentUserName(userName);
    }
  }, [userRole, userName, loading]);

  const title = getRoleTitle(preferredRoleName || currentRole);

  const RoleTitle = ({ role, title }) => {
    const getRoleStyle = (role) => {
      switch (role) {
        case "SUPER ADMIN":
          return "bg-primary text-white";
        case "SUB ADMIN":
          return "bg-blue text-white";
        case "ADMIN":
          return "bg-yellow text-white";
        case "user":
          return "bg-gray text-white";
        default:
          return "bg-sky-500 text-black";
      }
    };

    const getRoleIcon = (role) => {
      switch (role) {
        case "SUPER ADMIN":
          return "👑"; // Crown
        case "SUB ADMIN":
          return "🛡️"; // Shield
        case "ADMIN":
          return "⚙️"; // Gear
        case "user":
          return "👤"; // User
        default:
          return "🛡️"; // Question mark
      }
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{getRoleIcon(role)}</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleStyle(
            role
          )} shadow-sm`}
        >
          {title}
        </span>
      </div>
    );
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const handleLogoutClick = async () => {
    closeDropdown();
    await handleLogOut();
    return;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary hover:bg-primary/90 active:bg-primary/80 p-2 rounded-full focus:outline-none transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
        <User className="text-white h-5 w-5" />
      </DropdownMenuTrigger>
      <div className="hidden md:block pl-1">
        Welcome, <span className="text-primary">{currentUserName}</span>
      </div>
      <DropdownMenuContent className="w-72 flex flex-col space-y-3 bg-white text-text_color shadow-xl border border-dialog_inside_border_color rounded-lg overflow-hidden p-1  animate-slideDownAndFade">
        {!loading && (
          <div className="">
            <div className="flex flex-col px-5 space-y-1 mt-3">
              <div className="text-sm font-medium text-text_color">
                {currentUserName}
              </div>

              <RoleTitle
                role={preferredRoleName || currentRole}
                title={title}
              />
            </div>
            <DropdownMenuSeparator className="bg-primary/10" />
            <DropdownMenuItem asChild>
              <Link
                href={
                  currentRole == "user"
                    ? "/user/user-myAccount"
                    : "/client/client-myAccount"
                }
                className="cursor-pointer hover:bg-primary/10 hover:text-text_color transition-all duration-200 py-2 px-3 rounded-md flex items-center gap-2 group"
              >
                <User className="h-4 w-4 text-text_color group-hover:text-text_color transition-colors duration-200" />
                My Account
              </Link>
            </DropdownMenuItem>
            {(currentRole === "ADMIN" ||
              currentRole === "SUB ADMIN" ||
              currentRole === "SUPER ADMIN") && (
              <DropdownMenuItem asChild>
                <Link
                  href="/client/client-setting"
                  className="cursor-pointer hover:bg-primary/10 hover:text-text_color transition-all duration-200 py-2 px-3 rounded-md flex items-center gap-2 group"
                >
                  <Settings className="h-4 w-4 text-text_color group-hover:text-text_color transition-colors duration-200" />
                  Settings
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-dialog_inside_border_color" />

            {currentRole === "user" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/user/delete-myAccount"
                  className="cursor-pointer hover:bg-primary/10 hover:text-text_color transition-all duration-200 py-2 px-3 rounded-md flex items-center gap-2 group"
                >
                  <Trash className="h-4 w-4 text-red group-hover:text-red transition-colors duration-200" />
                  Delete Account
                </Link>
              </DropdownMenuItem>
            )}
          </div>
        )}

        <div className="px-1 py-1">
          <Button
            onClick={handleLogoutClick}
            disabled={loading}
            variant="ghost"
            size="sm"
            className={`w-full text-left group justify-start bg-gray/10 hover:bg-red/90 text-red hover:text-white transition-colors duration-300 rounded-md px-3 py-2
                ${loading ? "opacity-70 cursor-not-allowed" : ""}
                flex items-center space-x-2
              `}
          >
            <LogOut
              className={`h-4 w-4 text-red group-hover:text-white ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span>{loading ? "Logging Out..." : "Logout"}</span>
          </Button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1 px-3">{error}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdvancedStyledDropdown;
