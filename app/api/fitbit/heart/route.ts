import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    let url: string;
    if (startDate && endDate) {
      // 期間データを取得
      url = `https://api.fitbit.com/1/user/-/activities/heart/date/${startDate}/${endDate}.json`;
    } else {
      // 単一日のデータを取得
      const date = startDate || new Date().toISOString().split("T")[0];
      url = `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`;
    }
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch heart rate data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch heart rate data" },
      { status: 500 }
    );
  }
}
