"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getUserById, getCurrentUser, updateUser } from "@/services/api";
import type { User } from "@/lib/types";

interface EditUserClientProps {
  userId: string;
}

export function EditUserClient({ userId }: EditUserClientProps) {
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = React.useState<User["role"]>("user");
  const [loading, setLoading] = React.useState(true);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"user" | "super_admin">("user");
  const [status, setStatus] = React.useState<"Active" | "Disabled">("Active");
  const [canCreateProject, setCanCreateProject] = React.useState(true);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUser, currentUser] = await Promise.all([
          getUserById(userId),
          getCurrentUser(),
        ]);

        setUser(fetchedUser);
        setFullName(fetchedUser.name);
        setEmail(fetchedUser.email);
        setRole(fetchedUser.role);
        setStatus(fetchedUser.status);
        setCanCreateProject(fetchedUser.canCreateProject ?? true);
        setCurrentUserRole(currentUser.role);
      } catch (err) {
        toast({
          title: "Error loading user",
          description: "Could not load user data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleUpdateUser = async () => {
    try {
      setIsSaving(true);
      await updateUser(userId, {
        name: fullName,
        email,
        role,
        status,
        canCreateProject,
      });

      toast({
        title: "User Updated",
        description: `${fullName}'s details have been saved.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill out both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please ensure the new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (currentUserRole !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only Super Admins can change passwords.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updateUser(userId, { password: newPassword });

      toast({
        title: "Password Updated",
        description: "The password has been successfully changed.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Update the user's information and role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as User["role"])}
                disabled={isSaving}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Access</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="canCreateProject"
                    value="true"
                    checked={canCreateProject === true}
                    onChange={() => setCanCreateProject(true)}
                    disabled={isSaving}
                  />
                  <span className="text-sm font-medium">User can create project</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="canCreateProject"
                    value="false"
                    checked={canCreateProject === false}
                    onChange={() => setCanCreateProject(false)}
                    disabled={isSaving}
                  />
                  <span className="text-sm font-medium">User cannot create project</span>
                </label>
              </div>
            </div>
          </div>

          <Button onClick={handleUpdateUser} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {currentUserRole?.toLowerCase?.() === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>
              As a Super Admin, you can directly change this user's password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
              {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
