import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  //console.log(process.env.EDENAI_API_KEY)
  const res = await fetch("https://api.edenai.run/v2/text/code_generation", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzRlYzkzMTktMWJhMC00YmM1LWFhODEtNWRhNzY2YjVlNWM3IiwidHlwZSI6ImFwaV90b2tlbiJ9.gMKJohWm-S_nTN8QaYbLupDsglPd-p2bST_zDaeLWT8",
    },
    body: JSON.stringify({
      response_as_dict: true,
      attributes_as_list: false,
      show_original_response: false,
      temperature: 0,
      max_tokens: 1000,
      instruction:
        "\"You are a excellent HTML, CSS and JS coder. Provide the codes you wrote with html, css and js separately. just do what you're told , Just write the code and don't write any explanations or sentences. , No any explanations\",",

      prompt: `${text.query}`,
      providers: "openai",
      // body: JSON.stringify({
      //   response_as_dict: true,
      //   attributes_as_list: false,
      //   show_original_response: false,
      //   temperature: 0.5,
      //   max_tokens: 1000,
      //   instruction: `${text}`,
      // text: `${text}. Provide the codes you wrote with html and css separately. Just write the code and don't write any explanations or sentences.`,
      // chatbot_global_action: "You are a excellent HTML and CSS coder.",
    }),
  });
  const data = await res.json();
  console.log(data);

  return NextResponse.json(data.openai.generated_text);
}
