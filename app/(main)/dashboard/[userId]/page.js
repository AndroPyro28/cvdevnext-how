"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import styles from "./page.module.css";
// styles
import dashboard from "./dashboard.module.css";
import { useQueryProcessor } from "@/hooks/useTanstackQuery";
import { formatToDecimal } from "@/lib/numberFormatter";
import Image from "next/image";
import axios from "axios";
import { cn } from "@/lib/utils";
import Link from "next/link";

// assets

export default function Dashboard({ params }) {
  const { data: session, status } = useSession();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [initialDateTime, setInitialDateTime] = useState(null); // Store initial time from server
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const userId = params?.userId;
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchPropertiesAndUserData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/header/${userId}`,
          {}
        );

        if (userResponse.status != 200) {
          throw new Error("Failed to fetch data.");
        }
        const userData = userResponse.data;

        setUserData(userData);
      } catch (error) {
        console.error("Error:", error.message);
        setError("Failed to load properties or user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertiesAndUserData();
  }, [userId]);

  useEffect(() => {
    // Set initial date and time when authenticated
    if (status === "authenticated") {
      setDate(DateTime.now().toLocaleString(DateTime.DATE_HUGE));
      setTime(DateTime.now().toLocaleString(DateTime.TIME_SIMPLE));
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      // Determine the API URL based on the environment
      let apiUrl = "http://localhost:8080"; // Default to localhost if no environment variable is set

      if (process.env.NEXT_PUBLIC_URL_DEF === "test") {
        apiUrl = process.env.NEXT_PUBLIC_URL_TEST;
      } else if (process.env.NEXT_PUBLIC_URL_DEF === "dev") {
        apiUrl = process.env.NEXT_PUBLIC_URL_DEV;
      } else if (process.env.NEXT_PUBLIC_URL_DEF === "production") {
        apiUrl = process.env.NEXT_PUBLIC_URL_PROD;
      }

      // Fetch data from the server
      fetch(`${apiUrl}/api/datetime`)
        .then((response) => response.json())
        .then((data) => {
          const serverDateTime = DateTime.fromISO(data.datetime); // Parse the datetime from the server
          setInitialDateTime(serverDateTime); // Store the initial server datetime
          setDate(serverDateTime.toLocaleString(DateTime.DATE_HUGE)); // Set the date
          setTime(serverDateTime.toLocaleString(DateTime.TIME_SIMPLE)); // Set the initial time
        })
        .catch((error) => {
          console.error("Error fetching date and time:", error);
        });
    }
  }, [status]);

  useEffect(() => {
    // Only start real-time updates if initialDateTime has been set
    if (!initialDateTime) return;

    // Update the time every 10 seconds
    const interval = setInterval(() => {
      const updatedDateTime = initialDateTime.plus({ seconds: 10 }); // Add 10 seconds to initial time
      setTime(updatedDateTime.toLocaleString(DateTime.TIME_SIMPLE)); // Update the time
      setInitialDateTime(updatedDateTime); // Update the initial time reference
    }, 10000); // Run every 10 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [initialDateTime]);

  const { data, status: dashboardStatus } = useQueryProcessor({
    url: `/home-owner/dashboard`,
    key: ["dashboard", "home-owner"],
    queryParams: {
      userId: userId,
    },
    options: {
      enabled: typeof userId != "undefined",
    },
  });

  const { data: transactionData, status: transactionStatus } =
    useQueryProcessor({
      url: `/transaction`,
      key: ["transactions"],
      queryParams: {
        userId: userId,
      },
      options: {
        enabled: typeof userId != "undefined",
      },
    });

  const handleLogout = () => {
    // Clear user session data
    // Redirect to login page
    signOut();
    router.push("/");
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Show a loading state while authentication is being checked
  if (
    status === "loading" ||
    dashboardStatus === "pending" ||
    transactionStatus === "pending"
  ) {
    return <p>Loading...</p>;
  }

  const { initialAmounts, billsHaveBeenPaid } = data?.billSummary;
  const totalDues = initialAmounts.total - billsHaveBeenPaid.total;
  const waterDues = initialAmounts.water - billsHaveBeenPaid.water;
  const garbageDues = initialAmounts.garbage - billsHaveBeenPaid.garbage;
  const hoaDues = initialAmounts.hoa - billsHaveBeenPaid.hoa;

  // The user should be authenticated at this point
  // You can proceed to render the dashboard UI
  return (
    <div className="ml-[200px] mt-20 px-10 justify-center flex flex-col items-center">
      <header className={styles.properties_header}>
        <h2>Dashboard</h2>
        {userData && (
          <div className={styles.profile} onClick={toggleDropdown}>
            <div className={styles.profile_pic}>
              <Image
                src="/cvprofile_default.jpg"
                alt="Profile"
                width={40}
                height={40}
              />
            </div>
            <div className={styles.profile_name}>
              {userData.userFirstName} {userData.userLastName}
            </div>
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <ul>
                  <li>
                    <Link href={`/profile/${userId}`}>Profile</Link>
                  </li>
                  <li onClick={handleLogout}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </header>

      <div className={dashboard.main_content_container}>
        <div className={dashboard.main_hero_container}>
          <h3 className={dashboard.hero_head}>
            <span className="font-bold text-3xl">
              Welcome {session.user.username}!
            </span>
          </h3>
          <span className="font-bold">
            <h6 className={dashboard.hero_info}>
              {date} | {time}
            </h6>
          </span>
        </div>

        <div className={dashboard.main_content_row_div}>
          <div className={dashboard.main_list_div}>
            <h6 className={dashboard.list_head}>
              {" "}
              <span className="font-bold">Remaining Dues</span>
            </h6>

            <div className="flex flex-col px-10 ">
              <div className="flex justify-between mb-5">
                <span className="font-semibold">Total Dues</span>
                <strong className="text-red-600">{totalDues.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="font-light">Homeowner association</span>
                <strong className="">{hoaDues.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="font-light">Water usage</span>
                <strong className="">{waterDues.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="font-light">Garbage collection</span>
                <strong className="">{garbageDues.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className={dashboard.main_stats_div}>
            <h6 className={dashboard.stats_head}>
              {" "}
              <span className="font-bold">Wallet Balance</span>
            </h6>
            <div className={dashboard.stats_info_div}>
              <h3 className={dashboard.stats_info + ``}>
                {" "}
                <span className="text-2xl font-semibold">
                  {formatToDecimal(data?.wallet?.wall_bal || "0")}
                </span>
              </h3>
            </div>
          </div>
        </div>

        <div className="font-semibold text-2xl p-5">Transactions</div>

        <div className="flex flex-col space-y-2">
          {transactionData?.length > 0 &&
            transactionData.map((transaction) => (
              <div className="flex justify-evenly items-center px-5 py-2 rounded-[25px] bg-white">
                <span className="font-semibold flex-1">{transaction?.trn_id}</span>
                <span className={cn(
                  "flex-1 flex justify-start",
                 )}><span className={cn(
                  transaction?.trn_status == "pending" && "bg-yellow-500 px-5 py-1 rounded-[25px] text-white", 
                  transaction?.trn_status == "completed" && "bg-green-500 px-5 py-1 rounded-[25px] text-white", 
                )}>{transaction?.trn_status}</span></span>
                <span className="flex-1 flex justify-start font-semibold">{transaction?.trn_method}</span>
                <button className="px-5 py-2 bg-[#2b2d42] text-white rounded-[25px]">View Transaction</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
