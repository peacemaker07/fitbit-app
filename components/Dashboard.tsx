"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface ActivityData {
  summary?: {
    steps?: number;
    floors?: number;
    caloriesOut?: number;
    distances?: Array<{ distance: number }>;
  };
}

interface HeartData {
  "activities-heart"?: Array<{
    value?: {
      restingHeartRate?: number;
    };
  }>;
}

interface SleepData {
  summary?: {
    totalMinutesAsleep?: number;
    totalTimeInBed?: number;
  };
}

interface ProfileData {
  user?: {
    displayName?: string;
    avatar?: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [heartData, setHeartData] = useState<HeartData | null>(null);
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchFitbitData();
    }
  }, [session]);

  const fetchFitbitData = async () => {
    setLoading(true);
    try {
      const [activity, heart, sleep, profile] = await Promise.all([
        fetch("/api/fitbit/activity").then((r) => r.json()),
        fetch("/api/fitbit/heart").then((r) => r.json()),
        fetch("/api/fitbit/sleep").then((r) => r.json()),
        fetch("/api/fitbit/profile").then((r) => r.json()),
      ]);

      setActivityData(activity);
      setHeartData(heart);
      setSleepData(sleep);
      setProfileData(profile);
    } catch (error) {
      console.error("Error fetching Fitbit data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Fitbit Dashboard
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Fitbitアカウントでログインして、あなたの健康データを確認しましょう
          </p>
          <button
            onClick={() => signIn("fitbit")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Fitbitでログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {profileData?.user?.avatar && (
                <img
                  src={profileData.user.avatar}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {profileData?.user?.displayName || "ユーザー"}さんのダッシュボード
                </h1>
                <p className="text-gray-600">今日のデータ</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">データを読み込み中...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 歩数カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">歩数</h2>
                <span className="text-3xl">👟</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {activityData?.summary?.steps?.toLocaleString() || "0"}
              </p>
              <p className="text-gray-500 mt-2">歩</p>
            </div>

            {/* カロリーカード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  消費カロリー
                </h2>
                <span className="text-3xl">🔥</span>
              </div>
              <p className="text-4xl font-bold text-orange-600">
                {activityData?.summary?.caloriesOut?.toLocaleString() || "0"}
              </p>
              <p className="text-gray-500 mt-2">kcal</p>
            </div>

            {/* 距離カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">移動距離</h2>
                <span className="text-3xl">📍</span>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {activityData?.summary?.distances?.[0]?.distance?.toFixed(2) ||
                  "0"}
              </p>
              <p className="text-gray-500 mt-2">km</p>
            </div>

            {/* 階段カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">階段</h2>
                <span className="text-3xl">🪜</span>
              </div>
              <p className="text-4xl font-bold text-purple-600">
                {activityData?.summary?.floors || "0"}
              </p>
              <p className="text-gray-500 mt-2">階</p>
            </div>

            {/* 心拍数カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  安静時心拍数
                </h2>
                <span className="text-3xl">❤️</span>
              </div>
              <p className="text-4xl font-bold text-red-600">
                {heartData?.["activities-heart"]?.[0]?.value
                  ?.restingHeartRate || "N/A"}
              </p>
              <p className="text-gray-500 mt-2">bpm</p>
            </div>

            {/* 睡眠カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">睡眠時間</h2>
                <span className="text-3xl">😴</span>
              </div>
              <p className="text-4xl font-bold text-indigo-600">
                {sleepData?.summary?.totalMinutesAsleep
                  ? Math.floor(sleepData.summary.totalMinutesAsleep / 60)
                  : "0"}
                <span className="text-2xl">h</span>{" "}
                {sleepData?.summary?.totalMinutesAsleep
                  ? sleepData.summary.totalMinutesAsleep % 60
                  : "0"}
                <span className="text-2xl">m</span>
              </p>
              <p className="text-gray-500 mt-2">睡眠</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={fetchFitbitData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
          >
            データを更新
          </button>
        </div>
      </div>
    </div>
  );
}
