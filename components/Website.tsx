"use client";
import React, { useEffect, useState } from "react";

const Website = (apiData: any) => {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [output, setOutput] = useState("");

  const [data, setData] = useState(null);

  useEffect(() => {
    // apiData prop'u değiştiğinde çalışacak olan bu etkileşimli işlevi kullanarak data state'ini güncelleyebiliriz.
    if (apiData) {
      setData(apiData.apiData.apiData);
    }
  }, [apiData]);

  console.log(data);
  console.log(html);
  console.log(css);
  console.log(htmlBody);

  useEffect(() => {
    const fullText = data;

    const htmlMatch = fullText?.match(/```html([\s\S]*?)```/);
    const cssMatch = fullText?.match(/```css([\s\S]*?)```/);

    if (htmlMatch && cssMatch) {
      setHtml(htmlMatch[1]);

      if (htmlMatch[1]) {
        const htmlBodyMatch = htmlMatch[1]?.match(/<body>([\s\S]*?)<\/body>/);
        setHtmlBody(htmlBodyMatch ? htmlBodyMatch[1] : "");
      } else {
        setHtmlBody("");
      }

      setCss(cssMatch[1]);
    }

    updateOutput();
  }, [data, html, css]);

  // useEffect(() => {
  //   const fullText = data; // Veriyi alın
  //   // const html = apiData.ApiData?.ApiData?.html || "";

  //   // HTML ve CSS kodlarını ayırmak için düzenli ifadeler kullanın
  //   const htmlMatch = fullText?.match(/```html([\s\S]*?)```/);
  //   const cssMatch = fullText?.match(/```css([\s\S]*?)```/);

  //   if (htmlMatch && cssMatch) {
  //     setHtml(htmlMatch[1]);

  //     if (htmlMatch[1]) {
  //       const htmlBodyMatch = htmlMatch[1]?.match(/<body>([\s\S]*?)<\/body>/);
  //       // setHtmlBody(htmlBodyMatch ? htmlBodyMatch[1] : "");
  //     } else {
  //       setHtmlBody("");
  //     }
  //     setCss(cssMatch[1]);
  //   }
  // }, [apiData]);

  useEffect(() => {
    updateOutput();
  }, [html, css]);

  useEffect(() => {
    console.log(html);
  }, [html, css]);

  const updateOutput = () => {
    const combinedOutput = `
          <html>
              <head>
                  <style>${css}</style>
              </head>
              <body>
                  ${html}
              </body>
          </html>`;
    setOutput(combinedOutput);
  };

  useEffect(() => {
    updateOutput();
  }, [apiData]);

  return (
    <div className={`h-full bg-white w-full`}>
      <iframe
        className="z-50"
        srcDoc={output}
        title="output"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
};

export default Website;
