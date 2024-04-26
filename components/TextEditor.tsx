"use client";

import React, { useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import { FaCss3, FaHtml5, FaJs } from "react-icons/fa";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import Website from "./Website";
import { useStorken } from "@/data/storken";

interface FinalCode {
  html: string;
  css: string;
  js: string;
}

const TextEditor = () => {
  const [code, Code] = useStorken("code");

  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [output, setOutput] = useState("");

  console.log(code);

  useEffect(() => {
    setHtml(code.html);
    setCss(code.css);
    setJs(code.js);
  }, [code]);

  useEffect(() => {
    updateOutput();
  }, [html, css, js]);

  const updateOutput = () => {
    const combinedOutput = `
        <html> 
            <head>
                <style>${css}</style>
            <head/>
            <body>
                ${html}
                <script>${js}</script>
            <body/>
        <html/>`;
    setOutput(combinedOutput);
  };

  const onChange = React.useCallback(({ value, viewUpdate }: any) => {
    console.log("value:", value);
  }, []);
  return (
    <div className="flex flex-col">
      <div>
        <SplitPane split="horizontal" minSize={250} maxSize={-100}>
          <SplitPane split="vertical" minSize={500}>
            <div className="w-full px-2 h-full flex flex-col items-start justify-start">
              <div className="w-full  flex items-center justify-between">
                <div className="flex w-full items-center px-4 py-2 border-t-4 gap-3 justify-between bg-gray-800 ">
                  <div className="flex">
                    <FaHtml5 className="text-2xl text-red-500" />
                    <p className="text-white font-semibold ">HTML</p>
                  </div>

                  <div>1</div>
                </div>
              </div>
              <div className="w-full">
                <CodeMirror
                  theme={"dark"}
                  value={html}
                  height="200px"
                  extensions={[javascript({ jsx: true })]}
                  onChange={(value, viewUpdate) => {
                    setHtml(value);
                  }}
                />
              </div>
            </div>

            <SplitPane split="vertical" minSize={500}>
              <div className="w-full px-2 h-full flex flex-col items-start justify-start">
                <div className="flex w-full items-center px-4 py-2 border-t-4 gap-3 justify-between bg-gray-800 ">
                  <div className="flex">
                    <FaCss3 className="text-2xl text-blue-500" />
                    <p className="text-white font-semibold ">CSS</p>
                  </div>

                  <div>1</div>
                </div>

                <div className="w-full ">
                  <CodeMirror
                    theme={"dark"}
                    value={css}
                    height="200px"
                    extensions={[javascript({ jsx: true })]}
                    onChange={(value, viewUpdate) => {
                      setCss(value);
                    }}
                  />
                </div>
              </div>

              <div className="w-full h-full px-2 flex flex-col items-start justify-start">
                <div className="flex w-full items-center px-4 py-2 border-t-4 gap-3 justify-between bg-gray-800 ">
                  <div className="flex">
                    <FaJs className="text-2xl text-yellow-500" />
                    <p className="text-white font-semibold ">JS</p>
                  </div>

                  <div>1</div>
                </div>

                <div className="w-full ">
                  <CodeMirror
                    theme={"dark"}
                    value={js}
                    height="200px"
                    extensions={[javascript({ jsx: true })]}
                    onChange={(value, viewUpdate) => {
                      setJs(value);
                    }}
                  />
                </div>
              </div>
            </SplitPane>
          </SplitPane>
          <iframe
            srcDoc={output}
            title="output"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "white",
            }}
          />
        </SplitPane>
      </div>
    </div>
  );
};

export default TextEditor;
