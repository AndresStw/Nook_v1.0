import { useEffect, useState } from "react";
import { calculateCompletion } from "../lib/profileCompletion";

export function useProfileCompletion(userId, isOnboardingComplete, isFounder) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Escuchar el evento global
  useEffect(() => {
    const handleRefresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("refresh-completion", handleRefresh);
    return () =>
      window.removeEventListener("refresh-completion", handleRefresh);
  }, []);

  useEffect(() => {
    if (!userId || isFounder) {
      setData(null);
      setLoading(false);
      return;
    }

    if (isOnboardingComplete === false) {
      setData({ percent: 0, isComplete: false });
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    calculateCompletion(userId).then((result) => {
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [userId, isOnboardingComplete, isFounder, refreshKey]);

  return {
    percent: data?.percent ?? 0,
    isComplete: data?.isComplete ?? false,
    photosCount: data?.photosCount ?? 0,
    interestsCount: data?.interestsCount ?? 0,
    questionsCount: data?.questionsCount ?? 0,
    basicFilled: data?.basicFilled ?? 0,
    loading,
  };
}
