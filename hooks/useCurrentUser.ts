"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to fetch user data");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetchUser: fetchUser };
}
