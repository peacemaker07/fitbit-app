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
  activities?: Array<{
    dateTime: string;
    value: {
      steps?: number;
      floors?: number;
      caloriesOut?: number;
      distances?: Array<{ distance: number }>;
    };
  }>;
}

interface HeartData {
  "activities-heart"?: Array<{
    dateTime: string;
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
  sleep?: Array<{
    dateOfSleep: string;
    duration?: number;
    minutesAsleep?: number;
    minutesAwake?: number;
  }>;
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchFitbitData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      let queryParams = "";
      if (start && end) {
        queryParams = `?startDate=${start}&endDate=${end}`;
      } else if (start) {
        queryParams = `?startDate=${start}`;
      }
      
      const [activity, heart, sleep, profile] = await Promise.all([
        fetch(`/api/fitbit/activity${queryParams}`).then((r) => r.json()),
        fetch(`/api/fitbit/heart${queryParams}`).then((r) => r.json()),
        fetch(`/api/fitbit/sleep${queryParams}`).then((r) => r.json()),
        fetch("/api/fitbit/profile").then((r) => r.json()),
      ]);

      setActivityData(activity);
      setHeartData(heart);
      setSleepData(sleep);
      setProfileData(profile);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching Fitbit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSearch = () => {
    if (startDate && endDate) {
      fetchFitbitData(startDate, endDate);
    } else if (startDate) {
      fetchFitbitData(startDate);
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
                <p className="text-gray-600">
                  {startDate && endDate
                    ? startDate === endDate
                      ? `${startDate}のデータ`
                      : `${startDate} 〜 ${endDate}のデータ`
                    : "データ未取得"}
                </p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    最終更新: {lastUpdated.toLocaleString("ja-JP")}
                  </p>
                )}
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
        ) : !activityData && !heartData && !sleepData ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-xl text-gray-600 mb-2">データが表示されていません</div>
            <p className="text-gray-500">日付を選択して「データを取得」ボタンをクリックしてください</p>
          </div>
        ) : startDate !== endDate && (heartData?.["activities-heart"] || []).length > 1 ? (
          // 複数日のデータを表示
          <div className="space-y-6">
            {/* 日別データテーブル */}
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">期間データ一覧</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">日付</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">歩数</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">カロリー</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">距離(km)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">階段</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">心拍数</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">睡眠(分)</th>
                  </tr>
                </thead>
                <tbody>
                  {(heartData?.["activities-heart"] || []).map((heart, index) => {
                    const date = heart.dateTime;
                    const sleepForDate = sleepData?.sleep?.find(s => s.dateOfSleep === date);
                    
                    return (
                      <tr key={date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{date}</td>
                        <td className="text-right py-3 px-4 text-gray-800">-</td>
                        <td className="text-right py-3 px-4 text-gray-800">-</td>
                        <td className="text-right py-3 px-4 text-gray-800">-</td>
                        <td className="text-right py-3 px-4 text-gray-800">-</td>
                        <td className="text-right py-3 px-4 text-gray-800">
                          {heart.value?.restingHeartRate || "-"}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-800">
                          {sleepForDate?.minutesAsleep || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 期間合計サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">期間内データ数</h2>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  {(heartData?.["activities-heart"] || []).length}
                </p>
                <p className="text-gray-500 mt-2">日分のデータ</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">平均心拍数</h2>
                  <span className="text-3xl">❤️</span>
                </div>
                <p className="text-4xl font-bold text-red-600">
                  {(() => {
                    const hearts = heartData?.["activities-heart"]?.filter(h => h.value?.restingHeartRate) || [];
                    if (hearts.length === 0) return "N/A";
                    const avg = hearts.reduce((sum, h) => sum + (h.value?.restingHeartRate || 0), 0) / hearts.length;
                    return Math.round(avg);
                  })()}
                </p>
                <p className="text-gray-500 mt-2">bpm (平均)</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">平均睡眠時間</h2>
                  <span className="text-3xl">😴</span>
                </div>
                <p className="text-4xl font-bold text-indigo-600">
                  {(() => {
                    const sleeps = sleepData?.sleep?.filter(s => s.minutesAsleep) || [];
                    if (sleeps.length === 0) return "N/A";
                    const avgMinutes = sleeps.reduce((sum, s) => sum + (s.minutesAsleep || 0), 0) / sleeps.length;
                    const hours = Math.floor(avgMinutes / 60);
                    const mins = Math.round(avgMinutes % 60);
                    return `${hours}h ${mins}m`;
                  })()}
                </p>
                <p className="text-gray-500 mt-2">平均</p>
              </div>
            </div>
          </div>
        ) : (
          // 単一日のデータを表示
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

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            期間を指定してデータを取得
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日 (From)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日 (To)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleDateSearch}
              disabled={loading || !startDate || !endDate}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 whitespace-nowrap"
            >
              データを取得
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setStartDate(today);
                setEndDate(today);
                fetchFitbitData(today, today);
              }}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 whitespace-nowrap"
            >
              今日のデータ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
