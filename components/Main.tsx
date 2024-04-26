"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import Website from "./Website";
import { useStorken } from "@/data/storken";

interface FinalCode {
  html: string;
  css: string;
  js: string;
}

const Main = (apiData: any) => {
  const [code, Code] = useStorken("code") as any;

  console.log(apiData);

  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [output, setOutput] = useState("");

  console.log(code);

  useEffect(() => {
    if (apiData && apiData.apiData) {
      // API verisini satır satır bölelim
      const lines = apiData.apiData.split("\n");

      // HTML, CSS ve JS kodlarını depolamak için geçici değişkenler oluşturalım
      let htmlCode = "";
      let cssCode = "";
      let jsCode = "";
      let isHTMLCode = false;
      let isCSSCode = false;
      let isJSCode = false;
      let isBodyCode = false;

      lines.forEach((line: any) => {
        if (line.trim() === "```html") {
          isHTMLCode = true;
        } else if (line.trim() === "```css") {
          isHTMLCode = false;
          isCSSCode = true;
        } else if (line.trim() === "```javascript") {
          isCSSCode = false;
          isJSCode = true;
        } else if (line.trim() === "```") {
          isJSCode = false;
        } else if (isHTMLCode) {
          // <body> içindeki kodu ayıklayın
          if (line.trim() === "<body>") {
            isBodyCode = true;
          } else if (line.trim() === "</body>") {
            isBodyCode = false;
          } else if (isBodyCode) {
            htmlCode += line + "\n";
          }
        } else if (isCSSCode) {
          cssCode += line + "\n";
        } else if (isJSCode) {
          jsCode += line + "\n";
        }
      });

      // HTML, CSS ve JS kodlarını state'lere yerleştirelim
      Code.set({
        html: htmlCode,
        css: cssCode,
        js: jsCode,
      });
    }
  }, [apiData]);

  useEffect(() => {
    updateOutput();
  }, [html, css, js]);

  const updateOutput = () => {
    const combinedOutput = `
        <html> 
            <head>
                <style>
                <h1>kaan</>
                ${code.css}</style>
            <head/>
            <body>
                ${code.html}
                <script>${code.js}</script>
            <body/>
        <html/>`;
    setOutput(combinedOutput);
  };

  return (
    <div>
      <SplitPane
        split="horizontal"
        defaultSize={200}
        minSize={200}
        maxSize={500}
        style={{ position: "relative" }}
      >
        <div className="w-full h-full flex flex-col items-start justify-start">
          <Link
            className="absolute bottom-0 right-0 p-2 m-2 bg-blue-500"
            href="/Iframe"
          >
            Go to Code
          </Link>

          <Website apiData={apiData} />
        </div>

        <div></div>
      </SplitPane>
    </div>
  );
};

export default Main;
