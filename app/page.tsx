"use client";
import Footer from "@/components/Footer";
import Main from "@/components/Main";
import Sidebar from "@/components/SideBar";
import Website from "@/components/Website";
import Link from "next/link";
import { useState } from "react";
import SplitPane from "react-split-pane";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [apiData, setApiData] = useState(null);

  const handleSearchQueryChange = (query: any) => {
    setSearchQuery(query);
  };

  const handleDataReceived = (data: any) => {
    setApiData(data);
  };

  console.log(searchQuery);
  console.log(apiData);

  return (
    <main>
      <div>
        <div className="flex h-screen">
          <aside className="w-64  text-white">
            <Sidebar />
          </aside>

          <main className="flex flex-col flex-1 h-full w-full  justify-between p-4">
            <Main apiData={apiData} />
            <Footer
              onDataReceived={handleDataReceived}
              onSearchQueryChange={handleSearchQueryChange}
            />
          </main>
        </div>
      </div>
    </main>
  );
}
