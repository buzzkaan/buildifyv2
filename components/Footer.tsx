"use client";
import React, { useEffect, useState } from "react";

const Footer = ({ onSearchQueryChange, onDataReceived }: any) => {
  const [query, setQuery] = useState("");
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: any) => {
    e.preventDefault();
    onSearchQueryChange(query);
    handlePush(query);
    console.log(query);
  };

  useEffect(() => {
    if (apiData) {
      onDataReceived(apiData);
      setIsLoading(false); // data geldiğinde loading durumunu sıfırla
    }
  }, [apiData, onDataReceived]);

  const handlePush = async (query: any) => {
    setIsLoading(true); // istek gönderildiğinde loading durumunu true yap

    fetch("http://localhost:3000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: { query },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        onDataReceived(data);
        setApiData(data);
      })
      .finally(() => {
        setIsLoading(false); // istek tamamlandığında loading durumunu false yap
      });
  };

  return (
    <div>
      <form>
        <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search..."
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {isLoading ? (
            <div className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Loading...
            </div>
          ) : (
            <button
              onClick={handleSearch}
              type="submit"
              className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Search
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Footer;
