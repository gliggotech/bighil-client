"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import AdminsTable from "./AdminsTable";
import useFetch from "@/custom hooks/useFetch";
import useAccessToken from "@/custom hooks/useAccessToken";
import { getBackendUrl } from "@/lib/getBackendUrl";
import { toast } from "@/hooks/use-toast";
import useNotificationStore from "@/store/notificationStore";
import AddAdminDialog from "./AddAdminDialog";

const AdminsManagement = () => {
  const { token } = useAccessToken();
  const { loading: isFetching, fetchData } = useFetch();
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const { userRole, userId } = useNotificationStore();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [ownRole, setOwnRole] = useState([]);
  const [otherRoles, setOtherRoles] = useState([]);

  // Fetch admins data
  useEffect(() => {
    if (!token) return; // Don't fetch until token is ready

    async function fetchAdmins() {
      setLoadingAdmins(true);
      try {
        const adminsListData = await fetchData(
          `${getBackendUrl()}/api/client-setting/get-all-admins`,
          "GET",
          {},
          token,
          false
        );

        if (adminsListData.success) {
          setOwnRole(
            adminsListData.data.filter((admin) => admin._id === userId)
          );
          setOtherRoles(
            adminsListData.data.filter((admin) => admin.role !== userRole)
          );
          setAdmins(adminsListData.data || adminsListData);
        } else {
          console.error("Failed to fetch admins:", adminsListData.message);
          toast({
            title: "Error",
            description: "Failed to fetch admins list.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch admins:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching admins.",
          variant: "destructive",
        });
      } finally {
        setLoadingAdmins(false);
      }
    }

    fetchAdmins();
  }, [token, fetchData, userRole]);

  // Handle edit admin
  const handleEditAdmin = async (adminId, updatedData) => {
    try {
      const response = await fetchData(
        `${getBackendUrl()}/api/client-setting/update-admin/${adminId}`,
        "PATCH",
        updatedData,
        token,
        false
      );

      if (response.success) {
        // Update the admin in the state
        setOtherRoles((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin._id === adminId ? { ...admin, ...updatedData } : admin
          )
        );
      } else {
        throw new Error(response.message || "Failed to update admin");
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the edit dialog
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId) => {
    try {
      const response = await fetchData(
        `${getBackendUrl()}/api/client-setting/delete-admin/${adminId}`,
        "DELETE",
        {},
        token,
        false
      );

      if (response.success) {
        // Remove the deleted admin from the state
        setOtherRoles((prevAdmins) =>
          prevAdmins.filter((admin) => admin._id !== adminId)
        );
        return;
      } else {
        throw new Error(response.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
      throw error; // Re-throw to be handled by the table component
    }
  };

  // Handle add new admin
  const handleAddAdmin = () => {
    setShowAddDialog(true);
  };
  const handleDisableAdmin = async (adminId, sendtoBackend) => {
    try {
      const response = await fetchData(
        `${getBackendUrl()}/api/client-setting/disable-admin/${adminId}`,
        "PATCH",
        {
          isDisable: sendtoBackend,
        },
        token,
        false
      );

      if (response.success) {
        setOtherRoles((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin._id === adminId
              ? { ...admin, disableStatus: sendtoBackend }
              : admin
          )
        );
      } else {
        throw new Error(response.message || "Failed to disable admin");
      }
    } catch (error) {
      console.error("Failed to disable admin:", error);
      throw error; // Re-throw to be handled by the table component
    }
  };
  const handleAddAdminSave = async (newAdminData) => {
    try {
      const response = await fetchData(
        `${getBackendUrl()}/api/client-setting/create-admin`,
        "POST",
        newAdminData,
        token,
        false
      );

      if (response.success) {
        // Add the new admin to the appropriate state based on role
        if (response.data.role === userRole) {
          setOwnRole((prevAdmins) => [...prevAdmins, response.data]);
        } else {
          setOtherRoles((prevAdmins) => [...prevAdmins, response.data]);
        }
        setAdmins((prevAdmins) => [...prevAdmins, response.data]);

        toast({
          title: "Success",
          description: `Admin ${newAdminData.name} has been created successfully.`,
          variant: "success",
        });
        setShowAddDialog(false);
      } else {
        throw new Error(response.message || "Failed to create admin");
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  // Add this function to handle closing the add dialog
  const handleAddAdminClose = () => {
    setShowAddDialog(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-none shadow-lg border-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-text_color dark:text-white p-0">
              Your Access
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AdminsTable
          admins={ownRole}
          onEdit={handleEditAdmin}
          onDelete={handleDeleteAdmin}
          loading={loadingAdmins}
          hideAction={true}
        />
      </CardContent>
      {userRole != "SUB ADMIN" && (
        <div className="">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-text_color dark:text-white">
                  Admin Management
                </CardTitle>
                <CardDescription className="text-gray-900 dark:text-gray-400">
                  Manage admins and their permissions.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="bg-primary dark:bg-gray-700 text-white dark:text-white hover:bg-primary/90 dark:hover:bg-gray-600"
                onClick={handleAddAdmin}
              >
                <Plus className=" h-4 w-4" />
                Add Admin
                {loadingAdmins && (
                  <Loader2 className="animate-spin h-4 w-4 ml-2 text-blue" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AdminsTable
              admins={otherRoles}
              onEdit={handleEditAdmin}
              onDelete={handleDeleteAdmin}
              loading={loadingAdmins}
              userRole={userRole}
              handleDisable={handleDisableAdmin}
              addAdmin={handleAddAdmin}
            />
          </CardContent>
        </div>
      )}
      <AddAdminDialog
        open={showAddDialog}
        onClose={handleAddAdminClose}
        onSave={handleAddAdminSave}
      />
    </Card>
  );
};

export default AdminsManagement;
